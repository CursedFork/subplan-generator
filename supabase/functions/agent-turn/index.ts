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

// =====================================================================
// Agent state — accumulated across tool calls within and between turns.
// =====================================================================
interface Activity {
  title: string;
  duration_min: number;
  instructions: string;
  materials: string[];
  period_key: string | null;
}

interface Attachment {
  file_id: string;
  role: string;
  note_for_sub: string | null;
}

interface AgentState {
  template_id: string;
  grade: string | null;
  subject: string | null;
  unit: { unit_name: string; standard_codes: string[] } | null;
  activities: Activity[];
  attachments: Attachment[];
  finalized: boolean;
  sub_plan_id: string | null;
}

function defaultState(): AgentState {
  return {
    template_id: 'standard-day',
    grade: null,
    subject: null,
    unit: null,
    activities: [],
    attachments: [],
    finalized: false,
    sub_plan_id: null,
  };
}

// =====================================================================
// Real tool handlers
// =====================================================================
async function handleTool(
  name: string,
  input: Record<string, unknown>,
  state: AgentState,
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<{ result: string; newState: AgentState }> {
  switch (name) {
    case 'set_grade_level': {
      const grade = input['grade'] as string;
      return {
        result: JSON.stringify({ ok: true, grade }),
        newState: { ...state, grade },
      };
    }

    case 'set_subject': {
      const subject = input['subject'] as string;
      return {
        result: JSON.stringify({ ok: true, subject }),
        newState: { ...state, subject },
      };
    }

    case 'set_unit': {
      const unit = {
        unit_name: input['unit_name'] as string,
        standard_codes: (input['standard_codes'] as string[]) ?? [],
      };
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, unit },
      };
    }

    case 'add_activity': {
      const activity: Activity = {
        title: input['title'] as string,
        duration_min: input['duration_min'] as number,
        instructions: input['instructions'] as string,
        materials: (input['materials'] as string[]) ?? [],
        period_key: (input['period_key'] as string) ?? null,
      };
      const activities = [...state.activities, activity];
      return {
        result: JSON.stringify({ ok: true, activity_count: activities.length }),
        newState: { ...state, activities },
      };
    }

    case 'request_template': {
      const template_id = input['template_id'] as string;
      return {
        result: JSON.stringify({ ok: true, template_id }),
        newState: { ...state, template_id },
      };
    }

    case 'attach_existing_file': {
      const attachment: Attachment = {
        file_id: input['file_id'] as string,
        role: input['role'] as string,
        note_for_sub: (input['note_for_sub'] as string) ?? null,
      };
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, attachments: [...state.attachments, attachment] },
      };
    }

    case 'finalize_plan': {
      const grade = state.grade ?? 'Unknown Grade';
      const subject = state.subject ?? 'Sub Plan';
      const today = new Date().toISOString().split('T')[0];
      const title = `${subject} — Grade ${grade} — ${today}`;

      const content = {
        grade: state.grade,
        subject: state.subject,
        unit: state.unit,
        activities: state.activities,
        attachments: state.attachments,
      };

      const { data: plan, error } = await supabase
        .from('sub_plans')
        .insert({
          user_id: userId,
          title,
          grade: state.grade,
          subject: state.subject,
          unit: state.unit?.unit_name ?? null,
          template_id: state.template_id,
          content,
          status: 'final',
        })
        .select('id')
        .single();

      if (error || !plan) {
        console.error('[agent-turn] Failed to create sub_plan:', error);
        return {
          result: JSON.stringify({ ok: false, error: 'Failed to save plan' }),
          newState: state,
        };
      }

      const sub_plan_id = (plan as { id: string }).id;
      return {
        result: JSON.stringify({ ok: true, sub_plan_id }),
        newState: { ...state, finalized: true, sub_plan_id },
      };
    }

    default:
      console.log(`[agent-turn] Unknown tool: ${name}`, input);
      return { result: JSON.stringify({ ok: true }), newState: state };
  }
}

const MAX_TOOL_ROUNDS = 10;

type MessageParam = Anthropic.Messages.MessageParam;
type ToolResultBlockParam = Anthropic.Messages.ToolResultBlockParam;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const body = await req.json() as unknown;
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { session_id, user_message } = parsed.data;

    let sessionId: string;
    let priorMessages: MessageParam[];
    let currentState: AgentState;

    if (session_id) {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('id, messages, state')
        .eq('id', session_id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Session not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const row = data as { id: string; messages: unknown; state: unknown };
      sessionId = row.id;
      priorMessages = Array.isArray(row.messages) ? (row.messages as MessageParam[]) : [];
      currentState = (row.state && typeof row.state === 'object' && !Array.isArray(row.state))
        ? (row.state as AgentState)
        : defaultState();
    } else {
      const { data, error } = await supabase
        .from('agent_sessions')
        .insert({ user_id: user.id })
        .select('id, messages, state')
        .single();

      if (error || !data) {
        console.error('[agent-turn] Failed to create session:', error);
        return new Response(JSON.stringify({ error: 'Something went wrong' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const row = data as { id: string; messages: unknown; state: unknown };
      sessionId = row.id;
      priorMessages = [];
      currentState = defaultState();
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    const messages: MessageParam[] = [
      ...priorMessages,
      { role: 'user', content: user_message },
    ];

    let finalAssistantMessage = '';
    const firedToolNames: string[] = [];
    let rounds = 0;

    while (rounds < MAX_TOOL_ROUNDS) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        system: agentSystemPrompt,
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

      const toolResults: ToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type === 'tool_use') {
          firedToolNames.push(block.name);
          const { result, newState } = await handleTool(
            block.name,
            block.input as Record<string, unknown>,
            currentState,
            supabase,
            user.id,
          );
          currentState = newState;
          toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result });
        }
      }

      messages.push({ role: 'user', content: toolResults });
      rounds++;
    }

    // Persist messages + updated state, and link sub_plan_id if finalized.
    const updatePayload: Record<string, unknown> = { messages, state: currentState };
    if (currentState.sub_plan_id) {
      updatePayload['sub_plan_id'] = currentState.sub_plan_id;
    }

    const { error: updateError } = await supabase
      .from('agent_sessions')
      .update(updatePayload)
      .eq('id', sessionId);

    if (updateError) console.error('[agent-turn] Failed to persist session:', updateError);

    return new Response(
      JSON.stringify({
        session_id: sessionId,
        assistant_message: finalAssistantMessage,
        tool_calls: firedToolNames,
        state: currentState,
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
