import { storageAdapter } from '@ecomerece/frontend/storage';
import { create } from 'zustand';

interface ThemeState {
  darkMode: boolean;
  isInitialized: boolean;
  toggleTheme: () => void;
  setDarkMode: (mode: boolean, persist?: boolean) => void;
  initTheme: () => Promise<void>;
}

let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

export const useThemeStore = create<ThemeState>((set, get) => ({
  darkMode: false,
  isInitialized: false,

  toggleTheme: () => {
    get().setDarkMode(!get().darkMode, true);
  },

  setDarkMode: (mode: boolean, persist = true) => {
    set({ darkMode: mode });
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', mode);
      if (persist) {
        void storageAdapter.setItem('theme', mode);
      }
    }
  },

  initTheme: async () => {
    if (get().isInitialized || typeof window === 'undefined') return;

    try {
      await storageAdapter.ensureReady();
      const stored = await storageAdapter.getItem<boolean>('theme');
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const initialMode = stored ?? mediaQuery.matches;

      get().setDarkMode(initialMode, false);
      set({ isInitialized: true });

      if (!mediaQueryListener) {
        mediaQueryListener = (e: MediaQueryListEvent) => {
          void storageAdapter.getItem<boolean>('theme').then((userPreference) => {
            if (userPreference === null) {
              get().setDarkMode(e.matches, false);
            }
          });
        };
        mediaQuery.addEventListener('change', mediaQueryListener);
      }
    } catch {
      set({ isInitialized: true });
    }
  },
}));
