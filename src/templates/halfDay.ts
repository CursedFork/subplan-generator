import type { SubPlanTemplate, TemplateContent, RenderedPlan } from './types';

export const halfDayTemplate: SubPlanTemplate = {
  id: 'half-day',
  name: 'Half Day',
  description: 'Half-day plan — adjustable for morning or afternoon coverage.',

  // Static text that works for both morning and afternoon.
  // The renderer (deferred increment) will handle parameterization at output time.
  audienceNote:
    'Welcome, and thank you for covering this half-day block. Everything you need is below.',

  parameters: [
    {
      key: 'time_of_day',
      label: 'Time of Day',
      type: 'enum',
      options: [
        { value: 'morning', label: 'Morning' },
        { value: 'afternoon', label: 'Afternoon' },
      ],
      defaultValue: 'morning',
    },
  ],

  sections: [
    {
      key: 'logistics',
      title: 'Logistics',
      fields: [
        { key: 'room_number', label: 'Room Number', type: 'text', required: true },
        {
          key: 'time_range',
          label: 'Coverage Time Range',
          type: 'text',
          required: true,
          placeholder: 'e.g. 8:00 AM – 11:30 AM',
        },
        { key: 'bell_schedule', label: 'Bell Schedule', type: 'longtext', required: true },
        {
          key: 'helpful_students',
          label: 'Helpful Students',
          type: 'list',
          required: false,
          helpText: 'First names only.',
        },
        {
          key: 'nearest_teacher',
          label: 'Nearest Teacher',
          type: 'text',
          required: true,
          placeholder: 'e.g. Ms. Patel, Room 205',
        },
      ],
    },
    {
      key: 'periods',
      title: 'Periods / Blocks',
      repeatable: true,
      minItems: 1,
      maxItems: 4,
      fields: [
        { key: 'period_name', label: 'Period Name', type: 'text', required: true },
        { key: 'time', label: 'Time', type: 'time', required: true },
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'objective', label: 'Objective', type: 'longtext', required: true },
        { key: 'activities', label: 'Activities', type: 'longtext', required: true },
        { key: 'materials', label: 'Materials', type: 'list', required: false },
        { key: 'standards', label: 'Standards Addressed', type: 'list', required: false },
      ],
    },
    {
      key: 'transition',
      title: 'End of Coverage',
      fields: [
        {
          key: 'description',
          label: 'Transition Notes',
          type: 'longtext',
          required: false,
          placeholder:
            'e.g. At 11:30, students go to lunch with Ms. Rodriguez. Their afternoon teacher will take over from there.',
          helpText: 'Describe how the day transitions out of your coverage.',
        },
      ],
    },
  ],

  defaults: {
    transition: {
      description:
        'When your coverage ends, please leave a brief note on the desk for the next teacher or administrator.' +
        ' Students should know what to expect next — let them know before you wrap up.',
    },
  },

  render(_content: TemplateContent): RenderedPlan {
    // Renderer wired in a later increment (render-plan Edge Function).
    return { markdown: '' };
  },
};
