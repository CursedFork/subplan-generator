import { createClient } from 'npm:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk';
import { z } from 'npm:zod';
import { agentTools } from './tools.ts';
import { agentSystemPrompt } from './systemPrompt.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const requestSchema = z.object({
  session_id: z.string().uuid().optional(),
  user_message: z.string().min(1).max(4000),
});

// Stubbed tool handler — replaced with real DB writes in a later increment.
async function handleTool(name: string, input: unknown): Promise<string> {
  console.log(`[stub] Tool called: ${name}`, input);
  return JSON.stringify({ ok: true, stub: true });
}

const MAX_TOOL_ROUNDS = 10;

type MessageParam = Anthropic.Messages.MessageParam;
type ToolResultBlockParam = Anthropic.Messages.ToolResultBlockParam;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // User-scoped client — RLS enforced via the user's JWT.
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate request body.
    const body = await req.json() as unknown;
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { session_id, user_message } = parsed.data;

    // Load or create the agent_sessions row.
    let sessionId: string;
    let priorMessages: MessageParam[];

    if (session_id) {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('id, messages')
        .eq('id', session_id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Session not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const row = data as { id: string; messages: unknown };
      sessionId = row.id;
      priorMessages = Array.isArray(row.messages) ? (row.messages as MessageParam[]) : [];
    } else {
      const { data, error } = await supabase
        .from('agent_sessions')
        .insert({ user_id: user.id })
        .select('id, messages')
        .single();

      if (error || !data) {
        console.error('[agent-turn] Failed to create session:', error);
        return new Response(JSON.stringify({ error: 'Something went wrong' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const row = data as { id: string; messages: unknown };
      sessionId = row.id;
      priorMessages = [];
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    // Build conversation: prior history + new user turn.
    const messages: MessageParam[] = [
      ...priorMessages,
      { role: 'user', content: user_message },
    ];

    let finalAssistantMessage = '';
    const firedToolNames: string[] = [];
    let rounds = 0;

    // Tool-use loop — hard cap at MAX_TOOL_ROUNDS to prevent runaway turns.
    while (rounds < MAX_TOOL_ROUNDS) {
      // TODO(models): Verify model string against Anthropic docs at wire-up time.
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        system: agentSystemPrompt,
        // agentTools is `as const` — cast required to satisfy SDK's Tool[] type.
        tools: agentTools as unknown as Anthropic.Messages.Tool[],
        messages,
        max_tokens: 4096,
      });

      messages.push({ role: 'assistant', content: response.content });

      if (response.stop_reason !== 'tool_use') {
        for (const block of response.content) {
          if (block.type === 'text') {
            finalAssistantMessage = block.text;
            break;
          }
        }
        break;
      }

      // Dispatch each tool call to the stub handler.
      const toolResults: ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          firedToolNames.push(block.name);
          const result = await handleTool(block.name, block.input);
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }
      }

      messages.push({ role: 'user', content: toolResults });
      rounds++;
    }

    // Persist the updated message history.
    const { error: updateError } = await supabase
      .from('agent_sessions')
      .update({ messages })
      .eq('id', sessionId);

    if (updateError) {
      console.error('[agent-turn] Failed to persist messages:', updateError);
    }

    return new Response(
      JSON.stringify({
        session_id: sessionId,
        assistant_message: finalAssistantMessage,
        tool_calls: firedToolNames,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[agent-turn] Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
