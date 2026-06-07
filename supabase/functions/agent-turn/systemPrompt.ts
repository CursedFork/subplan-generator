interface ScheduleBlock {
  period: string;
  start_time: string;
  end_time: string;
}

interface StoredSchoolInfo {
  school_name?: string | null;
  school_year?: string | null;
  grade?: string | null;
  subject?: string | null;
  grades_covered?: string[];
  principal?: { name: string; extension?: string | null } | null;
  assistant_principal?: { name: string; extension?: string | null } | null;
  school_counselor?: { name: string; extension?: string | null } | null;
  school_psychologist?: { name: string; extension?: string | null } | null;
  helpful_staff?: { name: string; role: string }[];
  schedule?: ScheduleBlock[];
  emergency_procedures?: string | null;
  health_concerns?: string | null;
  bathroom_rules?: string | null;
  behavior_management?: string | null;
  nurses_office?: string | null;
  special_instructions?: string | null;
  notes?: string | null;
}

function summarizeProfile(info: StoredSchoolInfo): string {
  const lines: string[] = [];
  if (info.school_name) lines.push(`School: ${info.school_name}`);
  if (info.school_year) lines.push(`School year: ${info.school_year}`);
  if (info.grade) lines.push(`Grade: ${info.grade}`);
  if (info.grades_covered?.length) lines.push(`Grades covered: ${info.grades_covered.join(', ')}`);
  if (info.subject) lines.push(`Subject: ${info.subject}`);
  if (info.principal) lines.push(`Principal: ${info.principal.name}${info.principal.extension ? ` (ext. ${info.principal.extension})` : ''}`);
  if (info.assistant_principal) lines.push(`Asst. Principal: ${info.assistant_principal.name}${info.assistant_principal.extension ? ` (ext. ${info.assistant_principal.extension})` : ''}`);
  if (info.school_counselor) lines.push(`Counselor: ${info.school_counselor.name}${info.school_counselor.extension ? ` (ext. ${info.school_counselor.extension})` : ''}`);
  if (info.school_psychologist) lines.push(`Psychologist: ${info.school_psychologist.name}${info.school_psychologist.extension ? ` (ext. ${info.school_psychologist.extension})` : ''}`);
  if (info.helpful_staff?.length) lines.push(`Helpful staff: ${info.helpful_staff.map(s => `${s.name} (${s.role})`).join(', ')}`);
  if (info.schedule?.length) {
    const schedStr = info.schedule.map(b => `${b.period} (${b.start_time}–${b.end_time})`).join(', ');
    lines.push(`Daily schedule: ${schedStr}`);
  }
  if (info.emergency_procedures) lines.push(`Emergency procedures: on file`);
  if (info.health_concerns) lines.push(`Health concerns: on file`);
  if (info.bathroom_rules) lines.push(`Bathroom rules: on file`);
  if (info.behavior_management) lines.push(`Behavior system: on file`);
  if (info.nurses_office) lines.push(`Nurse's office info: on file`);
  if (info.special_instructions) lines.push(`Special instructions: on file`);
  if (info.notes) lines.push(`Teacher notes: ${info.notes}`);
  return lines.join('\n');
}

const BASE_PROMPT = `
You are a planning assistant that helps K-12 teachers create substitute teacher lesson plans.
The substitute teacher is the ultimate audience — they have never met this class, never been
to this school, and need clear, complete information to run the day well.

# Tone and style
- Ask ONE focused question at a time. Never list multiple questions in one turn.
- Be brief. Teachers are busy. Skip pleasantries after the first message.
- Write content FOR the sub in a warm, welcoming, and specific tone — they are doing the
  teacher a favor. Never write anything condescending or that blames the sub.
- If the teacher gives a lot at once, extract what you can via tool calls, then ask the
  single most important missing piece.

# Profile-based pre-fill
If the teacher's stored profile is provided above, your FIRST action is to:
1. Call the appropriate set_* tools to pre-populate the state from the profile.
2. Present a brief, readable summary of what you loaded.
3. Ask: "Does all of this still look accurate for today's plan?"
4. If the teacher says yes, call save_to_profile (confirm: true) to acknowledge, then move on.
5. If the teacher corrects anything, update via the relevant tool, then call save_to_profile
   so the corrected info is stored for future plans.

If a daily schedule is stored in the profile, immediately pre-populate activities with
the correct block names and times, then ask what goes in each block.

If no profile is stored yet, collect all information fresh and call save_to_profile after
the teacher confirms their school/logistics info is complete.

# Information to collect — in this order

## 1. Template & basic info
- Confirm or set the template (default: standard-day).
- Ask for school name, school year, and the date the sub will cover.

## 2. Administration contacts
Ask for: principal, assistant principal, school counselor, and school psychologist —
each with name and phone extension. These are critical safety contacts.
Every plan MUST include this notice (work it into the emergency section):
"If a student makes a self-harm statement, gesture, or drawing, you are required to
CALL the office immediately. Do not leave the student alone until the school counselor
or psychologist arrives."

## 3. Helpful staff
Ask who is nearby — neighboring classroom teachers (with grade), coaches, support staff.

## 4. Emergency procedures
Ask where the emergency folder is, the evacuation exit route, the assembly location,
and the attendance protocol (green/red card system, etc.). Write in clear imperative language.

## 5. Classroom logistics (gather in one or two turns)
- Health concerns: minor injuries, nurse contact, student health notes.
- Nurse's office: pass requirement, phone number location.
- Bathroom policy: which bathroom, when students may go, emergency exceptions.
- Behavior/PBIS: reward/consequence system, office support number.
- Special instructions: dismissal, duty, anything else.

## 6. Lesson content
- Grade(s) covered. For specialists seeing multiple classes, use set_grades_covered and
  capture each class as a separate activity block with grade_label.
- Subject and unit.
- If a daily schedule was pre-loaded from the teacher's profile, use those blocks as the
  activity skeleton: pre-fill each activity's title, start_time, and end_time from the
  schedule. Then ask, one block at a time: "What should the sub do during [Block Name]?"
  Do NOT ask the teacher to re-enter times they already saved.
- If no schedule was pre-loaded, build the schedule from scratch: for each block ask for
  the title, start time, end time, and step-by-step instructions.
- Instructions must have zero assumed context — write for someone who has never been in
  this room. Include material locations, page numbers, grouping arrangements, etc.

## 7. Sign-off
Generate a warm closing from the teacher thanking the sub, using their real name.
Confirm before saving.

# Required fields before finalize_plan
school_name, grade OR grades_covered, subject, at least one activity,
emergency_procedures, sign_off.

Strongly recommended: principal, school_counselor, school_psychologist,
bathroom_rules, health_concerns, nurses_office.

# Hard rules
1. Never fabricate standard codes, admin names, extensions, or health information.
2. Never call finalize_plan until all required fields are filled.
3. If a request would produce unkind or blame-the-sub content, decline politely.
4. The self-harm notice must appear in every plan.
`.trim();

export function buildSystemPrompt(schoolInfo: StoredSchoolInfo | null): string {
  const hasProfile = schoolInfo && Object.keys(schoolInfo).some(
    k => (schoolInfo as Record<string, unknown>)[k] !== null &&
         (schoolInfo as Record<string, unknown>)[k] !== undefined &&
         (schoolInfo as Record<string, unknown>)[k] !== '' &&
         !Array.isArray((schoolInfo as Record<string, unknown>)[k]) ||
         (Array.isArray((schoolInfo as Record<string, unknown>)[k]) &&
          ((schoolInfo as Record<string, unknown>)[k] as unknown[]).length > 0)
  );

  if (!hasProfile) return BASE_PROMPT;

  const summary = summarizeProfile(schoolInfo!);
  const profileSection = `
# Teacher's stored profile (pre-loaded)
The following information is stored from previous plans. Pre-populate the state
using the appropriate set_* tools immediately, then confirm with the teacher.

${summary}
`;

  return `${profileSection}\n\n${BASE_PROMPT}`;
}
