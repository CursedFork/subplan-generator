import type { AgentState, AdminContact } from '@/types/app';

// Build the raw HTML string for a plan — used both for printing and preview.
export function buildPlanHtml(state: AgentState, teacherName: string | null): string {
  return buildHtml(state, teacherName);
}

// Open a new window with a print-ready HTML document and trigger the browser's
// Save as PDF dialog. No external libraries required.
export function printPlan(state: AgentState, teacherName: string | null): void {
  const html = buildHtml(state, teacherName);
  const win = window.open('', '_blank', 'width=960,height=720');
  if (!win) {
    alert('Please allow pop-ups for this site to save the plan as PDF.');
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  // Small delay so the browser finishes rendering before the print dialog opens.
  setTimeout(() => { win.print(); }, 350);
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

function buildHtml(state: AgentState, teacherName: string | null): string {
  const gradeDisplay =
    state.grades_covered.length > 1
      ? state.grades_covered.join(', ')
      : (state.grade ?? null);

  const scheduleHtml = buildSchedule(state);
  const logisticsHtml = buildLogistics(state);
  const contactsHtml = buildContacts(state);
  const staffHtml = buildStaff(state);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Teacher's Pet — Sub Plan${state.school_name ? ' — ' + esc(state.school_name) : ''}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 11pt;
      color: #111;
      background: #fff;
      padding: 0.55in 0.7in;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2.5px solid #111;
      padding-bottom: 10px;
      margin-bottom: 18px;
    }
    .header-title { font-size: 26pt; font-weight: bold; letter-spacing: -0.5px; }
    .header-sub   { font-size: 10pt; color: #555; margin-top: 4px; }
    .header-meta  { text-align: right; font-size: 9.5pt; line-height: 1.9; }
    .header-meta .lbl { font-weight: bold; font-size: 8.5pt; text-transform: uppercase;
                        letter-spacing: 0.07em; color: #666; }

    /* ── Section headings ── */
    h2 {
      font-size: 8.5pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-bottom: 1px solid #aaa;
      padding-bottom: 3px;
      margin: 20px 0 10px;
      color: #333;
    }

    /* ── Schedule table ── */
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    thead th {
      background: #111;
      color: #fff;
      text-align: left;
      padding: 6px 10px;
      font-size: 8.5pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.07em;
    }
    tbody td {
      padding: 7px 10px;
      border: 1px solid #ccc;
      vertical-align: top;
      line-height: 1.5;
    }
    tbody tr:nth-child(even) td { background: #fafaf8; }
    .col-time    { width: 115px; font-weight: bold; white-space: nowrap; color: #333; }
    .col-subject { width: 140px; font-weight: bold; }
    .col-grade   { font-size: 8.5pt; color: #777; font-weight: normal; display: block; }
    .materials   { margin-top: 5px; font-size: 9pt; color: #555; }

    /* ── Logistics grid ── */
    .logistics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 28px;
    }
    .logistics-item h3 {
      font-size: 9pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #555;
      margin-bottom: 3px;
    }
    .logistics-item p {
      font-size: 10pt;
      line-height: 1.5;
      white-space: pre-wrap;
    }

    /* ── Contacts & staff ── */
    .contacts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 28px;
      font-size: 10pt;
    }
    .contact-row { display: flex; gap: 6px; align-items: baseline; }
    .contact-lbl { font-weight: bold; font-size: 9pt; color: #555; min-width: 130px; }
    .staff-list  { font-size: 10pt; }
    .staff-list li { padding: 2px 0; list-style: none; }
    .staff-name  { font-weight: bold; }

    /* ── Sign-off ── */
    .sign-off {
      margin-top: 22px;
      padding-top: 12px;
      border-top: 1px solid #ccc;
      font-style: italic;
      font-size: 10pt;
      color: #444;
      white-space: pre-wrap;
    }
    .thank-you {
      margin-top: 14px;
      font-size: 10pt;
      color: #666;
    }

    /* ── Print overrides ── */
    @media print {
      body { padding: 0; }
      @page { margin: 0.55in 0.7in; }
      h2 { page-break-after: avoid; }
      tr  { page-break-inside: avoid; }
      .logistics-grid { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

<div class="header">
  <div>
    <div class="header-title">Teacher's Pet</div>
    ${state.school_name || state.school_year
      ? `<div class="header-sub">${
          [state.school_name, state.school_year]
            .filter((v): v is string => Boolean(v))
            .map(esc)
            .join(' &bull; ')
        }</div>`
      : ''}
  </div>
  <div class="header-meta">
    ${teacherName       ? `<div><span class="lbl">Teacher</span>&nbsp; ${esc(teacherName)}</div>` : ''}
    ${state.date        ? `<div><span class="lbl">Date</span>&nbsp; ${esc(state.date)}</div>` : ''}
    ${gradeDisplay      ? `<div><span class="lbl">Grade</span>&nbsp; ${esc(gradeDisplay)}</div>` : ''}
    ${state.subject     ? `<div><span class="lbl">Subject</span>&nbsp; ${esc(state.subject)}</div>` : ''}
  </div>
</div>

${scheduleHtml}
${logisticsHtml}
${contactsHtml || staffHtml
  ? `<h2>Contacts &amp; Helpful Staff</h2>
     <div class="contacts-grid">
       <div>${contactsHtml}</div>
       <div>${staffHtml}</div>
     </div>`
  : ''}
${state.sign_off
  ? `<div class="sign-off">${esc(state.sign_off)}</div>`
  : ''}
<p class="thank-you">Thank you for covering today.</p>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildSchedule(state: AgentState): string {
  if (!state.activities.length) return '';

  const rows = state.activities.map(a => {
    const time =
      a.start_time && a.end_time ? `${a.start_time}&ndash;${a.end_time}`
      : a.start_time ?? (a.duration_min ? `${a.duration_min}&nbsp;min` : '');

    const gradeSpan = a.grade_label
      ? `<span class="col-grade">${esc(a.grade_label)}</span>`
      : '';

    const mats = a.materials.length
      ? `<div class="materials"><strong>Materials:</strong> ${a.materials.map(esc).join(', ')}</div>`
      : '';

    return `<tr>
      <td class="col-time">${time}</td>
      <td class="col-subject">${esc(a.title)}${gradeSpan}</td>
      <td>${esc(a.instructions)}${mats}</td>
    </tr>`;
  });

  return `<h2>Schedule</h2>
<table>
  <thead>
    <tr>
      <th class="col-time">Time</th>
      <th class="col-subject">Period / Subject</th>
      <th>What To Do</th>
    </tr>
  </thead>
  <tbody>${rows.join('')}</tbody>
</table>`;
}

function buildLogistics(state: AgentState): string {
  const pairs: [string, string | null][] = [
    ['Emergency Procedures', state.emergency_procedures],
    ['Health Concerns', state.health_concerns],
    ['Bathroom Rules', state.bathroom_rules],
    ["Nurse's Office", state.nurses_office],
    ['Behavior / PBIS', state.behavior_management],
    ['Special Instructions', state.special_instructions],
  ];
  const filled = pairs.filter(([, v]) => Boolean(v));
  if (!filled.length) return '';

  const items = filled
    .map(([label, value]) =>
      `<div class="logistics-item">
        <h3>${esc(label)}</h3>
        <p>${esc(value ?? '')}</p>
      </div>`)
    .join('');

  return `<h2>Classroom Logistics</h2>
<div class="logistics-grid">${items}</div>`;
}

function buildContacts(state: AgentState): string {
  const rows: [string, AdminContact | null][] = [
    ['Principal', state.principal],
    ['Asst. Principal', state.assistant_principal],
    ['School Counselor', state.school_counselor],
    ['School Psychologist', state.school_psychologist],
  ];
  const filled = rows.filter(([, c]) => c?.name);
  if (!filled.length) return '';

  return filled
    .map(([label, c]) =>
      `<div class="contact-row">
        <span class="contact-lbl">${esc(label)}</span>
        <span>${esc(c!.name)}${c!.extension ? ` <span style="color:#666">(${esc(c!.extension)})</span>` : ''}</span>
      </div>`)
    .join('');
}

function buildStaff(state: AgentState): string {
  if (!state.helpful_staff.length) return '';
  const items = state.helpful_staff
    .map(s =>
      `<li>
        <span class="staff-name">${esc(s.name)}</span>
        ${s.role ? `<span style="color:#555"> &mdash; ${esc(s.role)}</span>` : ''}
      </li>`)
    .join('');
  return `<ul class="staff-list">${items}</ul>`;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
