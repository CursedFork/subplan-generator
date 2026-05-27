import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Theme = 'warm' | 'dark' | 'ocean';

const ALL_THEMES: Theme[] = ['warm', 'dark', 'ocean'];
const STORAGE_KEY = 'teacherspet-theme';

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && (ALL_THEMES as string[]).includes(stored)) return stored;
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
  // Fall back to OS preference
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    // matchMedia unavailable
  }
  return 'warm';
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'warm',
  setTheme: () => undefined,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
