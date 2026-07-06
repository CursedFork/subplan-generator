import type { GroupingResult } from './types';

// Same window.open + document.write + print() pattern as printPlan.ts —
// no PDF library needed; the browser's print dialog offers "Save as PDF".
export function printGroups(
  className: string,
  result: GroupingResult,
  nameOf: Map<string, string>,
): void {
  const win = window.open('', '_blank', 'width=800,height=1000');
  if (!win) return;

  const date = new Date(result.generated_at).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const groupsHtml = result.groups
    .map(
      (g) => `
      <div class="group">
        <h2>${escapeHtml(g.label)}</h2>
        <ul>
          ${g.student_ids.map((id) => `<li>${escapeHtml(nameOf.get(id) ?? 'Unknown')}</li>`).join('')}
        </ul>
      </div>`,
    )
    .join('');

  win.document.write(`<!DOCTYPE html>
<html>
<head>
<title>Groups — ${escapeHtml(className)}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #1a2233; margin: 40px; }
  header { border-bottom: 2px solid #1a2233; padding-bottom: 12px; margin-bottom: 24px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .meta { font-size: 13px; color: #555; }
  .groups { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  .group { border: 1px solid #ccc; border-radius: 6px; padding: 12px 16px; page-break-inside: avoid; }
  .group h2 { font-size: 15px; margin: 0 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
  .group ul { margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.7; }
  footer { margin-top: 28px; font-size: 11px; color: #888; }
  @media print { body { margin: 16px; } }
</style>
</head>
<body>
  <header>
    <h1>Groups — ${escapeHtml(className)}</h1>
    <div class="meta">${date} · ${result.groups.length} groups · Teacher's Pet</div>
  </header>
  <div class="groups">${groupsHtml}</div>
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
