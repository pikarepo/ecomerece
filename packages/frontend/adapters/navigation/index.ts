// index.ts
// Single import surface for the split navigation stores. Components should
// import from here rather than reaching into individual store files, so the
// internal split can change without touching call sites.

import { useHistoryStackStore } from './history stack.store';
import { usePageMetaStore } from './page meta.store';

export * from './command palette.store';
export * from './history stack.store';
export * from './page meta.store';
export * from './shell.store';
export * from './tabs.store';
export * from './wizard.store';

/**
 * Compat helper mirroring the old monolithic store's `resetNavigation`,
 * for call sites (e.g. logout, top-level route change) that need to clear
 * breadcrumbs/title and the back-stack together. Call outside render.
 */
export const resetNavigationState = () => {
  usePageMetaStore.getState().resetPageMeta();
  useHistoryStackStore.getState().clearHistory();
};
