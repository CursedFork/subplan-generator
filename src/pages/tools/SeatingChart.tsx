import { LayoutGrid, Printer, RotateCcw, UserCheck, Link2, XCircle, Eye, Volume2, Wind, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// ─── Static room mockup ──────────────────────────────────────────────────────

interface DemoSeat {
  row: number;
  col: number;
  initials?: string;
  variant: 'empty' | 'normal' | 'front' | 'iep';
}

const DEMO_SEATS: DemoSeat[] = [
  // Row 0 — front (highlighted)
  { row: 0, col: 0, initials: 'M', variant: 'iep' },
  { row: 0, col: 1, initials: 'S', variant: 'front' },
  { row: 0, col: 2, variant: 'front' },
  { row: 0, col: 3, variant: 'front' },
  { row: 0, col: 4, initials: 'T', variant: 'front' },
  { row: 0, col: 5, variant: 'front' },
  // Row 1
  { row: 1, col: 0, initials: 'K', variant: 'normal' },
  { row: 1, col: 1, variant: 'normal' },
  { row: 1, col: 2, variant: 'normal' },
  { row: 1, col: 3, variant: 'normal' },
  { row: 1, col: 4, variant: 'normal' },
  { row: 1, col: 5, initials: 'J', variant: 'normal' },
  // Row 2
  { row: 2, col: 0, variant: 'normal' },
  { row: 2, col: 1, initials: 'A', variant: 'normal' },
  { row: 2, col: 2, variant: 'normal' },
  { row: 2, col: 3, variant: 'normal' },
  { row: 2, col: 4, variant: 'normal' },
  { row: 2, col: 5, variant: 'normal' },
  // Row 3
  { row: 3, col: 0, initials: 'B', variant: 'normal' },
  { row: 3, col: 1, variant: 'normal' },
  { row: 3, col: 2, variant: 'empty' },
  { row: 3, col: 3, variant: 'empty' },
  { row: 3, col: 4, variant: 'normal' },
  { row: 3, col: 5, variant: 'normal' },
];

const SEAT_W = 44;
const SEAT_H = 32;
const H_GAP = 12;
const V_GAP = 14;
const GRID_LEFT = 100;
const GRID_TOP = 72;
const COLS = 6;

function seatX(col: number) { return GRID_LEFT + col * (SEAT_W + H_GAP); }
function seatY(row: number) { return GRID_TOP + row * (SEAT_H + V_GAP); }

function RoomMockup() {
  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 560 310"
        className="w-full max-w-[560px] mx-auto block"
        aria-label="Static classroom grid mockup"
        role="img"
      >
        <style>{`
          .rm-board   { fill: var(--color-ink); }
          .rm-tdesk   { fill: var(--color-rule); stroke: var(--color-ink-faint); stroke-width: 1; }
          .rm-seat-n  { fill: var(--color-paper); stroke: var(--color-rule); stroke-width: 1.5; }
          .rm-seat-f  { fill: var(--color-terracotta-soft); stroke: var(--color-terracotta); stroke-width: 1.5; }
          .rm-seat-i  { fill: var(--color-terracotta); stroke: var(--color-terracotta); stroke-width: 1.5; }
          .rm-seat-e  { fill: var(--color-paper); stroke: var(--color-rule); stroke-width: 1.5; stroke-dasharray: 4 3; opacity: 0.45; }
          .rm-label   { font-family: var(--font-sans, sans-serif); font-size: 11px; fill: var(--color-ink-soft); }
          .rm-badge   { font-family: var(--font-sans, sans-serif); font-size: 9px; font-weight: 700; fill: var(--color-paper); }
          .rm-init-n  { font-family: var(--font-sans, sans-serif); font-size: 11px; font-weight: 600; fill: var(--color-ink); }
          .rm-init-f  { font-family: var(--font-sans, sans-serif); font-size: 11px; font-weight: 600; fill: var(--color-terracotta); }
          .rm-init-i  { font-family: var(--font-sans, sans-serif); font-size: 11px; font-weight: 700; fill: var(--color-paper); }
          .rm-board-text { font-family: var(--font-sans, sans-serif); font-size: 10px; font-weight: 600; letter-spacing: 0.08em; fill: var(--color-paper); }
          .rm-feat    { font-family: var(--font-sans, sans-serif); font-size: 10px; fill: var(--color-ink-faint); }
          .rm-win     { fill: none; stroke: var(--color-ink-faint); stroke-width: 2; }
          .rm-door    { fill: var(--color-rule); stroke: var(--color-ink-faint); stroke-width: 1; }
        `}</style>

        {/* Board */}
        <rect x={GRID_LEFT} y={18} width={COLS * (SEAT_W + H_GAP) - H_GAP} height={26} rx={3} className="rm-board" />
        <text x={GRID_LEFT + (COLS * (SEAT_W + H_GAP) - H_GAP) / 2} y={35} textAnchor="middle" className="rm-board-text">
          WHITEBOARD
        </text>

        {/* Teacher desk */}
        <rect x={18} y={14} width={66} height={42} rx={4} className="rm-tdesk" />
        <text x={51} y={34} textAnchor="middle" className="rm-label">Teacher</text>
        <text x={51} y={47} textAnchor="middle" className="rm-label">Desk</text>

        {/* Student seats */}
        {DEMO_SEATS.map(({ row, col, initials, variant }) => {
          const x = seatX(col);
          const y = seatY(row);
          const cx = x + SEAT_W / 2;
          const cy = y + SEAT_H / 2;
          const seatClass =
            variant === 'iep' ? 'rm-seat-i' :
            variant === 'front' ? 'rm-seat-f' :
            variant === 'empty' ? 'rm-seat-e' :
            'rm-seat-n';
          const initClass =
            variant === 'iep' ? 'rm-init-i' :
            variant === 'front' ? 'rm-init-f' :
            'rm-init-n';
          return (
            <g key={`${row}-${col}`}>
              <rect x={x} y={y} width={SEAT_W} height={SEAT_H} rx={4} className={seatClass} />
              {initials && (
                <text x={cx} y={cy + 4} textAnchor="middle" className={initClass}>
                  {initials}
                </text>
              )}
            </g>
          );
        })}

        {/* IEP badge on seat 0,0 */}
        <rect x={seatX(0) + SEAT_W - 18} y={seatY(0) - 7} width={20} height={13} rx={3} className="rm-seat-i" />
        <text x={seatX(0) + SEAT_W - 8} y={seatY(0) + 2} textAnchor="middle" className="rm-badge">IEP</text>

        {/* Door — south wall, left side */}
        <rect x={GRID_LEFT} y={seatY(3) + SEAT_H + 10} width={42} height={10} rx={2} className="rm-door" />
        <text x={GRID_LEFT + 21} y={seatY(3) + SEAT_H + 28} textAnchor="middle" className="rm-feat">DOOR</text>

        {/* Windows — east wall */}
        {[0, 1, 2].map((i) => {
          const wx = seatX(COLS - 1) + SEAT_W + 18;
          const wy = seatY(0) + i * 60 + 10;
          return (
            <g key={i}>
              <rect x={wx} y={wy} width={8} height={36} rx={2} className="rm-win" />
            </g>
          );
        })}
        <text
          x={seatX(COLS - 1) + SEAT_W + 34}
          y={seatY(1) + SEAT_H / 2 + 4}
          textAnchor="middle"
          transform={`rotate(90, ${seatX(COLS - 1) + SEAT_W + 34}, ${seatY(1) + SEAT_H / 2 + 4})`}
          className="rm-feat"
        >
          WINDOWS
        </text>

        {/* Row label: FRONT */}
        <text x={GRID_LEFT - 6} y={seatY(0) + SEAT_H / 2 + 4} textAnchor="end" className="rm-feat">
          front
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 px-2">
        {[
          { color: 'bg-terracotta text-paper', label: 'IEP / 504 mandate (hard front)' },
          { color: 'bg-terracotta-soft border border-terracotta', label: 'Needs-front preference' },
          { color: 'bg-paper border border-rule', label: 'Standard seat' },
          { color: 'bg-paper border border-dashed border-rule opacity-50', label: 'No desk here' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs font-sans text-ink-soft">
            <span className={`inline-block w-4 h-3 rounded-sm shrink-0 ${color}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Attribute cards ─────────────────────────────────────────────────────────

interface AttrCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  hardOrSoft: 'hard' | 'soft';
}

const ATTR_CARDS: AttrCard[] = [
  {
    icon: <UserCheck className="w-4 h-4" />,
    title: 'IEP / 504 seating mandate',
    description: 'Upgrades "needs front" from a preference to a hard constraint the solver cannot violate.',
    hardOrSoft: 'hard',
  },
  {
    icon: <Eye className="w-4 h-4" />,
    title: 'Needs front row',
    description: 'Vision or hearing accommodation. Hard when IEP flag is set; soft preference otherwise.',
    hardOrSoft: 'soft',
  },
  {
    icon: <XCircle className="w-4 h-4" />,
    title: 'Cannot sit near',
    description: 'One or more students who must not be adjacent or close. Conflict pairs — the solver enforces all of them.',
    hardOrSoft: 'hard',
  },
  {
    icon: <Link2 className="w-4 h-4" />,
    title: 'Works well with',
    description: 'Students who benefit from proximity. Soft preference — solver places them adjacent when possible.',
    hardOrSoft: 'soft',
  },
  {
    icon: <Wind className="w-4 h-4" />,
    title: 'Avoid door / window / traffic',
    description: 'Keep this student away from the exit, windows, or busy spots like the pencil sharpener.',
    hardOrSoft: 'soft',
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: 'Focus & behavior rating',
    description: 'Two separate 1–5 scales. Solver scatters low-focus and high-challenge students across the room.',
    hardOrSoft: 'soft',
  },
  {
    icon: <Volume2 className="w-4 h-4" />,
    title: 'Fixed seat override',
    description: 'Pin a student to an exact grid position. Solver places them first and works around it.',
    hardOrSoft: 'hard',
  },
  {
    icon: <UserCheck className="w-4 h-4" />,
    title: 'Preferred side',
    description: 'Left or right — for left-handed students who need an aisle seat on the correct side.',
    hardOrSoft: 'soft',
  },
];

// ─── How it works steps ───────────────────────────────────────────────────────

const STEPS = [
  {
    number: '1',
    title: 'Configure your room',
    body: 'Enter dimensions (rows × cols of desks), mark which wall has the board, and note the door and window positions.',
  },
  {
    number: '2',
    title: 'Build your roster',
    body: 'Add students and tag their preferences — IEP mandate, cannot-sit-near pairs, focus level, or a fixed seat.',
  },
  {
    number: '3',
    title: 'Generate and print',
    body: 'One click produces an optimized layout. Regenerate any time — for new terms, new constraints, or just to try a fresh arrangement.',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SeatingChartPage() {
  return (
    <div className="space-y-10 max-w-3xl">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-md bg-terracotta-soft text-terracotta shrink-0">
            <LayoutGrid className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-sans font-semibold text-ink-faint bg-rule/60 px-2.5 py-1 rounded-full">
            Coming soon
          </span>
        </div>
        <h1 className="font-display text-display-lg text-ink">Seating Chart Maker</h1>
        <p className="font-sans text-base text-ink-soft mt-3 max-w-2xl leading-relaxed">
          Describe your room once — dimensions, door, windows, features — then track per-student
          constraints like IEP mandates, cannot-sit-near pairs, and focus levels. The tool
          generates an optimized layout in one click and flags any conflicts it can't resolve.
          Regenerate any time: new term, new constraints, or just a fresh start.
        </p>
      </div>

      {/* Room mockup */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-1 rule-ornament">
          Your classroom as a grid
        </h2>
        <p className="font-sans text-sm text-ink-soft mt-4 mb-6 leading-relaxed">
          Row 0 is the front (nearest the board). Column 0 is left when facing the board.
          Door and window positions are marked on the walls — the solver uses these to
          apply avoid-door and avoid-window constraints.
        </p>
        <RoomMockup />
      </Card>

      {/* How it works */}
      <div>
        <h2 className="font-display text-display-md text-ink rule-ornament mb-6">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {STEPS.map(({ number, title, body }) => (
            <div key={number} className="rounded-md border border-rule bg-paper shadow-card p-6 theme-aware">
              <div className="w-7 h-7 rounded-full bg-terracotta-soft text-terracotta flex items-center justify-center font-display font-semibold text-sm mb-4">
                {number}
              </div>
              <h3 className="font-display text-display-sm text-ink mb-2">{title}</h3>
              <p className="font-sans text-sm text-ink-soft leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-student attributes */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-1 rule-ornament">
          What you track per student
        </h2>
        <p className="font-sans text-sm text-ink-soft mt-4 mb-6 leading-relaxed">
          Each attribute is stored on the student record and carries into both the Seating Chart
          and the Group Mate Maker. Add what you know — unset attributes are simply ignored.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ATTR_CARDS.map(({ icon, title, description, hardOrSoft }) => (
            <div key={title} className="flex gap-3 p-4 rounded-md border border-rule bg-paper theme-aware">
              <div className="p-1.5 rounded bg-terracotta-soft text-terracotta shrink-0 self-start">
                {icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-sans text-sm font-semibold text-ink">{title}</span>
                  <span className={[
                    'text-[10px] font-sans font-bold px-1.5 py-0.5 rounded-full',
                    hardOrSoft === 'hard'
                      ? 'bg-ink text-paper'
                      : 'bg-rule/60 text-ink-soft',
                  ].join(' ')}>
                    {hardOrSoft === 'hard' ? 'hard' : 'soft'}
                  </span>
                </div>
                <p className="font-sans text-xs text-ink-soft leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex gap-4 text-xs font-sans text-ink-faint">
          <span>
            <strong className="font-semibold text-ink">hard</strong> — solver cannot violate this constraint
          </span>
          <span>
            <strong className="font-semibold text-ink">soft</strong> — solver tries its best; warns when it can't
          </span>
        </div>
      </Card>

      {/* Room config */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-1 rule-ornament">
          What you set up once per room
        </h2>
        <p className="font-sans text-sm text-ink-soft mt-4 mb-5 leading-relaxed">
          Room config is shared across all arrangements for that room — change a detail once
          and every future layout picks it up.
        </p>
        <ul className="space-y-3">
          {[
            ['Grid size', 'Rows × columns of desks — e.g. 4 rows × 6 columns.'],
            ['Front wall', 'Which physical wall the board is on (north / south / east / west). Sets the orientation of the grid.'],
            ['Door position', 'Which wall the main door is on. Used for avoid-door constraint scoring.'],
            ['Windows', 'One or more walls with windows. Used for avoid-window scoring.'],
            ['High-traffic spots', 'Specific desk positions near a pencil sharpener, cubby bank, or bathroom pass hook.'],
            ['Teacher desk', 'Optional — mark its grid position if it sits within the student area.'],
            ['Enabled seats', 'Leave blank for a full rectangle. Mark specific positions to remove if your room has an irregular shape.'],
          ].map(([label, desc]) => (
            <li key={label} className="flex gap-3 text-sm font-sans">
              <span className="font-semibold text-ink shrink-0 w-36">{label}</span>
              <span className="text-ink-soft">{desc}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Features list */}
      <Card>
        <h2 className="font-display text-display-md text-ink mb-2 rule-ornament">
          What you get
        </h2>
        <ul className="mt-4 space-y-3 font-sans text-sm text-ink-soft">
          {[
            'Constraint violations flagged clearly — no silent failures.',
            'Hard constraints always honored; soft constraints resolved with a transparent warning if they conflict.',
            'Regenerate in one click — great for new semesters, behavior resets, or trying a new arrangement.',
            [<Printer key="p" className="w-3.5 h-3.5 inline mb-0.5 mr-0.5" />, 'Print a clean chart to leave for a substitute.'],
            [<RotateCcw key="r" className="w-3.5 h-3.5 inline mb-0.5 mr-0.5" />, 'Roster syncs automatically with the Group Mate Maker.'],
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta mt-1.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* CTA */}
      <div>
        <div className="relative group inline-block">
          <Button disabled size="lg">
            Create a seating chart
          </Button>
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-ink text-paper text-xs px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Coming soon
          </div>
        </div>
        <p className="font-sans text-xs text-ink-faint mt-3">
          This tool is in development. Check back soon.
        </p>
      </div>

    </div>
  );
}
