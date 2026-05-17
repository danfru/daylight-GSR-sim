import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export const useTheme = create(
  persist(
    (set, get) => ({
      theme: 'light',
      isDark: false,
      toggle() {
        const next = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: next, isDark: next === 'dark' });
        applyTheme(next);
      },
      init() {
        const t = get().theme;
        set({ isDark: t === 'dark' });
        applyTheme(t);
      },
    }),
    { name: 'ie-gsr-theme' }
  )
);
