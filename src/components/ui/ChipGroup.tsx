import { cn } from '@/lib/utils';

interface ChipOption {
  value: string;
  label: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export function ChipGroup({ options, value, onChange, className }: ChipGroupProps) {
  function toggle(v: string) {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else {
      onChange([...value, v]);
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="group">
      {options.map((opt) => {
        const selected = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            aria-pressed={selected}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-sans font-medium transition-all duration-150',
              'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
              selected
                ? 'bg-terracotta text-paper border-terracotta'
                : 'bg-paper text-ink-soft border-rule hover:border-terracotta/50 hover:text-ink',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
