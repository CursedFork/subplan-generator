import type { AgentState } from '@/types/app';

// Shared boilerplate used across all mock states
const BASE: Omit<AgentState, 'template_id' | 'grade' | 'subject' | 'grades_covered' | 'activities' | 'sign_off'> = {
  school_name: 'Maplewood Elementary School',
  school_year: '2025–2026',
  date: 'Thursday, May 28, 2026',
  principal: { name: 'Dr. Sarah Johnson', extension: '100' },
  assistant_principal: { name: 'Mr. David Lee', extension: '101' },
  school_counselor: { name: 'Ms. Priya Nair', extension: '215' },
  school_psychologist: null,
  helpful_staff: [
    { name: 'Mrs. Rivera', role: 'Classroom next door (Room 14) — great resource' },
    { name: 'Mr. Okafor', role: 'Grade-level team leader, Room 16' },
  ],
  emergency_procedures:
    'Emergency folder is in the top drawer of the teacher desk. Evacuation route is posted by the front door — assemble on the far soccer field. Take attendance sheet with you. Call the main office (ext. 100) for any lock-down or shelter-in-place.',
  health_concerns:
    'Band-aids and basic first aid are in the cabinet above the sink. For anything beyond a band-aid, send the student to the nurse with a hall pass. Student allergy list is on the clipboard inside the cabinet door.',
  bathroom_rules:
    'One student at a time. Students raise two fingers to request a bathroom break. No bathroom during direct instruction. Emergency exceptions are fine — use judgment.',
  behavior_management:
    'This class uses Class Dojo. Green = doing great, Yellow = warning, Red = contact office (ext. 100). Positive reinforcement first — praise students by name when they are on task.',
  nurses_office:
    "Nurse Chen is in Room 2 near the main office (ext. 120). Students need a signed hall pass. For illness or injury send two students together.",
  special_instructions:
    "Attendance must be submitted by 8:30 am via the green folder on the desk. Graded work goes in the \"Finished Work\" tray. Lesson plans and materials are on the teacher's desk in the blue binder.",
  unit: null,
  attachments: [],
  finalized: true,
  sub_plan_id: 'preview',
};

// ---------------------------------------------------------------------------
// Template-specific mock states
// ---------------------------------------------------------------------------

const STANDARD_DAY: AgentState = {
  ...BASE,
  template_id: 'standard-day',
  grade: '4th',
  subject: 'Self-Contained (All Subjects)',
  grades_covered: [],
  activities: [
    {
      title: 'Morning Arrival & Morning Work',
      start_time: '8:10', end_time: '8:30',
      duration_min: 20,
      instructions:
        'Students arrive, unpack bags, and sit down at their desks. The "Do Now" activity is written on the whiteboard — students complete it independently. Take attendance using the green folder on the desk and submit it by 8:30 via the office drop box.',
      materials: ['Whiteboard', 'Attendance folder'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Reading / ELA',
      start_time: '8:30', end_time: '9:30',
      duration_min: 60,
      instructions:
        'Mini-lesson: read aloud the next chapter of the current class novel (it is on the easel). After reading, have students complete the reading response journal prompt on the board. Students work independently and quietly. Circulate the room.',
      materials: ['Class novel (on easel)', 'Reading response journals', 'Pencils'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Writing',
      start_time: '9:35', end_time: '10:10',
      duration_min: 35,
      instructions:
        'Students continue their personal narrative drafts. First-draft folders are in their cubbies. Encourage students to add dialogue and sensory details. Early finishers may illustrate their story.',
      materials: ['Personal narrative folders', 'Pencils', 'Colored pencils'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Math',
      start_time: '10:15', end_time: '11:15',
      duration_min: 60,
      instructions:
        'Math warm-up: review multiplication flashcards as a class for 5 minutes. Then students open their math workbooks to pages 88–89 (multi-digit multiplication). Work through the first two examples together on the board, then students complete the rest independently. Go over answers together at the end.',
      materials: ['Math workbooks', 'Multiplication flashcards', 'Pencils'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Lunch',
      start_time: '11:15', end_time: '11:45',
      duration_min: 30,
      instructions:
        'Walk students to the cafeteria in a single-file line. Students stay seated and wait for dismissal from cafeteria staff. Do NOT leave the room with a noisy class — students know the hallway expectations.',
      materials: [],
      period_key: null, grade_label: null,
    },
    {
      title: 'Recess',
      start_time: '11:45', end_time: '12:15',
      duration_min: 30,
      instructions:
        'Pick students up from the cafeteria and walk them outside for recess. Recess bag (with whistle and ball) is hanging on the hook by the door. Students return to the classroom when the outdoor bell rings.',
      materials: ['Recess bag (hook by door)'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Science',
      start_time: '12:20', end_time: '1:10',
      duration_min: 50,
      instructions:
        'Science unit on ecosystems. Students work in partner groups to complete the "Food Web" worksheet in the science folder. Materials are pre-organized in the green bin on the supply shelf. Partners are posted on the anchor chart near the board.',
      materials: ['Science folders', 'Green supply bin', 'Pencils'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Specials — Gym',
      start_time: '1:15', end_time: '1:55',
      duration_min: 40,
      instructions:
        'Walk students to the gym (Room 101). Pick them up at 1:55. Students line up in alphabetical order for specials.',
      materials: [],
      period_key: null, grade_label: null,
    },
    {
      title: 'Closing / Pack-Up & Dismissal',
      start_time: '2:00', end_time: '2:25',
      duration_min: 25,
      instructions:
        'Students pack up homework folders and agendas. Read aloud for the final 10 minutes from the class read-aloud book on the easel. Dismiss car riders first when you hear the first afternoon bell, then bus riders. Walkers exit last.',
      materials: ['Class read-aloud book'],
      period_key: null, grade_label: null,
    },
  ],
  sign_off:
    'Thank you so much for being here today! The students are kind and generally very well behaved. Please leave a note in the blue binder about how the day went — I always love hearing. Help yourself to anything in the staff room.\n\n— J. Smith',
};

const PRIMARY_CLASSROOM: AgentState = {
  ...BASE,
  school_name: 'Sunrise Elementary School',
  template_id: 'primary-classroom',
  grade: 'Kindergarten',
  subject: 'Self-Contained (All Subjects)',
  grades_covered: [],
  activities: [
    {
      title: 'Morning Arrival',
      start_time: '8:00', end_time: '8:20',
      duration_min: 20,
      instructions:
        'Students arrive and unpack their bags at their cubbies. They take out their snack, put it on the shelf inside their cubby, then sit at their table and begin the morning bin activity (puzzles and pattern blocks). Greet each student at the door.',
      materials: ['Morning bin (on each table)', 'Name tags in cubby pockets'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Morning Meeting',
      start_time: '8:20', end_time: '8:45',
      duration_min: 25,
      instructions:
        'Ring the bell and ask students to sit in a circle on the carpet. Greet each student using the Wave Greeting — one student starts and the wave goes around the circle. Then update the calendar on the easel (day, date, weather). Do a quick counting activity together using the number line.',
      materials: ['Bell', 'Calendar easel', 'Number line'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Literacy Block',
      start_time: '8:45', end_time: '9:45',
      duration_min: 60,
      instructions:
        'Read the morning message on the chart paper together, pointing to each word as you read it. Students repeat each sentence after you. Then read the picture book from the reading basket on the easel. After the story, students return to their seats and complete the phonics worksheet in their literacy folders.',
      materials: ['Morning message chart', 'Picture book (reading basket)', 'Literacy folders'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Math Block',
      start_time: '9:45', end_time: '10:30',
      duration_min: 45,
      instructions:
        'Review counting to 20 using the hundreds chart. Then introduce the "making ten" activity — students use counters and ten frames (in the red math bin) to fill in the worksheet. Walk around and help students who need extra support.',
      materials: ['Hundreds chart (wall)', 'Red math bin (counters + ten frames)', 'Math worksheets'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Specials — Art',
      start_time: '10:35', end_time: '11:05',
      duration_min: 30,
      instructions:
        'Walk students in a single-file quiet line to Room 108 (Art room, first hallway on the right). Pick students up at 11:05. Students line up by table color.',
      materials: [],
      period_key: null, grade_label: null,
    },
    {
      title: 'Lunch',
      start_time: '11:05', end_time: '11:35',
      duration_min: 30,
      instructions:
        'Walk students to the cafeteria using the quiet hallway procedure. Students get their lunch tray or unpack their lunch box. Sit with students to monitor. Walk them back to the classroom when cafeteria staff signal.',
      materials: ['Lunch count list (desk)'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Recess',
      start_time: '11:35', end_time: '12:05',
      duration_min: 30,
      instructions:
        'Head to the playground — the Kindergarten area is the small blacktop to the left of the main playground. Recess equipment bag is hanging by the door. Blow the whistle once to signal "line up." Students freeze and walk to the line.',
      materials: ['Recess equipment bag', 'Whistle'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Afternoon Block — Snack & Centers',
      start_time: '12:05', end_time: '1:30',
      duration_min: 85,
      instructions:
        'Students wash hands and eat their snack at their seats (10 min). Then transition to free-choice centers: blocks, dramatic play, sensory table, or art station. Set the timer for 20 minutes and rotate. Center materials are labeled on the shelves.',
      materials: ['Center bins (labeled shelves)', 'Timer'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Read-Aloud & Rest',
      start_time: '1:30', end_time: '2:00',
      duration_min: 30,
      instructions:
        'Gather students on the carpet. Read aloud the book on the rocking chair — ask a student to pick from the "Cozy Books" basket. After reading, students rest quietly at their desks with their heads down for 10 minutes (soft music on the speaker).',
      materials: ['Cozy Books basket', 'Bluetooth speaker (desk)'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Dismissal',
      start_time: '2:00', end_time: '2:20',
      duration_min: 20,
      instructions:
        'Students pack their backpacks and sit at their seats. Car riders are called first by the office — escort them to the front lobby. Bus riders line up by bus number (list is on the bulletin board). Walkers go last with the crosswalk aide.',
      materials: ['Bus number list (bulletin board)'],
      period_key: null, grade_label: null,
    },
  ],
  sign_off:
    'These kiddos love a good story and respond really well to positive praise — lots of "I love how quietly you\'re working!" goes a long way. Thank you for a wonderful day with them!\n\n— Mrs. T.',
};

const READING_WORKSHOP: AgentState = {
  ...BASE,
  school_name: 'Cedar Ridge Elementary School',
  template_id: 'reading-workshop',
  grade: '3rd',
  subject: 'Reading / ELA',
  grades_covered: [],
  activities: [
    {
      title: 'Read-Aloud — Charlotte\'s Web',
      start_time: '8:45', end_time: '9:00',
      duration_min: 15,
      instructions:
        'The class is on Chapter 7 of Charlotte\'s Web (copy on the easel). Read aloud expressively. Pause after page 58 and ask: "Why do you think Wilbur is so worried?" Accept a few responses before moving on. Students sit on the carpet.',
      materials: ['Charlotte\'s Web (easel)', 'Discussion question card (blue card, teacher desk)'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Mini-Lesson — Finding the Main Idea',
      start_time: '9:00', end_time: '9:20',
      duration_min: 20,
      instructions:
        'Students stay on the carpet. Point to the "Main Idea" anchor chart on the left wall. Explain: "The main idea is what a passage is mostly about — not just one detail." Model with the short passage on the projector. Think aloud, then invite one student to help. Students practice on the sticky note in their notebook.',
      materials: ['Main Idea anchor chart', 'Mini-lesson passage (projector folder)', 'Sticky notes'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Independent Reading',
      start_time: '9:20', end_time: '9:50',
      duration_min: 30,
      instructions:
        'Students go to their seats and read independently from their book bins (one bin per table). The room should be silent — model calm reading behavior. Circulate quietly and tap students on the shoulder if they\'re off task. Students may read on the floor if they finish their book.',
      materials: ['Book bins (one per table)', 'Reading logs (inside bins)'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Reading Stations',
      start_time: '9:50', end_time: '10:25',
      duration_min: 35,
      instructions:
        'Students rotate through 3 stations (timer set for 10 min each):\n• Station 1 — Listening Center: headphones + audiobook tablet by the window.\n• Station 2 — Vocabulary Sort: word cards in the orange envelope, students sort by part of speech.\n• Station 3 — Partner Reading: pairs read the leveled reader from the station basket and take turns asking each other questions.\nStation assignments are on the pocket chart near the door.',
      materials: ['Station pocket chart', 'Timer', 'Orange vocabulary envelopes', 'Leveled readers (blue basket)'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Writing — Response Journal',
      start_time: '10:25', end_time: '10:50',
      duration_min: 25,
      instructions:
        'Students get their response journals from the "Writing" bin on the shelf. Today\'s prompt is written on the whiteboard: "What is the main idea of the chapter we read today? Use at least two details from the text to support your answer." Students write independently. Encourage complete sentences.',
      materials: ['Response journals (Writing bin)', 'Pencils'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Share / Wrap-Up',
      start_time: '10:50', end_time: '11:00',
      duration_min: 10,
      instructions:
        'Call students back to the carpet. Ask 2–3 volunteers to share what they wrote for their main idea response. Give a compliment to each sharer ("Great use of text evidence!"). Remind students to close their journals and put them in the bin.',
      materials: [],
      period_key: null, grade_label: null,
    },
  ],
  sign_off:
    'This group is a joy to read with. They love being called on — don\'t be afraid to cold-call if participation is low, they\'re used to it. Thank you for making literacy fun today!\n\n— Ms. P.',
};

const SPECIALIST_ROTATION: AgentState = {
  ...BASE,
  school_name: 'Lakewood K-8 School',
  template_id: 'specialist-rotation',
  grade: null,
  subject: 'Physical Education',
  grades_covered: ['K', '1', '2', '3', '4', '5'],
  activities: [
    {
      title: '3rd Grade — Basketball Dribbling',
      start_time: '8:30', end_time: '9:15',
      duration_min: 45,
      instructions:
        'Pick up from Mrs. Garcia\'s room (Room 22). Set up the gym with one basketball per student. Warm-up: 3 laps around the gym. Main activity: stationary dribbling practice, then dribble-and-freeze game. Cool down: stretching circle. Walk students back to Room 22.',
      materials: ['Basketballs (ball cart #1)', 'Cones'],
      period_key: null, grade_label: '3rd Grade — Mrs. Garcia',
    },
    {
      title: '1st Grade — Animal Movement',
      start_time: '9:20', end_time: '10:05',
      duration_min: 45,
      instructions:
        'Pick up from Mr. Patel\'s room (Room 8). Warm-up: jog two laps. Main activity: Animal Movement game — call out an animal and students move like that animal (bear crawl, frog jump, penguin waddle). Keep the energy high! Cool down: deep breathing. Return to Room 8.',
      materials: ['Animal cards (folder on desk)', 'Open gym space'],
      period_key: null, grade_label: '1st Grade — Mr. Patel',
    },
    {
      title: '4th Grade — Fitness Circuit',
      start_time: '10:10', end_time: '10:55',
      duration_min: 45,
      instructions:
        'Pick up from Ms. Kim\'s room (Room 28). Set up 6 circuit stations before they arrive (see station cards in the orange binder). Students rotate every 2 minutes on the whistle. Stations: jumping jacks, push-ups, jump rope, balance beam, agility ladder, plank hold. Cool down and return to Room 28.',
      materials: ['Station cards (orange binder)', 'Jump ropes', 'Agility ladder', 'Balance beams', 'Whistle'],
      period_key: null, grade_label: '4th Grade — Ms. Kim',
    },
    {
      title: '2nd Grade — Parachute Activities',
      start_time: '11:00', end_time: '11:45',
      duration_min: 45,
      instructions:
        'Pick up from Mrs. Johnson\'s room (Room 14). Parachute is in the equipment closet. Activities: Mushroom (lift parachute and tuck), Popcorn (add balls and shake), Cat & Mouse (one student under, one on top). Students LOVE this — manage excitement by calling "Freeze!" with the whistle. Return to Room 14.',
      materials: ['Parachute (equipment closet)', 'Soft balls', 'Whistle'],
      period_key: null, grade_label: '2nd Grade — Mrs. Johnson',
    },
    {
      title: 'Kindergarten — Locomotor Skills',
      start_time: '12:30', end_time: '1:15',
      duration_min: 45,
      instructions:
        'Pick up from Mrs. Williams\' room (Room 3). Use cones to set up a large open path. Review locomotor skills: walk, run, hop, skip, gallop, slide. Call one skill at a time and students travel the path. Play "Red Light Green Light" to practice starting and stopping safely. Return to Room 3.',
      materials: ['Cones (set of 20)', 'Poly spots'],
      period_key: null, grade_label: 'Kindergarten — Mrs. Williams',
    },
    {
      title: '5th Grade — Volleyball Introduction',
      start_time: '1:20', end_time: '2:05',
      duration_min: 45,
      instructions:
        'Pick up from Mr. Thompson\'s room (Room 35). Set up the volleyball net. Teach the underhand serve: demonstrate, students practice against the wall. Then light rallying in pairs over the net. Emphasize control over power. Cool down with a 1-minute seated mindfulness stretch. Return to Room 35.',
      materials: ['Volleyball net', 'Volleyballs (ball cart #2)'],
      period_key: null, grade_label: '5th Grade — Mr. Thompson',
    },
  ],
  sign_off:
    'Thank you for keeping the students active and safe today! Equipment goes back in the closet at the end of the day. Please leave a note in the green folder about how each class went.\n\n— Coach M.',
};

const EMERGENCY: AgentState = {
  ...BASE,
  template_id: 'emergency',
  grade: '5th',
  subject: 'Self-Contained',
  grades_covered: [],
  activities: [
    {
      title: 'Independent Quiet Work Packet',
      start_time: '8:30', end_time: '9:30',
      duration_min: 60,
      instructions:
        'Students will find a pre-made activity packet on their desks. The packet includes a reading passage and comprehension questions, a math review page, and a word search. Students work independently and silently. Early finishers may read a book from the classroom library.',
      materials: ['Activity packets (on desks)', 'Pencils', 'Classroom library'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Read-Aloud — Your Choice',
      start_time: '9:30', end_time: '10:00',
      duration_min: 30,
      instructions:
        'Choose any picture book or short chapter from the classroom library shelf (labeled "Sub Tub"). Read aloud to the class. Encourage students to ask questions and share thoughts. This is a calm, enjoyable activity — no written response required.',
      materials: ['Sub Tub shelf (by the window)'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Lunch',
      start_time: '11:30', end_time: '12:00',
      duration_min: 30,
      instructions:
        'Walk students to the cafeteria. See the main office if you need guidance on the lunch routine.',
      materials: ['Lunch list (office/desk)'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Afternoon — Movie / Educational Video',
      start_time: '12:30', end_time: '2:00',
      duration_min: 90,
      instructions:
        'Search "SciShow Kids" or "National Geographic Kids" on YouTube (login on the teacher\'s computer). Play one or two short educational videos. Students may sketch what they see in their notebooks. Keep volume at a comfortable level.',
      materials: ['Smart board / projector', 'Student notebooks'],
      period_key: null, grade_label: null,
    },
  ],
  sign_off: 'Thank you for stepping in on short notice. It is truly appreciated.\n\n— Room 19 Teacher',
};

const HALF_DAY: AgentState = {
  ...BASE,
  template_id: 'half-day',
  grade: '3rd',
  subject: 'Self-Contained',
  grades_covered: [],
  activities: [
    {
      title: 'Morning Arrival & Attendance',
      start_time: '8:15', end_time: '8:30',
      duration_min: 15,
      instructions:
        'Students arrive and complete the morning journal prompt on the board. Take attendance and submit the green folder by 8:30.',
      materials: ['Attendance folder', 'Journal prompts (whiteboard)'],
      period_key: null, grade_label: null,
    },
    {
      title: 'ELA — Reading Response',
      start_time: '8:30', end_time: '9:20',
      duration_min: 50,
      instructions:
        'Read aloud the short story in the reading packet (top of the stack on the desk). Students follow along, then answer the comprehension questions on pages 2–3 independently.',
      materials: ['Reading packets (desk)', 'Pencils'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Math — Review & Practice',
      start_time: '9:20', end_time: '10:10',
      duration_min: 50,
      instructions:
        'Review multiplication facts using the flashcard set in the red bin. Students then complete the math worksheet (fractions on a number line). Go over the first two problems together before independent work.',
      materials: ['Flashcard set (red bin)', 'Math worksheets'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Science Activity',
      start_time: '10:15', end_time: '11:00',
      duration_min: 45,
      instructions:
        'Students complete the "Habitats Sort" activity from the science folder in the blue bin. Partners sort animal and habitat cards and glue them onto the recording sheet. Each pair gets one envelope of cards.',
      materials: ['Science folders (blue bin)', 'Habitat sort envelopes', 'Glue sticks'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Wrap-Up & Early Dismissal',
      start_time: '11:00', end_time: '11:30',
      duration_min: 30,
      instructions:
        'Students pack up all materials and sit at their desks. Read a short picture book from the classroom library while waiting for the early dismissal bell. Car riders are called first.',
      materials: ['Picture book (classroom library)'],
      period_key: null, grade_label: null,
    },
  ],
  sign_off: 'Thank you for covering this morning! The class is familiar with the half-day routine — they know what to expect.\n\n— Room 21 Teacher',
};

const SINGLE_PERIOD: AgentState = {
  ...BASE,
  template_id: 'single-period',
  grade: '6th',
  subject: 'Math',
  grades_covered: [],
  activities: [
    {
      title: 'Warm-Up — Number Talk',
      start_time: '10:15', end_time: '10:25',
      duration_min: 10,
      instructions:
        'Write the problem "34 × 5" on the board. Give students 2 minutes of silent think time, then ask for different strategies. Accept 3–4 responses. The goal is to hear multiple mental math strategies — not just the standard algorithm.',
      materials: ['Whiteboard marker', 'Whiteboard'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Main Activity — Proportional Reasoning',
      start_time: '10:25', end_time: '11:00',
      duration_min: 35,
      instructions:
        'Students open their workbooks to pages 112–113. The lesson is on proportional relationships (unit rates). Work through Example 1 on page 112 together on the board. Then students complete problems 1–8 independently. Walk around and check work — the answer key is in the sub folder on the desk.',
      materials: ['Math workbooks', 'Sub folder (desk, answer key inside)', 'Graph paper (if needed)'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Check & Discuss',
      start_time: '11:00', end_time: '11:10',
      duration_min: 10,
      instructions:
        'Go over problems 1–8 on the board. Call on individual students for each answer. Ask "How did you set that up?" for problems 4 and 7 — these are the trickiest.',
      materials: ['Whiteboard'],
      period_key: null, grade_label: null,
    },
    {
      title: 'Exit Ticket',
      start_time: '11:10', end_time: '11:20',
      duration_min: 10,
      instructions:
        'Distribute the exit ticket (half-sheet, in the blue folder on the desk). Students work silently and turn it in before leaving. Collect all exit tickets in the "Finished Work" tray.',
      materials: ['Exit ticket half-sheets (blue folder)', 'Finished Work tray'],
      period_key: null, grade_label: null,
    },
  ],
  sign_off: 'These students are prepared for this work — don\'t hesitate to push them if they finish early. Thank you!\n\n— Mr. K.',
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const MOCK_STATES: Record<string, AgentState> = {
  'standard-day':        STANDARD_DAY,
  'primary-classroom':   PRIMARY_CLASSROOM,
  'reading-workshop':    READING_WORKSHOP,
  'specialist-rotation': SPECIALIST_ROTATION,
  'emergency':           EMERGENCY,
  'half-day':            HALF_DAY,
  'single-period':       SINGLE_PERIOD,
};

export function getMockState(templateId: string): AgentState {
  return MOCK_STATES[templateId] ?? STANDARD_DAY;
}
