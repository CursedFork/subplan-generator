// Tool schemas for the agent. Each tool maps to a state update on
// agent_sessions.state and (for finalize_plan) triggers rendering.

export const agentTools = [
  {
    name: 'set_grade_level',
    description:
      'Record the grade level for this sub plan. Call once the teacher has stated it. ' +
      'Use K, 1-12, or a comma-separated list for multi-grade classes.',
    input_schema: {
      type: 'object',
      properties: {
        grade: { type: 'string', description: 'Grade level, e.g. "3" or "K" or "9-10".' },
      },
      required: ['grade'],
    },
  },
  {
    name: 'set_subject',
    description: 'Record the primary subject for this plan or period.',
    input_schema: {
      type: 'object',
      properties: {
        subject: { type: 'string', description: 'e.g. "Math", "ELA", "Science".' },
      },
      required: ['subject'],
    },
  },
  {
    name: 'set_unit',
    description:
      'Record the curricular unit. standard_codes MUST come from the standards adapter ' +
      'results provided in context — never invent a code.',
    input_schema: {
      type: 'object',
      properties: {
        unit_name: { type: 'string' },
        standard_codes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Codes returned by the standards adapter. Empty array if none found.',
        },
      },
      required: ['unit_name', 'standard_codes'],
    },
  },
  {
    name: 'add_activity',
    description:
      'Append one activity to the current period or block. For Emergency template, ' +
      'activities must require no advance prep.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        duration_min: { type: 'integer', minimum: 1, maximum: 180 },
        instructions: {
          type: 'string',
          description:
            'Step-by-step, written for someone who has never met the class. ' +
            'Assume zero context.',
        },
        materials: { type: 'array', items: { type: 'string' } },
        period_key: {
          type: 'string',
          description:
            'For multi-period templates, which period this belongs to. Omit for single-period.',
        },
      },
      required: ['title', 'duration_min', 'instructions'],
    },
  },
  {
    name: 'attach_existing_file',
    description:
      'Attach a previously uploaded file to this plan. file_id must reference a row in ' +
      'attachments owned by the current user. role describes how the sub should use it.',
    input_schema: {
      type: 'object',
      properties: {
        file_id: { type: 'string', format: 'uuid' },
        role: {
          type: 'string',
          enum: ['worksheet', 'reference', 'image', 'answer_key', 'reading'],
        },
        note_for_sub: {
          type: 'string',
          description: 'One sentence on how the sub should use this file.',
        },
      },
      required: ['file_id', 'role'],
    },
  },
  {
    name: 'request_template',
    description:
      'Switch the active template. Only call when the teacher explicitly chooses ' +
      'or when the current template clearly does not fit.',
    input_schema: {
      type: 'object',
      properties: {
        template_id: {
          type: 'string',
          enum: ['standard-day', 'single-period', 'emergency', 'half-day'],
        },
      },
      required: ['template_id'],
    },
  },
  {
    name: 'finalize_plan',
    description:
      'Call when all required fields for the active template are filled. ' +
      'Triggers render and marks the plan as final. Do not call if any required ' +
      'field is missing — ask the teacher for it first.',
    input_schema: {
      type: 'object',
      properties: {
        confirm: { type: 'boolean', const: true },
      },
      required: ['confirm'],
    },
  },
] as const;
