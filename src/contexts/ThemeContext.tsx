import { createContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeName = 'red' | 'blue' | 'green' | 'purple' | 'orange' | 'teal';

export interface ThemeInfo {
  id: ThemeName;
  name_en: string;
  name_ar: string;
  color: string;
  colorDark: string;
}

export const THEMES: ThemeInfo[] = [
  { id: 'red', name_en: 'Blaze', name_ar: 'ناري', color: '#E63946', colorDark: '#B91C1C' },
  { id: 'blue', name_en: 'Ocean', name_ar: 'محيط', color: '#3B82F6', colorDark: '#1D4ED8' },
  { id: 'green', name_en: 'Forest', name_ar: 'غابة', color: '#22C55E', colorDark: '#15803D' },
  { id: 'purple', name_en: 'Royal', name_ar: 'ملكي', color: '#A855F7', colorDark: '#7E22CE' },
  { id: 'orange', name_en: 'Sunset', name_ar: 'غروب', color: '#F97316', colorDark: '#C2410C' },
  { id: 'teal', name_en: 'Fresh', name_ar: 'منعش', color: '#14B8A6', colorDark: '#0F766E' },
];

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themes: ThemeInfo[];
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_KEY = 'bekam_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemeName) || 'red';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update meta theme-color for PWA
    const meta = document.querySelector('meta[name="theme-color"]');
    const themeInfo = THEMES.find(t => t.id === theme);
    if (meta && themeInfo) {
      meta.setAttribute('content', themeInfo.color);
    }
  }, [theme]);

  function setTheme(t: ThemeName) {
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}
