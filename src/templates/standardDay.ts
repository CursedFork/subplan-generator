import type { SubPlanTemplate, TemplateContent, RenderedPlan } from './types';

export const standardDayTemplate: SubPlanTemplate = {
  id: 'standard-day',
  name: 'Standard Day',
  description: 'Full school day with multiple periods or blocks.',

  audienceNote:
    'Welcome, and thank you for being here today. This plan walks you through the whole day' +
    ' period by period — you\'ll find everything you need below. Feel free to adapt timing' +
    ' as the day requires. The students know the routines, and you\'ve got this.',

  sections: [
    {
      key: 'logistics',
      title: 'Logistics',
      fields: [
        {
          key: 'room_number',
          label: 'Room Number',
          type: 'text',
          required: true,
          placeholder: 'e.g. 214',
        },
        {
          key: 'bell_schedule',
          label: 'Bell Schedule',
          type: 'longtext',
          required: true,
          placeholder: 'e.g. Period 1: 8:05–8:55, Period 2: 9:00–9:50…',
        },
        {
          key: 'attendance_notes',
          label: 'Attendance Notes',
          type: 'longtext',
          required: false,
          helpText: 'How attendance is taken and where to send it.',
        },
        {
          key: 'helpful_students',
          label: 'Helpful Students',
          type: 'list',
          required: false,
          helpText: 'First names only — students who know routines well and can help.',
        },
      ],
    },
    {
      key: 'emergency',
      title: 'Emergency Information',
      fields: [
        {
          key: 'nearest_teacher',
          label: 'Nearest Teacher',
          type: 'text',
          required: true,
          placeholder: 'e.g. Ms. Rivera, Room 212',
        },
        {
          key: 'main_office_ext',
          label: 'Main Office Extension',
          type: 'text',
          required: true,
          placeholder: 'e.g. ext. 100',
        },
        {
          key: 'fire_drill_route',
          label: 'Fire Drill Route',
          type: 'longtext',
          required: true,
          placeholder: 'e.g. Exit through the back hallway, turn left, assemble on the east field.',
        },
      ],
    },
    {
      key: 'periods',
      title: 'Periods',
      repeatable: true,
      minItems: 1,
      maxItems: 8,
      fields: [
        { key: 'period_name', label: 'Period Name', type: 'text', required: true, placeholder: 'e.g. Period 1 or Block A' },
        { key: 'time', label: 'Time', type: 'time', required: true },
        { key: 'subject', label: 'Subject', type: 'text', required: true },
        { key: 'objective', label: 'Learning Objective', type: 'longtext', required: true, placeholder: 'What should students understand or be able to do by the end?' },
        { key: 'activities', label: 'Activities', type: 'longtext', required: true, placeholder: 'Step-by-step instructions for the sub to follow.' },
        { key: 'materials', label: 'Materials', type: 'list', required: false },
        { key: 'standards', label: 'Standards Addressed', type: 'list', required: false, helpText: 'Standard codes from the standards adapter. Never fabricate codes.' },
      ],
    },
    {
      key: 'closing',
      title: 'End of Day',
      fields: [
        {
          key: 'dismissal_notes',
          label: 'Dismissal Notes',
          type: 'longtext',
          required: true,
          placeholder: 'e.g. Dismiss at 3:05 via main hallway. Bus riders go first.',
        },
        {
          key: 'leave_for_teacher',
          label: 'Note for Teacher',
          type: 'longtext',
          required: false,
          helpText: 'Leave a note for when the teacher returns — they appreciate it.',
        },
      ],
    },
  ],

  defaults: {
    closing: {
      leave_for_teacher:
        'A quick note about how the day went and anything I should follow up on.' +
        ' No need to write a novel — even a few sentences helps.',
    },
  },

  render(_content: TemplateContent): RenderedPlan {
    // Renderer wired in a later increment (render-plan Edge Function).
    return { markdown: '' };
  },
};
