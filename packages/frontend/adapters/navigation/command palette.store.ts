// command-palette.store.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CommandPaletteState {
  isCommandPaletteOpen: boolean;
  commandQuery: string;
  recentSearches: string[];

  setCommandPaletteOpen: (isOpen: boolean) => void;
  setCommandQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

const MAX_RECENT_SEARCHES = 5;

/**
 * Cmd+K style command palette. `commandQuery` changes on every keystroke,
 * so keeping it isolated here means typing in the palette can't ripple
 * re-renders into tabs, the sidebar, or anything else.
 */
export const useCommandPaletteStore = create<CommandPaletteState>()(
  persist(
    (set, get) => ({
      isCommandPaletteOpen: false,
      commandQuery: '',
      recentSearches: [],

      setCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),
      setCommandQuery: (commandQuery) => set({ commandQuery }),

      addRecentSearch: (query) => {
        if (!query.trim()) return;
        const filtered = get().recentSearches.filter((s) => s !== query);
        set({ recentSearches: [query, ...filtered].slice(0, MAX_RECENT_SEARCHES) });
      },

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'command-palette-storage',
      storage: createJSONStorage(() => sessionStorage),
      // Only recentSearches is worth persisting — open/query state is transient.
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    },
  ),
);
