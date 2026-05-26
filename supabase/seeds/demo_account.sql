-- =====================================================================
-- Demo account seed
-- =====================================================================
-- Run this in the Supabase SQL Editor AFTER creating the demo user
-- in Authentication → Users → Add user.
--
-- Steps:
--   1. Create user:  demo@subplan.app  /  DemoPass2026!
--      (or whatever credentials you choose)
--   2. Copy the UUID shown in the Users table.
--   3. Paste it below in place of DEMO_USER_UUID_HERE.
--   4. Run this script.
-- =====================================================================

do $$
declare
  v_uid uuid := 'DEMO_USER_UUID_HERE'::uuid;   -- ← replace this
begin

  -- ── Profile ──────────────────────────────────────────────────────
  update public.profiles
  set
    display_name = 'Demo Teacher',
    school_info  = '{
      "school_name": "Maplewood Elementary School",
      "school_year": "2025-2026",
      "grade": "4",
      "subject": "Self-Contained",
      "grades_covered": [],
      "principal":            {"name": "Dr. Sarah Johnson",   "extension": "100"},
      "assistant_principal":  {"name": "Mr. David Lee",       "extension": "101"},
      "school_counselor":     {"name": "Ms. Priya Nair",      "extension": "215"},
      "school_psychologist":  null,
      "helpful_staff": [
        {"name": "Mrs. Rivera", "role": "Room 14 — great resource"},
        {"name": "Mr. Okafor",  "role": "Grade-level team leader, Room 16"}
      ],
      "emergency_procedures": "Emergency folder is in the top drawer of the teacher desk. Evacuation route is posted by the front door — assemble on the far soccer field. Take the attendance sheet with you. Call the main office (ext. 100) for any lock-down.",
      "health_concerns":      "Band-aids and first aid are in the cabinet above the sink. For anything beyond a band-aid, send the student to the nurse with a hall pass. Allergy list is on the clipboard inside the cabinet door.",
      "bathroom_rules":       "One student at a time. Students raise two fingers to request. No bathroom during direct instruction.",
      "behavior_management":  "This class uses Class Dojo. Green = great, Yellow = warning, Red = call office (ext. 100). Positive reinforcement first — praise by name when students are on task.",
      "nurses_office":        "Nurse Chen is in Room 2 near the main office (ext. 120). Students need a signed hall pass.",
      "special_instructions": "Attendance must be submitted by 8:30 am via the green folder on the desk. Graded work goes in the Finished Work tray."
    }'::jsonb,
    updated_at = now()
  where id = v_uid;

  if not found then
    raise exception 'Profile not found for UUID %. Did you create the auth user first?', v_uid;
  end if;

  -- ── Plan 1: Finalized Standard Day ───────────────────────────────
  insert into public.sub_plans
    (id, user_id, title, grade, subject, template_id, status, content)
  values (
    gen_random_uuid(), v_uid,
    'Standard Day — 4th Grade', '4th', 'Self-Contained', 'standard-day', 'final',
    '{
      "template_id":   "standard-day",
      "school_name":   "Maplewood Elementary School",
      "school_year":   "2025-2026",
      "date":          "Thursday, May 28, 2026",
      "grade":         "4th",
      "subject":       "Self-Contained",
      "grades_covered": [],
      "principal":           {"name": "Dr. Sarah Johnson", "extension": "100"},
      "assistant_principal": {"name": "Mr. David Lee",     "extension": "101"},
      "school_counselor":    {"name": "Ms. Priya Nair",    "extension": "215"},
      "school_psychologist": null,
      "helpful_staff": [
        {"name": "Mrs. Rivera", "role": "Room 14"},
        {"name": "Mr. Okafor",  "role": "Room 16"}
      ],
      "emergency_procedures": "Emergency folder is in the top drawer. Evacuation route posted by the front door.",
      "health_concerns":      "Band-aids above the sink. Send to nurse (Room 2, ext. 120) for anything else.",
      "bathroom_rules":       "One at a time. Two fingers to request.",
      "behavior_management":  "Class Dojo. Green/Yellow/Red system.",
      "nurses_office":        "Room 2, ext. 120. Hall pass required.",
      "special_instructions": "Attendance by 8:30 am via green folder on desk.",
      "unit": null,
      "activities": [
        {
          "title": "Morning Arrival & Morning Work",
          "start_time": "8:10", "end_time": "8:30", "duration_min": 20,
          "instructions": "Students arrive and unpack. The Do Now activity is on the whiteboard. Take attendance and submit by 8:30.",
          "materials": ["Whiteboard", "Attendance folder"],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Reading / ELA",
          "start_time": "8:30", "end_time": "9:30", "duration_min": 60,
          "instructions": "Read aloud the next chapter of the class novel (on the easel). Students complete the reading response journal prompt on the board. Independent and quiet.",
          "materials": ["Class novel (easel)", "Reading response journals"],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Math",
          "start_time": "9:35", "end_time": "10:35", "duration_min": 60,
          "instructions": "5-minute multiplication flashcard warm-up. Then workbook pages 88–89 (multi-digit multiplication). Work through the first two examples together, then independent.",
          "materials": ["Math workbooks", "Multiplication flashcards"],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Lunch",
          "start_time": "11:15", "end_time": "11:45", "duration_min": 30,
          "instructions": "Walk students to the cafeteria in a single-file quiet line.",
          "materials": [],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Recess",
          "start_time": "11:45", "end_time": "12:15", "duration_min": 30,
          "instructions": "Pick up from cafeteria and walk outside. Recess bag is on the hook by the door.",
          "materials": ["Recess bag"],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Science — Ecosystems",
          "start_time": "12:20", "end_time": "1:10", "duration_min": 50,
          "instructions": "Students work in partner groups to complete the Food Web worksheet. Materials in the green bin on the supply shelf. Partners posted on the anchor chart.",
          "materials": ["Science folders", "Green supply bin"],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Dismissal",
          "start_time": "2:00", "end_time": "2:25", "duration_min": 25,
          "instructions": "Students pack up. Read aloud from the class read-aloud book for 10 min. Dismiss car riders on first bell, then bus riders, then walkers.",
          "materials": ["Class read-aloud book"],
          "period_key": null, "grade_label": null
        }
      ],
      "attachments": [],
      "sign_off": "Thank you so much for being here today! The students are kind and well-behaved. Please leave a note in the blue binder about how the day went.\n\n— J. Smith",
      "finalized": true,
      "sub_plan_id": null
    }'::jsonb
  );

  -- ── Plan 2: Finalized Reading Workshop ───────────────────────────
  insert into public.sub_plans
    (id, user_id, title, grade, subject, template_id, status, content)
  values (
    gen_random_uuid(), v_uid,
    'Reading Workshop — 3rd Grade', '3rd', 'ELA / Reading', 'reading-workshop', 'final',
    '{
      "template_id":   "reading-workshop",
      "school_name":   "Maplewood Elementary School",
      "school_year":   "2025-2026",
      "date":          "Monday, May 18, 2026",
      "grade":         "3rd",
      "subject":       "Reading / ELA",
      "grades_covered": [],
      "principal":           {"name": "Dr. Sarah Johnson", "extension": "100"},
      "assistant_principal": {"name": "Mr. David Lee",     "extension": "101"},
      "school_counselor":    {"name": "Ms. Priya Nair",    "extension": "215"},
      "school_psychologist": null,
      "helpful_staff": [
        {"name": "Mrs. Rivera", "role": "Room 14"},
        {"name": "Mr. Okafor",  "role": "Room 16"}
      ],
      "emergency_procedures": "Emergency folder in the top drawer. Evacuation route by the front door.",
      "health_concerns":      "Band-aids above the sink. Nurse is Room 2 ext. 120.",
      "bathroom_rules":       "One at a time, two fingers to request.",
      "behavior_management":  "Class Dojo — green/yellow/red.",
      "nurses_office":        "Room 2, ext. 120.",
      "special_instructions": "Attendance by 8:30 via green folder.",
      "unit": null,
      "activities": [
        {
          "title": "Read-Aloud — Charlotte''s Web",
          "start_time": "8:45", "end_time": "9:00", "duration_min": 15,
          "instructions": "Class is on Chapter 7 (copy on the easel). Read aloud expressively. Pause after p. 58: \"Why do you think Wilbur is so worried?\"",
          "materials": ["Charlotte''s Web (easel)"],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Mini-Lesson — Finding the Main Idea",
          "start_time": "9:00", "end_time": "9:20", "duration_min": 20,
          "instructions": "Point to the Main Idea anchor chart on the left wall. Model with the short passage on the projector. Students practice on a sticky note in their notebook.",
          "materials": ["Main Idea anchor chart", "Mini-lesson passage (projector folder)", "Sticky notes"],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Independent Reading",
          "start_time": "9:20", "end_time": "9:50", "duration_min": 30,
          "instructions": "Students read silently from their book bins (one per table). Circulate quietly. Students may read on the floor when finished.",
          "materials": ["Book bins (one per table)"],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Reading Stations",
          "start_time": "9:50", "end_time": "10:25", "duration_min": 35,
          "instructions": "3 stations, 10 min each. Station 1: Listening Center (headphones + tablet). Station 2: Vocabulary Sort (orange envelopes). Station 3: Partner Reading (leveled readers, blue basket).",
          "materials": ["Timer", "Orange vocabulary envelopes", "Leveled readers (blue basket)"],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Writing — Response Journal",
          "start_time": "10:25", "end_time": "10:50", "duration_min": 25,
          "instructions": "Prompt on whiteboard: \"What is the main idea of the chapter? Use two details from the text.\" Students write independently in response journals.",
          "materials": ["Response journals (Writing bin)"],
          "period_key": null, "grade_label": null
        },
        {
          "title": "Share / Wrap-Up",
          "start_time": "10:50", "end_time": "11:00", "duration_min": 10,
          "instructions": "2–3 volunteers share their main idea responses. Give a genuine compliment to each sharer.",
          "materials": [],
          "period_key": null, "grade_label": null
        }
      ],
      "attachments": [],
      "sign_off": "This group loves being called on — don''t be afraid to cold-call! Thank you for a great day.\n\n— Ms. P.",
      "finalized": true,
      "sub_plan_id": null
    }'::jsonb
  );

  -- ── Plan 3: Draft (in-progress) ──────────────────────────────────
  insert into public.sub_plans
    (id, user_id, title, grade, subject, template_id, status, content)
  values (
    gen_random_uuid(), v_uid,
    'Friday Half Day — 4th Grade', '4th', 'Self-Contained', 'half-day', 'draft',
    '{
      "template_id":   "half-day",
      "school_name":   "Maplewood Elementary School",
      "school_year":   "2025-2026",
      "date":          "Friday, May 29, 2026",
      "grade":         "4th",
      "subject":       "Self-Contained",
      "grades_covered": [],
      "principal":           {"name": "Dr. Sarah Johnson", "extension": "100"},
      "assistant_principal": null,
      "school_counselor":    null,
      "school_psychologist": null,
      "helpful_staff": [],
      "emergency_procedures": null,
      "health_concerns":      null,
      "bathroom_rules":       null,
      "behavior_management":  null,
      "nurses_office":        null,
      "special_instructions": null,
      "unit": null,
      "activities": [],
      "attachments": [],
      "sign_off": null,
      "finalized": false,
      "sub_plan_id": null
    }'::jsonb
  );

  raise notice 'Demo account seeded successfully for user %', v_uid;
end $$;
