import type { RoomConfig, SeatingLayout } from './types';

const WALL_LABELS: Record<string, string> = {
  north: 'front (board)',
  south: 'back',
  west: 'left',
  east: 'right',
};

// Same window.open + print() pattern as printPlan / printGroups.
export function printSeating(
  className: string,
  room: RoomConfig,
  layout: SeatingLayout,
  nameOf: Map<string, string>,
): void {
  const win = window.open('', '_blank', 'width=900,height=1000');
  if (!win) return;

  const byPos = new Map(layout.assignments.map((a) => [`${a.row},${a.col}`, a.student_id]));
  const date = new Date(layout.generated_at).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  let rowsHtml = '';
  for (let r = 0; r < room.rows; r++) {
    let cells = '';
    for (let c = 0; c < room.cols; c++) {
      const sid = byPos.get(`${r},${c}`);
      cells += sid
        ? `<td class="desk">${escapeHtml(nameOf.get(sid) ?? '')}</td>`
        : '<td class="empty"></td>';
    }
    rowsHtml += `<tr>${cells}</tr>`;
  }

  const windowsLabel = room.windows.map((w) => WALL_LABELS[w.wall]).join(', ');

  win.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Seating Chart — ${escapeHtml(className)}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a2233; margin: 40px; }
  header { border-bottom: 2px solid #1a2233; padding-bottom: 12px; margin-bottom: 8px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .meta { font-size: 13px; color: #555; }
  .front-label { text-align: center; font-size: 12px; letter-spacing: 0.15em; color: #888;
    text-transform: uppercase; margin: 18px 0 6px; }
  table { border-collapse: separate; border-spacing: 8px; margin: 0 auto; }
  td { width: 110px; height: 52px; text-align: center; vertical-align: middle;
    font-size: 14px; border-radius: 6px; }
  td.desk { border: 1.5px solid #444; }
  td.empty { border: 1.5px dashed #ccc; }
  .features { text-align: center; font-size: 12px; color: #777; margin-top: 10px; }
  footer { margin-top: 24px; font-size: 11px; color: #888; text-align: center; }
  @media print { body { margin: 12px; } }
</style>
</head>
<body>
  <header>
    <h1>Seating Chart — ${escapeHtml(className)}</h1>
    <div class="meta">${date} · ${layout.assignments.length} students · Teacher's Pet</div>
  </header>
  <div class="front-label">▲ Front of room (board)</div>
  <table>${rowsHtml}</table>
  <div class="features">
    Door: ${WALL_LABELS[room.door.wall]}${windowsLabel ? ` · Windows: ${windowsLabel}` : ''}
  </div>
  <footer>Generated with Teacher's Pet</footer>
</body>
</html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
