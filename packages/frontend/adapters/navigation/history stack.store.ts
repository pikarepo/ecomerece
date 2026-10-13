// history-stack.store.ts
import { create } from 'zustand';

interface HistoryStackState {
  historyStack: string[];

  pushHistory: (path: string) => void;
  popHistory: () => string | undefined;
  clearHistory: () => void;
}

/**
 * A generic in-app "back stack", independent of both the browser's history
 * and the wizard step counter. Useful for stacked modals or drill-down
 * panels that need their own back button separate from router history.
 */
export const useHistoryStackStore = create<HistoryStackState>()((set, get) => ({
  historyStack: [],

  pushHistory: (path) =>
    set((state) => ({
      historyStack: [...state.historyStack, path],
    })),

  popHistory: () => {
    const stack = get().historyStack;
    const popped = stack[stack.length - 1];
    set({ historyStack: stack.slice(0, -1) });
    return popped;
  },

  clearHistory: () => set({ historyStack: [] }),
}));
