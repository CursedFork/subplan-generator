-- =====================================================================
-- Seed built-in templates
-- =====================================================================

insert into public.templates (id, name, description, schema, is_default) values
(
  'standard-day',
  'Standard Day',
  'Full school day with multiple periods or blocks.',
  $${
    "sections": [
      {
        "key": "logistics", "title": "Logistics",
        "fields": [
          {"key": "room_number",       "label": "Room Number",       "type": "text",     "required": true},
          {"key": "bell_schedule",     "label": "Bell Schedule",     "type": "longtext", "required": true},
          {"key": "attendance_notes",  "label": "Attendance Notes",  "type": "longtext", "required": false},
          {"key": "helpful_students",  "label": "Helpful Students",  "type": "list",     "required": false}
        ]
      },
      {
        "key": "emergency", "title": "Emergency Information",
        "fields": [
          {"key": "nearest_teacher",  "label": "Nearest Teacher",         "type": "text",     "required": true},
          {"key": "main_office_ext",  "label": "Main Office Extension",   "type": "text",     "required": true},
          {"key": "fire_drill_route", "label": "Fire Drill Route",        "type": "longtext", "required": true}
        ]
      },
      {
        "key": "periods", "title": "Periods",
        "repeatable": true, "minItems": 1, "maxItems": 8,
        "fields": [
          {"key": "period_name", "label": "Period Name",        "type": "text",     "required": true},
          {"key": "time",        "label": "Time",               "type": "time",     "required": true},
          {"key": "subject",     "label": "Subject",            "type": "text",     "required": true},
          {"key": "objective",   "label": "Learning Objective", "type": "longtext", "required": true},
          {"key": "activities",  "label": "Activities",         "type": "longtext", "required": true},
          {"key": "materials",   "label": "Materials",          "type": "list",     "required": false},
          {"key": "standards",   "label": "Standards Addressed","type": "list",     "required": false}
        ]
      },
      {
        "key": "closing", "title": "End of Day",
        "fields": [
          {"key": "dismissal_notes",   "label": "Dismissal Notes",  "type": "longtext", "required": true},
          {"key": "leave_for_teacher", "label": "Note for Teacher", "type": "longtext", "required": false}
        ]
      }
    ]
  }$$::jsonb,
  true
),
(
  'single-period',
  'Single Period',
  'One class block — for specialists or partial-day coverage.',
  $${
    "sections": [
      {
        "key": "logistics", "title": "Logistics",
        "fields": [
          {"key": "room_number",      "label": "Room Number",      "type": "text", "required": true},
          {"key": "time",             "label": "Class Time",       "type": "time", "required": true},
          {"key": "grade",            "label": "Grade",            "type": "text", "required": true},
          {"key": "subject",          "label": "Subject",          "type": "text", "required": true},
          {"key": "helpful_students", "label": "Helpful Students", "type": "list", "required": false},
          {"key": "nearest_teacher",  "label": "Nearest Teacher",  "type": "text", "required": true}
        ]
      },
      {
        "key": "lesson", "title": "Lesson",
        "fields": [
          {"key": "objective",     "label": "Objective",      "type": "longtext", "required": true},
          {"key": "warmup",        "label": "Warm-Up",        "type": "longtext", "required": false},
          {"key": "main_activity", "label": "Main Activity",  "type": "longtext", "required": true},
          {"key": "wrap_up",       "label": "Wrap-Up",        "type": "longtext", "required": false},
          {"key": "materials",     "label": "Materials",      "type": "list",     "required": false},
          {"key": "standards",     "label": "Standards",      "type": "list",     "required": false}
        ]
      },
      {
        "key": "if_extra_time", "title": "If There's Extra Time",
        "fields": [
          {"key": "extension", "label": "Extension Activity", "type": "longtext", "required": false}
        ]
      }
    ]
  }$$::jsonb,
  false
),
(
  'emergency',
  'Emergency / Last-Minute',
  'Minimal-prep plan a sub can run cold. Use when a teacher is out unexpectedly.',
  $${
    "sections": [
      {
        "key": "logistics", "title": "Logistics",
        "fields": [
          {"key": "room_number",     "label": "Room Number",            "type": "text",     "required": true},
          {"key": "grade",           "label": "Grade",                  "type": "text",     "required": true},
          {"key": "bell_schedule",   "label": "Bell Schedule",          "type": "longtext", "required": true},
          {"key": "nearest_teacher", "label": "Nearest Teacher",        "type": "text",     "required": true},
          {"key": "main_office_ext", "label": "Main Office Extension",  "type": "text",     "required": true}
        ]
      },
      {
        "key": "generic_activities", "title": "Activities",
        "repeatable": true, "minItems": 3, "maxItems": 8,
        "fields": [
          {"key": "title",        "label": "Activity Title", "type": "text",     "required": true},
          {"key": "duration_min", "label": "Duration (min)", "type": "duration", "required": true},
          {"key": "instructions", "label": "Instructions",   "type": "longtext", "required": true},
          {"key": "materials",    "label": "Materials",      "type": "list",     "required": false}
        ]
      },
      {
        "key": "classroom_management", "title": "Classroom Management",
        "fields": [
          {"key": "attention_signal", "label": "Attention Signal", "type": "text", "required": false},
          {"key": "bathroom_policy",  "label": "Bathroom Policy",  "type": "text", "required": false}
        ]
      }
    ]
  }$$::jsonb,
  false
),
(
  'half-day',
  'Half Day',
  'Half-day plan — adjustable for morning or afternoon coverage.',
  $${
    "parameters": [
      {
        "key": "time_of_day", "label": "Time of Day", "type": "enum",
        "options": [{"value": "morning", "label": "Morning"}, {"value": "afternoon", "label": "Afternoon"}],
        "defaultValue": "morning"
      }
    ],
    "sections": [
      {
        "key": "logistics", "title": "Logistics",
        "fields": [
          {"key": "room_number",      "label": "Room Number",          "type": "text",     "required": true},
          {"key": "time_range",       "label": "Coverage Time Range",  "type": "text",     "required": true},
          {"key": "bell_schedule",    "label": "Bell Schedule",        "type": "longtext", "required": true},
          {"key": "helpful_students", "label": "Helpful Students",     "type": "list",     "required": false},
          {"key": "nearest_teacher",  "label": "Nearest Teacher",      "type": "text",     "required": true}
        ]
      },
      {
        "key": "periods", "title": "Periods / Blocks",
        "repeatable": true, "minItems": 1, "maxItems": 4,
        "fields": [
          {"key": "period_name", "label": "Period Name",        "type": "text",     "required": true},
          {"key": "time",        "label": "Time",               "type": "time",     "required": true},
          {"key": "subject",     "label": "Subject",            "type": "text",     "required": true},
          {"key": "objective",   "label": "Objective",          "type": "longtext", "required": true},
          {"key": "activities",  "label": "Activities",         "type": "longtext", "required": true},
          {"key": "materials",   "label": "Materials",          "type": "list",     "required": false},
          {"key": "standards",   "label": "Standards Addressed","type": "list",     "required": false}
        ]
      },
      {
        "key": "transition", "title": "End of Coverage",
        "fields": [
          {"key": "description", "label": "Transition Notes", "type": "longtext", "required": false}
        ]
      }
    ]
  }$$::jsonb,
  false
)
on conflict (id) do nothing;
