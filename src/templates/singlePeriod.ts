import type { SubPlanTemplate, TemplateContent, RenderedPlan } from './types';

export const singlePeriodTemplate: SubPlanTemplate = {
  id: 'single-period',
  name: 'Single Period',
  description: 'One class block — for specialists or partial-day coverage.',

  audienceNote:
    'Welcome. You\'re covering one block today, and everything you need is right here.' +
    ' The plan is self-contained — no context about previous lessons required.',

  sections: [
    {
      key: 'logistics',
      title: 'Logistics',
      fields: [
        { key: 'room_number', label: 'Room Number', type: 'text', required: true, placeholder: 'e.g. 108' },
        { key: 'time', label: 'Class Time', type: 'time', required: true, placeholder: 'e.g. 10:15 AM – 11:05 AM' },
        { key: 'grade', label: 'Grade', type: 'text', required: true, placeholder: 'e.g. 7' },
        { key: 'subject', label: 'Subject', type: 'text', required: true, placeholder: 'e.g. Science' },
        {
          key: 'helpful_students',
          label: 'Helpful Students',
          type: 'list',
          required: false,
          helpText: 'First names only — students who know the routine and can help orient you.',
        },
        {
          key: 'nearest_teacher',
          label: 'Nearest Teacher',
          type: 'text',
          required: true,
          placeholder: 'e.g. Mr. Okonkwo, Room 110',
        },
      ],
    },
    {
      key: 'lesson',
      title: 'Lesson',
      fields: [
        {
          key: 'objective',
          label: 'Objective',
          type: 'longtext',
          required: true,
          placeholder: 'What students should understand or complete by the end of class.',
        },
        {
          key: 'warmup',
          label: 'Warm-Up',
          type: 'longtext',
          required: false,
          placeholder: 'Optional opener — a question on the board, a quick review activity, etc.',
        },
        {
          key: 'main_activity',
          label: 'Main Activity',
          type: 'longtext',
          required: true,
          placeholder: 'Step-by-step instructions. Write as if the sub has never met this class.',
        },
        {
          key: 'wrap_up',
          label: 'Wrap-Up',
          type: 'longtext',
          required: false,
          placeholder: 'How to close the class — exit ticket, cleanup, etc.',
        },
        { key: 'materials', label: 'Materials', type: 'list', required: false },
        {
          key: 'standards',
          label: 'Standards Addressed',
          type: 'list',
          required: false,
          helpText: 'Standard codes from the standards adapter. Never fabricate codes.',
        },
      ],
    },
    {
      key: 'if_extra_time',
      title: 'If There\'s Extra Time',
      fields: [
        {
          key: 'extension',
          label: 'Extension Activity',
          type: 'longtext',
          required: false,
          placeholder: 'e.g. Silent reading, or the class\'s favorite review game.',
          helpText: 'Something low-prep the sub can run if the main activity finishes early.',
        },
      ],
    },
  ],

  defaults: {
    if_extra_time: {
      extension:
        'Students may read silently or work on any unfinished classwork. ' +
        'If the class has a favorite review game, feel free to use it.',
    },
  },

  render(_content: TemplateContent): RenderedPlan {
    // Renderer wired in a later increment (render-plan Edge Function).
    return { markdown: '' };
  },
};
