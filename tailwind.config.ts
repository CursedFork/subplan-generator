import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'hsl(var(--paper) / <alpha-value>)',
        ink: 'hsl(var(--ink) / <alpha-value>)',
        'ink-soft': 'hsl(var(--ink-soft) / <alpha-value>)',
        'ink-faint': 'hsl(var(--ink-faint) / <alpha-value>)',
        terracotta: 'hsl(var(--terracotta) / <alpha-value>)',
        'terracotta-soft': 'hsl(var(--terracotta-soft) / <alpha-value>)',
        sage: 'hsl(var(--sage) / <alpha-value>)',
        rule: 'hsl(var(--rule) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['clamp(3rem, 6vw, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 4vw, 3rem)',  { lineHeight: '1.1',  letterSpacing: '-0.015em' }],
        'display-md': ['1.875rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 2px hsl(var(--ink) / 0.04), 0 4px 12px hsl(var(--ink) / 0.04)',
        'card-hover': '0 2px 4px hsl(var(--ink) / 0.06), 0 8px 24px hsl(var(--ink) / 0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
