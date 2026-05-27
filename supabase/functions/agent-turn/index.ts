import { createClient } from 'npm:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@^0.32.1';
import { z } from 'npm:zod@^3.23.8';
import { agentTools } from './tools.ts';
import { buildSystemPrompt } from './systemPrompt.ts';

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
interface AdminContact {
  name: string;
  extension: string | null;
}

interface HelpfulStaff {
  name: string;
  role: string;
}

interface Activity {
  title: string;
  duration_min: number;
  start_time: string | null;
  end_time: string | null;
  instructions: string;
  materials: string[];
  period_key: string | null;
  grade_label: string | null;
}

interface Attachment {
  file_id: string;
  role: string;
  note_for_sub: string | null;
}

interface AgentState {
  template_id: string;

  // School info
  school_name: string | null;
  school_year: string | null;
  date: string | null;

  // Teacher info
  grade: string | null;
  subject: string | null;
  grades_covered: string[];

  // Admin contacts
  principal: AdminContact | null;
  assistant_principal: AdminContact | null;
  school_counselor: AdminContact | null;
  school_psychologist: AdminContact | null;

  // Helpful staff
  helpful_staff: HelpfulStaff[];

  // Classroom logistics
  emergency_procedures: string | null;
  health_concerns: string | null;
  bathroom_rules: string | null;
  behavior_management: string | null;
  special_instructions: string | null;
  nurses_office: string | null;

  // Lesson content
  unit: { unit_name: string; standard_codes: string[] } | null;
  activities: Activity[];
  attachments: Attachment[];

  // Closing
  sign_off: string | null;

  // Meta
  finalized: boolean;
  sub_plan_id: string | null;
}

function defaultState(): AgentState {
  return {
    template_id: 'standard-day',
    school_name: null,
    school_year: null,
    date: null,
    grade: null,
    subject: null,
    grades_covered: [],
    principal: null,
    assistant_principal: null,
    school_counselor: null,
    school_psychologist: null,
    helpful_staff: [],
    emergency_procedures: null,
    health_concerns: null,
    bathroom_rules: null,
    behavior_management: null,
    special_instructions: null,
    nurses_office: null,
    unit: null,
    activities: [],
    attachments: [],
    sign_off: null,
    finalized: false,
    sub_plan_id: null,
  };
}

function asContact(raw: unknown): AdminContact | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r['name'] !== 'string') return null;
  return {
    name: r['name'],
    extension: typeof r['extension'] === 'string' ? r['extension'] : null,
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
    case 'set_school_info': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: {
          ...state,
          school_name: (input['school_name'] as string | undefined) ?? state.school_name,
          date: (input['date'] as string | undefined) ?? state.date,
          school_year: (input['school_year'] as string | undefined) ?? state.school_year,
        },
      };
    }

    case 'set_admin_contacts': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: {
          ...state,
          principal: asContact(input['principal']) ?? state.principal,
          assistant_principal: asContact(input['assistant_principal']) ?? state.assistant_principal,
          school_counselor: asContact(input['school_counselor']) ?? state.school_counselor,
          school_psychologist: asContact(input['school_psychologist']) ?? state.school_psychologist,
        },
      };
    }

    case 'set_grade_level': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, grade: input['grade'] as string },
      };
    }

    case 'set_grades_covered': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, grades_covered: (input['grades'] as string[]) ?? [] },
      };
    }

    case 'set_subject': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, subject: input['subject'] as string },
      };
    }

    case 'set_unit': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: {
          ...state,
          unit: {
            unit_name: input['unit_name'] as string,
            standard_codes: (input['standard_codes'] as string[]) ?? [],
          },
        },
      };
    }

    case 'add_helpful_staff': {
      const member: HelpfulStaff = {
        name: input['name'] as string,
        role: input['role'] as string,
      };
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, helpful_staff: [...state.helpful_staff, member] },
      };
    }

    case 'set_emergency_procedures': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, emergency_procedures: input['text'] as string },
      };
    }

    case 'set_health_concerns': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, health_concerns: input['text'] as string },
      };
    }

    case 'set_bathroom_rules': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, bathroom_rules: input['text'] as string },
      };
    }

    case 'set_behavior_management': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, behavior_management: input['text'] as string },
      };
    }

    case 'set_nurses_office': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, nurses_office: input['text'] as string },
      };
    }

    case 'set_special_instructions': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, special_instructions: input['text'] as string },
      };
    }

    case 'set_sign_off': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, sign_off: input['message'] as string },
      };
    }

    case 'add_activity': {
      const activity: Activity = {
        title: input['title'] as string,
        duration_min: input['duration_min'] as number,
        start_time: (input['start_time'] as string | undefined) ?? null,
        end_time: (input['end_time'] as string | undefined) ?? null,
        instructions: input['instructions'] as string,
        materials: (input['materials'] as string[] | undefined) ?? [],
        period_key: (input['period_key'] as string | undefined) ?? null,
        grade_label: (input['grade_label'] as string | undefined) ?? null,
      };
      const activities = [...state.activities, activity];
      return {
        result: JSON.stringify({ ok: true, activity_count: activities.length }),
        newState: { ...state, activities },
      };
    }

    case 'save_to_profile': {
      const school_info = {
        school_name: state.school_name,
        school_year: state.school_year,
        grade: state.grade,
        subject: state.subject,
        grades_covered: state.grades_covered,
        principal: state.principal,
        assistant_principal: state.assistant_principal,
        school_counselor: state.school_counselor,
        school_psychologist: state.school_psychologist,
        helpful_staff: state.helpful_staff,
        emergency_procedures: state.emergency_procedures,
        health_concerns: state.health_concerns,
        bathroom_rules: state.bathroom_rules,
        behavior_management: state.behavior_management,
        nurses_office: state.nurses_office,
        special_instructions: state.special_instructions,
      };
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ school_info, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (profileError) {
        console.error('[agent-turn] Failed to save profile:', profileError);
        return { result: JSON.stringify({ ok: false, error: profileError.message }), newState: state };
      }
      return { result: JSON.stringify({ ok: true }), newState: state };
    }

    case 'request_template': {
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, template_id: input['template_id'] as string },
      };
    }

    case 'attach_existing_file': {
      const attachment: Attachment = {
        file_id: input['file_id'] as string,
        role: input['role'] as string,
        note_for_sub: (input['note_for_sub'] as string | undefined) ?? null,
      };
      return {
        result: JSON.stringify({ ok: true }),
        newState: { ...state, attachments: [...state.attachments, attachment] },
      };
    }

    case 'finalize_plan': {
      // Check usage cap via service role (RPC is restricted to service role).
      const adminClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      const { data: usageRows } = await adminClient.rpc('increment_plan_usage', { p_user_id: userId });
      const usage = Array.isArray(usageRows) ? (usageRows[0] as { allowed: boolean; cap: number } | undefined) : null;
      // cap === 0 means no subscription exists (pre-Stripe) — allow through.
      if (usage && !usage.allowed && usage.cap > 0) {
        return {
          result: JSON.stringify({ ok: false, error: 'Monthly plan limit reached. Upgrade your plan to create more.' }),
          newState: state,
        };
      }

      const grade = state.grade ?? state.grades_covered.join(', ') ?? 'Unknown Grade';
      const subject = state.subject ?? 'Sub Plan';
      const today = new Date().toISOString().split('T')[0];
      const planDate = state.date ?? today;
      const title = `${subject} — Grade ${grade} — ${planDate}`;

      const content = {
        school_name: state.school_name,
        school_year: state.school_year,
        date: state.date,
        grade: state.grade,
        subject: state.subject,
        grades_covered: state.grades_covered,
        principal: state.principal,
        assistant_principal: state.assistant_principal,
        school_counselor: state.school_counselor,
        school_psychologist: state.school_psychologist,
        helpful_staff: state.helpful_staff,
        emergency_procedures: state.emergency_procedures,
        health_concerns: state.health_concerns,
        bathroom_rules: state.bathroom_rules,
        behavior_management: state.behavior_management,
        special_instructions: state.special_instructions,
        nurses_office: state.nurses_office,
        unit: state.unit,
        activities: state.activities,
        attachments: state.attachments,
        sign_off: state.sign_off,
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

const MAX_TOOL_ROUNDS = 15;

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

    // ── Rate limiting ─────────────────────────────────────────────────
    // New-session rate: max 5 plan sessions started per user per hour.
    if (!session_id) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('agent_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', oneHourAgo);
      if ((count ?? 0) >= 5) {
        return new Response(
          JSON.stringify({ error: 'Too many plans started this hour. Please wait before creating another.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    }

    // Fetch profile before session branch so we can pre-populate new sessions.
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('school_info')
      .eq('id', user.id)
      .single();
    const storedSchoolInfo = (profileRow as { school_info?: unknown } | null)?.school_info ?? null;

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

      // Message cap: prevent runaway sessions from accumulating indefinitely.
      if (priorMessages.length >= 100) {
        return new Response(
          JSON.stringify({ error: 'This session has reached its message limit. Please finalize your plan or start a new one.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
    } else {
      const { data, error } = await supabase
        .from('agent_sessions')
        .insert({ user_id: user.id })
        .select('id, messages, state')
        .single();

      if (error || !data) {
        console.error('[agent-turn] Failed to create session:', error);
        return new Response(
          JSON.stringify({ error: `Session create failed: ${error?.message ?? 'unknown'}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const row = data as { id: string; messages: unknown; state: unknown };
      sessionId = row.id;
      priorMessages = [];
      // Pre-populate state from stored profile so set_* tools confirm rather than re-collect.
      const si = storedSchoolInfo as Record<string, unknown> | null;
      currentState = si ? {
        ...defaultState(),
        school_name: (si['school_name'] as string | null) ?? null,
        school_year: (si['school_year'] as string | null) ?? null,
        grade: (si['grade'] as string | null) ?? null,
        subject: (si['subject'] as string | null) ?? null,
        grades_covered: Array.isArray(si['grades_covered']) ? si['grades_covered'] as string[] : [],
        principal: asContact(si['principal']) ,
        assistant_principal: asContact(si['assistant_principal']),
        school_counselor: asContact(si['school_counselor']),
        school_psychologist: asContact(si['school_psychologist']),
        helpful_staff: Array.isArray(si['helpful_staff']) ? si['helpful_staff'] as HelpfulStaff[] : [],
        emergency_procedures: (si['emergency_procedures'] as string | null) ?? null,
        health_concerns: (si['health_concerns'] as string | null) ?? null,
        bathroom_rules: (si['bathroom_rules'] as string | null) ?? null,
        behavior_management: (si['behavior_management'] as string | null) ?? null,
        nurses_office: (si['nurses_office'] as string | null) ?? null,
        special_instructions: (si['special_instructions'] as string | null) ?? null,
      } : defaultState();
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
    const systemPrompt = buildSystemPrompt(
      storedSchoolInfo as Parameters<typeof buildSystemPrompt>[0],
    );

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
        system: systemPrompt,
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

    // ── Draft auto-save ──────────────────────────────────────────────
    // Keep a live draft record in sub_plans so users can resume from
    // the Plans tab. Delete it once the plan is finalized (the final
    // record was already inserted by finalize_plan).
    const hasMeaningfulContent = !!(
      currentState.school_name ||
      currentState.grade ||
      currentState.grades_covered.length > 0 ||
      currentState.activities.length > 0
    );

    if (!currentState.finalized && hasMeaningfulContent) {
      const grade = currentState.grade ?? currentState.grades_covered[0] ?? null;
      const subject = currentState.subject ?? null;
      const draftTitle = [
        subject,
        grade ? `Grade ${grade}` : null,
        '(Draft)',
      ].filter(Boolean).join(' — ') || 'Untitled Draft';

      // Check whether a draft already exists for this session
      const { data: existingDraft } = await supabase
        .from('sub_plans')
        .select('id')
        .eq('agent_session_id', sessionId)
        .eq('status', 'draft')
        .maybeSingle();

      if (existingDraft) {
        await supabase
          .from('sub_plans')
          .update({
            title: draftTitle,
            grade: currentState.grade,
            subject: currentState.subject,
            template_id: currentState.template_id,
            content: currentState,
          })
          .eq('id', (existingDraft as { id: string }).id);
      } else {
        await supabase.from('sub_plans').insert({
          user_id: userId,
          title: draftTitle,
          grade: currentState.grade,
          subject: currentState.subject,
          template_id: currentState.template_id,
          content: currentState,
          status: 'draft',
          agent_session_id: sessionId,
        });
      }
    } else if (currentState.finalized) {
      // Remove the draft stub now that the final record exists
      await supabase
        .from('sub_plans')
        .delete()
        .eq('agent_session_id', sessionId)
        .eq('status', 'draft');
    }

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
    const message = err instanceof Error ? err.message : String(err);
    console.error('[agent-turn] Unexpected error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
