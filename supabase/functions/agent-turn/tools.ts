// Tool schemas for the agent. Each tool maps to a state update on
// agent_sessions.state and (for finalize_plan) triggers rendering.

export const agentTools = [
  {
    name: 'set_school_info',
    description:
      'Record the school name, date of absence, and school year. ' +
      'Call as soon as the teacher provides any of these.',
    input_schema: {
      type: 'object',
      properties: {
        school_name: { type: 'string', description: 'Full school name, e.g. "Thunder Hill Elementary School".' },
        date: { type: 'string', description: 'Date of absence in YYYY-MM-DD format.' },
        school_year: { type: 'string', description: 'e.g. "2025-2026".' },
      },
      required: [],
    },
  },
  {
    name: 'set_admin_contacts',
    description:
      'Record school administration contacts. Include any or all. ' +
      'Extension is the internal phone extension or full number.',
    input_schema: {
      type: 'object',
      properties: {
        principal: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            extension: { type: 'string' },
          },
          required: ['name'],
        },
        assistant_principal: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            extension: { type: 'string' },
          },
          required: ['name'],
        },
        school_counselor: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            extension: { type: 'string' },
          },
          required: ['name'],
        },
        school_psychologist: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            extension: { type: 'string' },
          },
          required: ['name'],
        },
      },
      required: [],
    },
  },
  {
    name: 'set_grade_level',
    description:
      'Record the primary grade level for this teacher. ' +
      'Use K, 1-12, or a range like "9-10". For specialists covering multiple grades, ' +
      'also call set_grades_covered.',
    input_schema: {
      type: 'object',
      properties: {
        grade: { type: 'string', description: 'Grade level, e.g. "3" or "K" or "9-10".' },
      },
      required: ['grade'],
    },
  },
  {
    name: 'set_grades_covered',
    description:
      'For specialists or teachers who see multiple classes in one day, record all grades ' +
      'they will cover. E.g. ["2", "3", "4"] for a math specialist.',
    input_schema: {
      type: 'object',
      properties: {
        grades: {
          type: 'array',
          items: { type: 'string' },
          description: 'All grades the sub will see that day.',
        },
      },
      required: ['grades'],
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
    name: 'add_helpful_staff',
    description:
      'Add a staff member the sub can go to for help. Call once per person.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name of the staff member.' },
        role: {
          type: 'string',
          description: 'Their role or context, e.g. "Classroom across the hall (1st grade)" or "Math Coach".',
        },
      },
      required: ['name', 'role'],
    },
  },
  {
    name: 'set_emergency_procedures',
    description:
      'Record emergency/evacuation procedures for the classroom. ' +
      'Include where the emergency folder is, the exit route, the assembly location, ' +
      'and attendance protocol.',
    input_schema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Full emergency procedure instructions written for the sub.',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'set_health_concerns',
    description:
      'Record health and minor injury protocols: where band-aids are, when to call the nurse, ' +
      'and any student-specific health notes the sub should know.',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
  },
  {
    name: 'set_bathroom_rules',
    description: 'Record the classroom bathroom policy for students.',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
  },
  {
    name: 'set_behavior_management',
    description:
      'Record the classroom behavior/PBIS system the sub should use ' +
      '(e.g. Dojo points, breaks, office referral process).',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
  },
  {
    name: 'set_nurses_office',
    description: 'Record how to send a student to the nurse (pass requirements, phone number, etc.).',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
  },
  {
    name: 'set_special_instructions',
    description:
      'Record any remaining special instructions that do not fit other categories ' +
      '(dismissal notes, duty assignments, class lists location, etc.).',
    input_schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
      required: ['text'],
    },
  },
  {
    name: 'set_sign_off',
    description:
      'Record the teacher\'s personal closing message to the sub. ' +
      'Should be warm and thankful. Use the teacher\'s actual name.',
    input_schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'e.g. "Thank you for your help today!! — Andrea Kozikowski"' },
      },
      required: ['message'],
    },
  },
  {
    name: 'add_activity',
    description:
      'Append one scheduled block or activity to the plan. For multi-grade specialists, ' +
      'set grade_label to identify which class. Use start_time/end_time for clock-based schedules.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'e.g. "Third Grade Math — BUMP Game"' },
        duration_min: { type: 'integer', minimum: 1, maximum: 300 },
        start_time: { type: 'string', description: 'Wall clock start, e.g. "11:40 AM". Optional.' },
        end_time: { type: 'string', description: 'Wall clock end, e.g. "12:55 PM". Optional.' },
        instructions: {
          type: 'string',
          description:
            'Step-by-step, written for someone who has never met the class. ' +
            'Include specific timestamps within the block when relevant. ' +
            'Assume zero context.',
        },
        materials: { type: 'array', items: { type: 'string' } },
        period_key: {
          type: 'string',
          description: 'For multi-period templates, which period this belongs to.',
        },
        grade_label: {
          type: 'string',
          description: 'For specialists: which grade this block is for, e.g. "Grade 3".',
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
    name: 'save_to_profile',
    description:
      'Persist the current school/logistics info to the teacher\'s profile so it ' +
      'pre-fills future plans. Call after the teacher confirms their info is accurate, ' +
      'or after they correct it. Do NOT call before the teacher has confirmed.',
    input_schema: {
      type: 'object',
      properties: {
        confirm: { type: 'boolean', const: true },
      },
      required: ['confirm'],
    },
  },
  {
    name: 'finalize_plan',
    description:
      'Call when all required fields are filled and the teacher has confirmed. ' +
      'Required minimum: school_name, grade or grades_covered, subject, at least one activity, ' +
      'emergency_procedures, and sign_off. Do not call if any of these are missing.',
    input_schema: {
      type: 'object',
      properties: {
        confirm: { type: 'boolean', const: true },
      },
      required: ['confirm'],
    },
  },
] as const;
