import type { SubPlanTemplate, TemplateContent, RenderedPlan } from './types';

export const emergencyTemplate: SubPlanTemplate = {
  id: 'emergency',
  name: 'Emergency / Last-Minute',
  description: 'Minimal-prep plan a sub can run cold. Use when a teacher is out unexpectedly.',

  audienceNote:
    'Thank you so much for stepping in on short notice — it genuinely means a lot.' +
    ' This plan is designed so you can walk in and run it without any advance preparation.' +
    ' Every activity below works without prior context about the class. You\'ve got everything you need right here.',

  sections: [
    {
      key: 'logistics',
      title: 'Logistics',
      fields: [
        { key: 'room_number', label: 'Room Number', type: 'text', required: true },
        { key: 'grade', label: 'Grade', type: 'text', required: true },
        { key: 'bell_schedule', label: 'Bell Schedule', type: 'longtext', required: true },
        { key: 'nearest_teacher', label: 'Nearest Teacher', type: 'text', required: true },
        { key: 'main_office_ext', label: 'Main Office Extension', type: 'text', required: true },
      ],
    },
    {
      key: 'generic_activities',
      title: 'Activities',
      repeatable: true,
      minItems: 3,
      maxItems: 8,
      fields: [
        { key: 'title', label: 'Activity Title', type: 'text', required: true },
        { key: 'duration_min', label: 'Duration (minutes)', type: 'duration', required: true },
        {
          key: 'instructions',
          label: 'Instructions',
          type: 'longtext',
          required: true,
          helpText: 'Write for someone who has never met this class. Assume zero context.',
        },
        { key: 'materials', label: 'Materials Needed', type: 'list', required: false },
      ],
    },
    {
      key: 'classroom_management',
      title: 'Classroom Management',
      fields: [
        {
          key: 'attention_signal',
          label: 'Attention Signal',
          type: 'text',
          required: false,
          helpText: 'How to get the class\'s attention quickly.',
        },
        {
          key: 'bathroom_policy',
          label: 'Bathroom Policy',
          type: 'text',
          required: false,
          placeholder: 'e.g. One student at a time, sign the log on the desk.',
        },
      ],
    },
  ],

  defaults: {
    generic_activities: [
      {
        title: 'Silent Reading',
        duration_min: 20,
        instructions:
          'Ask students to take out a book they\'re reading, or any reading material from their bag.' +
          ' If a student has nothing to read, invite them to look through a classroom book.' +
          ' The room should be quiet. Students may sit anywhere comfortable.',
        materials: [],
      },
      {
        title: 'Vocabulary Scavenger Hunt',
        duration_min: 20,
        instructions:
          'Write 5–8 interesting words on the board — they can be from any subject.' +
          ' Ask students to write each word, guess a definition on their own, then look it up in any reference they have.' +
          ' Share out at the end by calling on volunteers.',
        materials: ['Paper or notebook', 'Pencil or pen'],
      },
      {
        title: 'Draw and Describe',
        duration_min: 15,
        instructions:
          'Ask students to draw something they learned recently in any class, then write 3–5 sentences describing it.' +
          ' Prompt: "What is it, why does it matter, and what\'s one thing that surprised you?"' +
          ' Students share with a partner when done.',
        materials: ['Paper', 'Pencil or colored pencils (optional)'],
      },
    ],
    classroom_management: {
      attention_signal: 'Try "If you can hear me, clap once." It usually works.',
    },
  },

  render(_content: TemplateContent): RenderedPlan {
    // Renderer wired in a later increment (render-plan Edge Function).
    return { markdown: '' };
  },
};
