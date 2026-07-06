import { Link } from 'react-router-dom';
import { FileText, Layers, LayoutGrid, Users, type LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';
import { cn } from '@/lib/utils';

type ToolStatus = 'active' | 'coming-soon';

interface ToolDef {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  href: string;
  status: ToolStatus;
}

const TOOLS: ToolDef[] = [
  {
    icon: FileText,
    title: 'Sub Plans',
    description:
      'Generate complete substitute-teacher plans with our AI agent. Covers schedule, activities, contacts, emergency procedures, and more.',
    href: '/plans',
    status: 'active',
  },
  {
    icon: Layers,
    title: 'Worksheet Generator',
    description:
      'Turn any topic and learning objective into a ready-to-print worksheet. Specify grade level and get differentiated versions in seconds.',
    href: '/tools/worksheets',
    status: 'active',
  },
  {
    icon: LayoutGrid,
    title: 'Seating Chart Maker',
    description:
      'Build and manage classroom seating arrangements. Flag accommodations, set "cannot sit near" constraints, and rearrange with ease.',
    href: '/tools/seating-chart',
    status: 'coming-soon',
  },
  {
    icon: Users,
    title: 'Group Mate Maker',
    description:
      'Generate balanced small groups from your class roster — by reading level, IEP status, leadership, or any attribute you track.',
    href: '/tools/groups',
    status: 'active',
  },
];

export default function ToolsIndex() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-display-lg text-ink rule-ornament">Tools</h1>
        <p className="font-sans text-base text-ink-soft mt-4 max-w-xl">
          Everything you need to save time in the classroom, in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {TOOLS.map((tool) =>
          tool.status === 'active' ? (
            <ActiveToolCard key={tool.href} tool={tool} />
          ) : (
            <ComingSoonToolCard key={tool.href} tool={tool} />
          ),
        )}
      </div>
    </div>
  );
}

function ActiveToolCard({ tool }: { tool: ToolDef }) {
  const Icon = tool.icon;
  return (
    <Link
      to={tool.href}
      className={cn(
        'group rounded-md border border-rule bg-paper shadow-card p-7 flex flex-col gap-4 theme-aware',
        'hover:shadow-card-hover hover:border-terracotta/40 transition-all duration-200',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="p-2.5 rounded-md bg-terracotta-soft text-terracotta">
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <span className="text-xs font-sans font-semibold text-sage bg-sage/10 px-2.5 py-1 rounded-full">
          Active
        </span>
      </div>
      <div className="flex-1">
        <h2 className="font-display text-display-md text-ink leading-tight group-hover:text-terracotta transition-colors duration-150">
          {tool.title}
        </h2>
        <p className="font-sans text-sm text-ink-soft mt-2 leading-relaxed">{tool.description}</p>
      </div>
      <span className="font-sans text-sm font-semibold text-terracotta">
        Open →
      </span>
    </Link>
  );
}

function ComingSoonToolCard({ tool }: { tool: ToolDef }) {
  const Icon = tool.icon;
  return (
    <Link
      to={tool.href}
      className={cn(
        'rounded-md border border-rule bg-paper shadow-card p-7 flex flex-col gap-4 theme-aware',
        'hover:shadow-card-hover hover:border-ink-faint/50 transition-all duration-200',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="p-2.5 rounded-md bg-rule/60 text-ink-faint">
          <Icon className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <span className="text-xs font-sans font-semibold text-ink-faint bg-rule/60 px-2.5 py-1 rounded-full">
          Coming soon
        </span>
      </div>
      <div className="flex-1">
        <h2 className="font-display text-display-md text-ink-soft leading-tight">{tool.title}</h2>
        <p className="font-sans text-sm text-ink-faint mt-2 leading-relaxed">{tool.description}</p>
      </div>
      <span className="font-sans text-sm font-semibold text-ink-faint">Learn more →</span>
    </Link>
  );
}
