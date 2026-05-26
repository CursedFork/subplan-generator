import { useTheme, type Theme } from '@/contexts/ThemeContext';

// Visual representation for each theme — bg is the theme's paper colour,
// dot is the theme's accent (terracotta / teal). These are hardcoded here
// so the swatches always look right regardless of the active theme.
const SWATCHES: {
  id: Theme;
  label: string;
  bg: string;
  dot: string;
}[] = [
  {
    id: 'warm',
    label: 'Warm',
    bg:  'hsl(36 30% 96%)',
    dot: 'hsl(14 65% 52%)',
  },
  {
    id: 'dark',
    label: 'Dark',
    bg:  'hsl(222 22% 11%)',
    dot: 'hsl(14 68% 62%)',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    bg:  'hsl(204 38% 97%)',
    dot: 'hsl(196 65% 40%)',
  },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Choose colour theme">
      {SWATCHES.map(s => {
        const active = theme === s.id;
        return (
          <button
            key={s.id}
            role="radio"
            aria-checked={active}
            aria-label={`${s.label} theme`}
            title={s.label}
            onClick={() => setTheme(s.id)}
            className={`
              relative w-5 h-5 rounded-full transition-all duration-150
              ${active
                ? 'ring-2 ring-offset-2 ring-terracotta ring-offset-paper scale-110'
                : 'opacity-70 hover:opacity-100 hover:scale-105'}
            `}
            style={{ background: s.bg, border: `2px solid ${s.dot}` }}
          >
            {/* Inner accent dot */}
            <span
              className="absolute inset-[4px] rounded-full"
              style={{ background: s.dot }}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
