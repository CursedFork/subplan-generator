import { createClient } from 'npm:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@^0.32.1';
import { z } from 'npm:zod@^3.23.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Request schema (mirrors src/types/worksheet.ts) ──────────────────────────

const gradeBandSchema = z.enum(['K-2', '3-5', '6-8', '9-12']);
const toneSchema = z.enum(['engaging', 'plain', 'assessment']);
const categorySchema = z.enum([
  'math-facts',
  'word-problems',
  'reading-comprehension',
  'vocabulary-matching',
  'fill-in-the-blank',
  'graphic-organizer',
  'short-answer',
  'multiple-choice',
]);

const worksheetRequestSchema = z.object({
  subject:            z.string().min(1).max(100),
  grade_band:         gradeBandSchema,
  skill:              z.string().min(1).max(200),
  category:           categorySchema,
  tone:               toneSchema,
  item_count:         z.number().int().min(5).max(30),
  include_answer_key: z.boolean(),
  theme:              z.string().max(100).nullable(),
});

type WorksheetRequest = z.infer<typeof worksheetRequestSchema>;

// ── Tool input schema — validates what Claude returns ────────────────────────

const worksheetItemInputSchema = z.object({
  prompt:  z.string().min(1),
  answer:  z.string().nullable().optional(),
  options: z.array(z.string()).min(2).max(6).nullable().optional(),
});

const createWorksheetInputSchema = z.object({
  title:        z.string().min(1),
  instructions: z.string().min(1),
  items:        z.array(worksheetItemInputSchema).min(1).max(35),
});

// ── Anthropic tool definition ─────────────────────────────────────────────────

const CREATE_WORKSHEET_TOOL: Anthropic.Tool = {
  name: 'create_worksheet',
  description: 'Output the completed, structured worksheet data.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: {
        type: 'string',
        description: 'The worksheet title shown at the top of the page.',
      },
      instructions: {
        type: 'string',
        description:
          'Student-facing directions shown before the items. For reading-comprehension, place the full passage here.',
      },
      items: {
        type: 'array',
        description: 'The worksheet items, one per question or problem.',
        items: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The question, problem, or sentence presented to the student.',
            },
            answer: {
              type: 'string',
              description: 'The correct answer.',
            },
            options: {
              type: 'array',
              description:
                'Exactly 4 plain-text answer choices for multiple-choice ONLY (no A/B/C/D prefix). Omit for all other categories.',
              items: { type: 'string' },
            },
          },
          required: ['prompt', 'answer'],
        },
      },
    },
    required: ['title', 'instructions', 'items'],
  },
};

// ── Prompt builders ───────────────────────────────────────────────────────────

function buildSystemPrompt(tone: WorksheetRequest['tone']): string {
  const toneGuidance: Record<WorksheetRequest['tone'], string> = {
    engaging:
      'You are a creative K–12 worksheet writer. Wrap every item in the requested story or theme: introduce specific characters and a scenario in the title and instructions, then sustain that same world through every single problem. The skill content stays rigorous; the theme is the delivery vehicle, not decoration.',
    plain:
      'You are a K–12 worksheet writer. Be spare and direct: no stories, no decoration, no filler. Every word serves the skill. Instructions are one clear sentence. Items state the problem and nothing else.',
    assessment:
      'You are a K–12 test-item writer. Your items read like a state standardized test: neutral vocabulary, no hints embedded in the stem, plausible distractors that represent real student misconceptions. No decorative language.',
  };

  return `${toneGuidance[tone]} Always call the create_worksheet tool with your complete response — never output plain text.`;
}

function buildUserPrompt(req: WorksheetRequest): string {
  const categoryLabel: Record<WorksheetRequest['category'], string> = {
    'math-facts':            'Math Facts Drill',
    'word-problems':         'Word Problems',
    'reading-comprehension': 'Reading Comprehension',
    'vocabulary-matching':   'Vocabulary Matching',
    'fill-in-the-blank':     'Fill in the Blank',
    'graphic-organizer':     'Graphic Organizer',
    'short-answer':          'Short Answer',
    'multiple-choice':       'Multiple Choice',
  };

  const categoryGuidance: Record<WorksheetRequest['category'], string> = {
    'math-facts':
      `Each item is a single arithmetic expression with a blank for the answer (e.g. "7 × 8 = ___"). Vary the operands across the grade-appropriate range. Do not repeat the same pair. The 'answer' field is the numeric result as a string.`,
    'word-problems':
      `Each item is a self-contained word problem (2–4 sentences) followed by a clear question. The 'answer' is the result with units (e.g. "24 apples"). Every item introduces its own scenario — none share characters or context.`,
    'reading-comprehension':
      `Write an original passage (150–250 words, grade-appropriate) about the skill topic. Place the FULL passage in the 'instructions' field — do not split it across items. Then generate exactly ${req.item_count} comprehension questions as items, progressing from literal recall to inferential reasoning. 'answer' is a model response for each question.`,
    'vocabulary-matching':
      `Each item pairs a vocabulary word (in 'prompt') with its definition or a context sentence (in 'answer'). Choose a mix of content-specific terms and academic vocabulary directly relevant to the skill.`,
    'fill-in-the-blank':
      `Each item is a sentence with one key word replaced by "___". Put a comma-separated word bank of ALL missing words in the 'instructions' field. The 'answer' for each item is the single missing word or phrase.`,
    'graphic-organizer':
      `Put a one-sentence description of the organizer layout in 'instructions' (e.g. "Venn diagram with circles labeled 'Plants' and 'Animals'" or "T-chart with columns 'Cause' and 'Effect'"). Each item is a label or prompt for one section of the organizer; 'answer' is the expected content for that section.`,
    'short-answer':
      `Each item is an open-ended question requiring a 1–3 sentence response. Progress from knowledge and recall (first third of items) to analysis and synthesis (last third). 'answer' is a concise model response.`,
    'multiple-choice':
      `Each item has a clear question stem in 'prompt', exactly 4 plain-text answer choices in 'options' (no A/B/C/D prefix — the renderer adds labels), and 'answer' is the FULL TEXT of the correct option exactly as it appears in 'options'. Distractors must represent common misconceptions. Avoid "all of the above" and "none of the above".`,
  };

  const gradeBandGuidance: Record<WorksheetRequest['grade_band'], string> = {
    'K-2':  'Simple, concrete vocabulary. Short sentences. Numbers within 100 for arithmetic.',
    '3-5':  'Grade-level academic vocabulary. Multi-step problems are appropriate.',
    '6-8':  'Content-specific and Tier 2 vocabulary. Abstract concepts are fair game.',
    '9-12': 'Sophisticated vocabulary and nuanced reasoning. May reference data or multi-step analysis.',
  };

  const lines = [
    `Generate a ${categoryLabel[req.category]} worksheet.`,
    `Subject: ${req.subject}`,
    `Grade band: ${req.grade_band}`,
    `Skill: ${req.skill}`,
    `Number of items: exactly ${req.item_count}`,
  ];

  if (req.tone === 'engaging' && req.theme) {
    lines.push(`Theme: ${req.theme}`);
  }

  lines.push('', `Category instructions: ${categoryGuidance[req.category]}`);
  lines.push('', `Grade band guidance: ${gradeBandGuidance[req.grade_band]}`);

  return lines.join('\n');
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } },
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    // ── Parse + validate ──────────────────────────────────────────────────────
    const body = await req.json() as unknown;
    const parsed = worksheetRequestSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Invalid request', details: parsed.error.flatten() }, 400);
    }

    const worksheetRequest = parsed.data;
    console.log('[generate-worksheet] user:', user.id, JSON.stringify(worksheetRequest));

    // ── Claude generation ─────────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: buildSystemPrompt(worksheetRequest.tone),
      tools: [CREATE_WORKSHEET_TOOL],
      tool_choice: { type: 'tool', name: 'create_worksheet' },
      messages: [{ role: 'user', content: buildUserPrompt(worksheetRequest) }],
    });

    // ── Extract tool result ───────────────────────────────────────────────────
    const toolBlock = message.content.find(
      (b): b is Anthropic.ToolUseBlock =>
        b.type === 'tool_use' && b.name === 'create_worksheet',
    );
    if (!toolBlock) {
      console.error('[generate-worksheet] No tool_use block', JSON.stringify(message.content));
      return json({ error: 'Model did not return worksheet data.' }, 500);
    }

    const toolParsed = createWorksheetInputSchema.safeParse(toolBlock.input);
    if (!toolParsed.success) {
      console.error('[generate-worksheet] Invalid tool input', JSON.stringify(toolParsed.error.flatten()));
      return json({ error: 'Invalid worksheet structure from model.', details: toolParsed.error.flatten() }, 500);
    }

    const { title, instructions, items: rawItems } = toolParsed.data;

    // ── Apply answer key setting ──────────────────────────────────────────────
    const items = rawItems.map(item => ({
      prompt:  item.prompt,
      answer:  worksheetRequest.include_answer_key ? (item.answer ?? null) : null,
      options: item.options ?? null,
    }));

    const result = {
      request_echo: worksheetRequest,
      title,
      instructions,
      items,
      generated_at: new Date().toISOString(),
    };

    console.log('[generate-worksheet] Success, items:', items.length);
    return json(result, 200);

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[generate-worksheet] Unexpected error:', message);
    return json({ error: message }, 500);
  }
});
