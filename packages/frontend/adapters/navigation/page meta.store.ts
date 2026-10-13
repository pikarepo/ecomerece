// page-meta.store.ts
import { create } from 'zustand';
import type { BreadcrumbItem } from './navigation.types';

interface PageMetaState {
  breadcrumbs: BreadcrumbItem[];
  pageTitle: string;
  pageSubtitle: string | null;

  setPageMeta: (title: string, subtitle?: string | null, breadcrumbs?: BreadcrumbItem[]) => void;
  resetPageMeta: () => void;
}

/**
 * Route-driven header/breadcrumb state.
 *
 * Deliberately its own store: setPageMeta fires on essentially every route
 * change. Bundled with tabs or the command palette, every navigation would
 * re-render those unrelated pieces of UI too.
 */
export const usePageMetaStore = create<PageMetaState>()((set) => ({
  breadcrumbs: [],
  pageTitle: '',
  pageSubtitle: null,

  setPageMeta: (title, subtitle = null, breadcrumbs = []) =>
    set({ pageTitle: title, pageSubtitle: subtitle, breadcrumbs }),

  resetPageMeta: () => set({ breadcrumbs: [], pageTitle: '', pageSubtitle: null }),
}));
