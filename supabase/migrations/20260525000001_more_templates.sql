-- =====================================================================
-- Additional built-in templates (increment 2)
-- Inspired by real K-12 sub plan formats; all sections generic.
-- =====================================================================

insert into public.templates (id, name, description, schema, is_default) values

-- -----------------------------------------------------------------------
-- 1. Primary Classroom (K–2)
--    Morning routine through dismissal; suited for self-contained K-2 rooms.
-- -----------------------------------------------------------------------
(
  'primary-classroom',
  'Primary Classroom (K–2)',
  'A full school day for self-contained K–2 classrooms. Covers the morning routine, literacy, math, lunch and recess, afternoon block, and dismissal.',
  $${
    "sections": [
      {
        "key": "logistics",
        "title": "Classroom Setup",
        "fields": [
          {"key": "room_number",       "label": "Room Number",                  "type": "text",     "required": true},
          {"key": "before_school",     "label": "Before School / Arrival Notes","type": "longtext", "required": true},
          {"key": "helpful_students",  "label": "Reliable Students",            "type": "list",     "required": false},
          {"key": "nearest_teacher",   "label": "Nearest Teacher / Helper",     "type": "text",     "required": true}
        ]
      },
      {
        "key": "morning_routine",
        "title": "Morning Routine",
        "fields": [
          {"key": "time",           "label": "Time",                        "type": "time",     "required": true},
          {"key": "morning_work",   "label": "Morning Bin / Morning Work",  "type": "longtext", "required": true},
          {"key": "morning_meeting","label": "Morning Meeting",             "type": "longtext", "required": false}
        ]
      },
      {
        "key": "literacy",
        "title": "Literacy Block",
        "fields": [
          {"key": "time",             "label": "Time",             "type": "time",     "required": true},
          {"key": "read_aloud",       "label": "Read-Aloud",       "type": "longtext", "required": false},
          {"key": "reading_activity", "label": "Reading Activity", "type": "longtext", "required": true},
          {"key": "writing_activity", "label": "Writing Activity", "type": "longtext", "required": false},
          {"key": "materials",        "label": "Materials",        "type": "list",     "required": false}
        ]
      },
      {
        "key": "math",
        "title": "Math Block",
        "fields": [
          {"key": "time",      "label": "Time",          "type": "time",     "required": true},
          {"key": "activity",  "label": "Math Activity", "type": "longtext", "required": true},
          {"key": "materials", "label": "Materials",     "type": "list",     "required": false}
        ]
      },
      {
        "key": "lunch_recess",
        "title": "Lunch & Recess",
        "fields": [
          {"key": "time",         "label": "Time",                        "type": "time",     "required": true},
          {"key": "instructions", "label": "Lunch & Recess Instructions", "type": "longtext", "required": true}
        ]
      },
      {
        "key": "afternoon",
        "title": "Afternoon Block",
        "fields": [
          {"key": "time",        "label": "Time",                "type": "time",     "required": true},
          {"key": "activities",  "label": "Afternoon Activities","type": "longtext", "required": true}
        ]
      },
      {
        "key": "dismissal",
        "title": "Dismissal",
        "fields": [
          {"key": "time",          "label": "Dismissal Time",                        "type": "time",     "required": true},
          {"key": "instructions",  "label": "Dismissal Instructions",               "type": "longtext", "required": true},
          {"key": "bus_car_notes", "label": "Bus / Car Rider / Walker Notes",        "type": "longtext", "required": false}
        ]
      }
    ]
  }$$::jsonb,
  false
),

-- -----------------------------------------------------------------------
-- 2. Reading Workshop / ELA Focus
--    Structured literacy workshop: read-aloud → mini-lesson → independent
--    reading → stations → writing → share. Good for grades 2-6.
-- -----------------------------------------------------------------------
(
  'reading-workshop',
  'Reading Workshop / ELA',
  'Structured literacy workshop model for grades 2–6. Includes read-aloud, mini-lesson, independent reading, stations or small groups, and a writing component.',
  $${
    "sections": [
      {
        "key": "logistics",
        "title": "Logistics",
        "fields": [
          {"key": "room_number",      "label": "Room Number",      "type": "text", "required": true},
          {"key": "grade",            "label": "Grade",            "type": "text", "required": true},
          {"key": "class_time",       "label": "Class Time",       "type": "time", "required": true},
          {"key": "nearest_teacher",  "label": "Nearest Teacher",  "type": "text", "required": true}
        ]
      },
      {
        "key": "read_aloud",
        "title": "Read-Aloud",
        "fields": [
          {"key": "duration_min",    "label": "Duration (min)",                      "type": "duration", "required": false},
          {"key": "book_title",      "label": "Book Title",                          "type": "text",     "required": false},
          {"key": "where_to_find",   "label": "Where to Find It",                   "type": "text",     "required": false},
          {"key": "discussion_notes","label": "Discussion Questions / Read-Along Notes","type": "longtext","required": false}
        ]
      },
      {
        "key": "mini_lesson",
        "title": "Mini-Lesson",
        "fields": [
          {"key": "duration_min",  "label": "Duration (min)",       "type": "duration", "required": true},
          {"key": "topic",         "label": "Lesson Topic / Skill", "type": "text",     "required": true},
          {"key": "instructions",  "label": "Step-by-Step Instructions", "type": "longtext", "required": true},
          {"key": "anchor_chart",  "label": "Anchor Chart Reference",    "type": "text",     "required": false}
        ]
      },
      {
        "key": "independent_reading",
        "title": "Independent Reading",
        "fields": [
          {"key": "duration_min",  "label": "Duration (min)",       "type": "duration", "required": true},
          {"key": "instructions",  "label": "What Students Do",     "type": "longtext", "required": true},
          {"key": "book_bins",     "label": "Book Bin / Library Location", "type": "text", "required": false}
        ]
      },
      {
        "key": "stations",
        "title": "Reading Stations / Centers",
        "fields": [
          {"key": "duration_min",     "label": "Duration (min)",           "type": "duration", "required": false},
          {"key": "station_list",     "label": "Station Descriptions",     "type": "longtext", "required": false},
          {"key": "rotation_notes",   "label": "Rotation / Management Notes","type": "longtext","required": false}
        ]
      },
      {
        "key": "writing",
        "title": "Writing",
        "fields": [
          {"key": "duration_min", "label": "Duration (min)",  "type": "duration", "required": false},
          {"key": "activity",     "label": "Writing Activity","type": "longtext", "required": false}
        ]
      },
      {
        "key": "wrap_up",
        "title": "Wrap-Up / Share",
        "fields": [
          {"key": "duration_min", "label": "Duration (min)",   "type": "duration", "required": false},
          {"key": "instructions", "label": "Closing Activity", "type": "longtext", "required": false}
        ]
      },
      {
        "key": "if_extra_time",
        "title": "If There's Extra Time",
        "fields": [
          {"key": "extension","label": "Extension / Early Finishers","type": "longtext","required": false}
        ]
      }
    ]
  }$$::jsonb,
  false
),

-- -----------------------------------------------------------------------
-- 3. Specialist Rotation (PE, Art, Music, Library, etc.)
--    Covers multiple class groups across the day; each group gets its own
--    block. Designed for specials teachers.
-- -----------------------------------------------------------------------
(
  'specialist-rotation',
  'Specialist Rotation',
  'For PE, Art, Music, Library, or other specials teachers who see multiple class groups in a day. Each group gets its own time block and lesson notes.',
  $${
    "sections": [
      {
        "key": "logistics",
        "title": "Specialist Logistics",
        "fields": [
          {"key": "room_number",        "label": "Room / Location",                         "type": "text",     "required": true},
          {"key": "subject",            "label": "Subject (PE, Art, Music, Library, etc.)", "type": "text",     "required": true},
          {"key": "transition_notes",   "label": "Pickup & Transition Notes",               "type": "longtext", "required": true},
          {"key": "nearest_colleague",  "label": "Nearest Colleague",                       "type": "text",     "required": true},
          {"key": "equipment_location", "label": "Equipment / Supply Location",             "type": "text",     "required": false}
        ]
      },
      {
        "key": "general_expectations",
        "title": "General Expectations",
        "fields": [
          {"key": "rules",   "label": "Classroom Rules / Expectations","type": "longtext","required": false},
          {"key": "rewards", "label": "Reward / Management System",    "type": "text",    "required": false}
        ]
      },
      {
        "key": "class_groups",
        "title": "Class Groups",
        "repeatable": true,
        "minItems": 2,
        "maxItems": 8,
        "fields": [
          {"key": "time",             "label": "Time",                "type": "time",     "required": true},
          {"key": "grade",            "label": "Grade / Class",       "type": "text",     "required": true},
          {"key": "homeroom_teacher", "label": "Homeroom Teacher",    "type": "text",     "required": false},
          {"key": "activity",         "label": "Activity / Lesson",   "type": "longtext", "required": true},
          {"key": "materials",        "label": "Materials / Equipment","type": "list",     "required": false},
          {"key": "class_notes",      "label": "Class-Specific Notes","type": "longtext", "required": false}
        ]
      }
    ]
  }$$::jsonb,
  false
)

on conflict (id) do nothing;
