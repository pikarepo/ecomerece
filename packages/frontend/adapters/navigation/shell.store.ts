// shell.store.ts
import { create } from 'zustand';

interface ShellState {
  isSidebarOpen: boolean;
  isMobileDrawerOpen: boolean;
  sidebarCollapsedWidth: number;
  activeGroupKey: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setMobileDrawerOpen: (isOpen: boolean) => void;
  setActiveGroupKey: (key: string | null) => void;
}

/**
 * Shell-level chrome: sidebar, mobile drawer, expanded nav group.
 *
 * Not persisted. This is viewport/layout state, not data a user expects to
 * survive a refresh — and it changes often enough (every sidebar toggle,
 * every drawer open) that persisting it would mean a write on every click.
 */
export const useShellStore = create<ShellState>()((set) => ({
  isSidebarOpen: true,
  isMobileDrawerOpen: false,
  sidebarCollapsedWidth: 80,
  activeGroupKey: null,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  setMobileDrawerOpen: (isMobileDrawerOpen) => set({ isMobileDrawerOpen }),
  setActiveGroupKey: (activeGroupKey) => set({ activeGroupKey }),
}));
