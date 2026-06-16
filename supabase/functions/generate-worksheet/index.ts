import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@^3.23.8';

// Anthropic import is present now so the TODO section can drop it in without
// touching the import block.
// import Anthropic from 'npm:@anthropic-ai/sdk@^0.32.1';

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

// ── Response types (mirrors src/types/worksheet.ts) ──────────────────────────

interface WorksheetItem {
  prompt: string;
  answer: string | null;
  options: string[] | null;
}

interface WorksheetResponse {
  request_echo: z.infer<typeof worksheetRequestSchema>;
  title: string;
  instructions: string;
  items: WorksheetItem[];
  generated_at: string;
}

// ── Handler ───────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
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

    // ── Parse + validate ──────────────────────────────────────────────────────
    const body = await req.json() as unknown;
    const parsed = worksheetRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid request', details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const worksheetRequest = parsed.data;
    console.log('[generate-worksheet] Request from', user.id, JSON.stringify(worksheetRequest));

    // ── TODO: Claude generation ───────────────────────────────────────────────
    //
    // const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
    //
    // Steps to implement:
    //  1. Build a system prompt from worksheetRequest (category, tone, grade_band).
    //     The tone drives framing: engaging adds a story/character wrapper,
    //     plain strips all decoration, assessment uses formal neutral language.
    //  2. Build a user prompt describing the specific skill and item_count.
    //     If tone === 'engaging' and theme is non-null, weave the theme through.
    //  3. Call anthropic.messages.create() requesting structured JSON output
    //     matching the WorksheetResponse items array.
    //  4. Parse and validate the model's JSON response.
    //  5. If include_answer_key is false, strip answer fields before returning.
    //
    // See supabase/functions/agent-turn/index.ts for the auth + call pattern.
    // ─────────────────────────────────────────────────────────────────────────

    return new Response(
      JSON.stringify({ error: 'Worksheet generation not yet implemented.' }),
      { status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[generate-worksheet] Unexpected error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
