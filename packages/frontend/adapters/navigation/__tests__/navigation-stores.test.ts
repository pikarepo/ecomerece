import { describe, expect, it } from 'bun:test';

const sessionData = new Map<string, string>();
const sessionStorageMock = {
  getItem: (key: string) => sessionData.get(key) ?? null,
  setItem: (key: string, value: string) => {
    sessionData.set(key, value);
  },
  removeItem: (key: string) => {
    sessionData.delete(key);
  },
  clear: () => sessionData.clear(),
  key: (index: number) => [...sessionData.keys()][index] ?? null,
  get length() {
    return sessionData.size;
  },
};

Object.defineProperty(globalThis, 'sessionStorage', {
  value: sessionStorageMock,
  configurable: true,
});

const { useShellStore } = await import('../shell.store');
const { useHistoryStackStore } = await import('../history stack.store');
const { useWizardStore } = await import('../wizard.store');
const { usePageMetaStore } = await import('../page meta.store');
const { useTabsStore } = await import('../tabs.store');
const { useCommandPaletteStore } = await import('../command palette.store');
const { resetNavigationState } = await import('../index');

const tab = (id: string, closable = true) => ({
  id,
  label: `Tab ${id}`,
  path: `/tabs/${id}`,
  closable,
});

describe('shell store', () => {
  it('toggles the sidebar and sets drawer state', () => {
    const store = useShellStore;

    expect(store.getState().isSidebarOpen).toBe(true);
    store.getState().toggleSidebar();
    expect(store.getState().isSidebarOpen).toBe(false);
    store.getState().setSidebarOpen(true);
    expect(store.getState().isSidebarOpen).toBe(true);

    store.getState().setMobileDrawerOpen(true);
    expect(store.getState().isMobileDrawerOpen).toBe(true);
  });

  it('tracks the active group key', () => {
    useShellStore.getState().setActiveGroupKey('orders');
    expect(useShellStore.getState().activeGroupKey).toBe('orders');

    useShellStore.getState().setActiveGroupKey(null);
    expect(useShellStore.getState().activeGroupKey).toBeNull();
  });

  it('keeps the collapsed width fixed at 80', () => {
    expect(useShellStore.getState().sidebarCollapsedWidth).toBe(80);
  });
});

describe('history stack store', () => {
  it('pushes, pops in LIFO order and clears', () => {
    const store = useHistoryStackStore;
    store.getState().clearHistory();

    store.getState().pushHistory('/one');
    store.getState().pushHistory('/two');

    expect(store.getState().popHistory()).toBe('/two');
    expect(store.getState().popHistory()).toBe('/one');
    expect(store.getState().popHistory()).toBeUndefined();
    expect(store.getState().historyStack).toEqual([]);

    store.getState().pushHistory('/three');
    store.getState().clearHistory();
    expect(store.getState().historyStack).toEqual([]);
  });
});

describe('wizard store', () => {
  it('moves by value and by updater function', () => {
    const store = useWizardStore;
    store.getState().resetWizard();

    store.getState().setWizardStep(3);
    expect(store.getState().wizardStep).toBe(3);

    store.getState().setWizardStep((previous) => previous + 1);
    expect(store.getState().wizardStep).toBe(4);

    store.getState().setWizardTotalSteps(5);
    expect(store.getState().wizardTotalSteps).toBe(5);
  });

  it('merges wizard data and resets the step and data but keeps the total', () => {
    const store = useWizardStore;
    store.getState().setWizardTotalSteps(6);
    store.getState().setWizardData({ email: 'buyer@example.com' });
    store.getState().setWizardData({ city: 'Springfield' });

    expect(store.getState().wizardData).toEqual({
      email: 'buyer@example.com',
      city: 'Springfield',
    });

    store.getState().setWizardStep(4);
    store.getState().resetWizard();

    expect(store.getState().wizardStep).toBe(1);
    expect(store.getState().wizardData).toEqual({});
    expect(store.getState().wizardTotalSteps).toBe(6);
  });
});

describe('page meta store', () => {
  it('sets the title, subtitle and breadcrumbs', () => {
    usePageMetaStore
      .getState()
      .setPageMeta('Orders', 'All orders', [{ label: 'Home', path: '/' }, { label: 'Orders' }]);

    expect(usePageMetaStore.getState()).toMatchObject({
      pageTitle: 'Orders',
      pageSubtitle: 'All orders',
      breadcrumbs: [{ label: 'Home', path: '/' }, { label: 'Orders' }],
    });
  });

  it('defaults subtitle to null and breadcrumbs to an empty list', () => {
    usePageMetaStore.getState().setPageMeta('Dashboard');

    expect(usePageMetaStore.getState().pageSubtitle).toBeNull();
    expect(usePageMetaStore.getState().breadcrumbs).toEqual([]);
  });

  it('resets back to an empty header', () => {
    usePageMetaStore.getState().setPageMeta('Orders', 'All orders', [{ label: 'Orders' }]);
    usePageMetaStore.getState().resetPageMeta();

    expect(usePageMetaStore.getState()).toMatchObject({
      pageTitle: '',
      pageSubtitle: null,
      breadcrumbs: [],
    });
  });
});

describe('tabs store', () => {
  it('opens a tab, activates it and does not duplicate existing ids', () => {
    const store = useTabsStore;
    store.getState().closeAllTabs();

    store.getState().openTab(tab('a'));
    store.getState().openTab(tab('b'));
    store.getState().openTab(tab('a'));

    expect(store.getState().tabs.map((item) => item.id)).toEqual(['a', 'b']);
    expect(store.getState().activeTabId).toBe('a');
  });

  it('closes the active tab and picks the next one, then the previous', () => {
    const store = useTabsStore;
    store.getState().closeAllTabs();
    store.getState().openTab(tab('a'));
    store.getState().openTab(tab('b'));
    store.getState().openTab(tab('c'));

    store.getState().setActiveTab('b');
    store.getState().closeTab('b');
    expect(store.getState().activeTabId).toBe('c');

    store.getState().closeTab('c');
    expect(store.getState().activeTabId).toBe('a');

    store.getState().closeTab('a');
    expect(store.getState().activeTabId).toBeNull();
  });

  it('leaves the active tab alone when closing another one', () => {
    const store = useTabsStore;
    store.getState().closeAllTabs();
    store.getState().openTab(tab('a'));
    store.getState().openTab(tab('b'));
    store.getState().setActiveTab('a');

    store.getState().closeTab('b');

    expect(store.getState().activeTabId).toBe('a');
  });

  it('keeps pinned tabs when closing others and when closing all', () => {
    const store = useTabsStore;
    store.getState().closeAllTabs();
    store.getState().openTab(tab('pinned', false));
    store.getState().openTab(tab('a'));
    store.getState().openTab(tab('b'));

    store.getState().closeOtherTabs('a');
    expect(store.getState().tabs.map((item) => item.id)).toEqual(['pinned', 'a']);
    expect(store.getState().activeTabId).toBe('a');

    store.getState().closeAllTabs();
    expect(store.getState().tabs.map((item) => item.id)).toEqual(['pinned']);
    expect(store.getState().activeTabId).toBeNull();
  });

  it('persists the tabs into session storage', () => {
    const store = useTabsStore;
    store.getState().closeAllTabs();
    store.getState().openTab(tab('persisted'));

    expect(sessionData.get('tabs-storage')).toContain('persisted');
  });
});

describe('command palette store', () => {
  it('opens and closes the palette and updates the query', () => {
    const store = useCommandPaletteStore;

    store.getState().setCommandPaletteOpen(true);
    expect(store.getState().isCommandPaletteOpen).toBe(true);
    store.getState().setCommandQuery('orders');
    expect(store.getState().commandQuery).toBe('orders');
    store.getState().setCommandPaletteOpen(false);
    expect(store.getState().isCommandPaletteOpen).toBe(false);
  });

  it('ignores blank searches and de-duplicates, newest first', () => {
    const store = useCommandPaletteStore;
    store.getState().clearRecentSearches();

    store.getState().addRecentSearch('   ');
    store.getState().addRecentSearch('orders');
    store.getState().addRecentSearch('products');
    store.getState().addRecentSearch('orders');

    expect(store.getState().recentSearches).toEqual(['orders', 'products']);
  });

  it('caps the recent search list at five entries and clears it', () => {
    const store = useCommandPaletteStore;
    store.getState().clearRecentSearches();

    for (let index = 1; index <= 7; index += 1) {
      store.getState().addRecentSearch(`query-${index}`);
    }

    expect(store.getState().recentSearches).toHaveLength(5);
    expect(store.getState().recentSearches[0]).toBe('query-7');

    store.getState().clearRecentSearches();
    expect(store.getState().recentSearches).toEqual([]);
  });
});

describe('resetNavigationState', () => {
  it('clears page metadata and the history stack together', () => {
    usePageMetaStore.getState().setPageMeta('Orders', 'All orders', [{ label: 'Orders' }]);
    useHistoryStackStore.getState().pushHistory('/orders');

    resetNavigationState();

    expect(usePageMetaStore.getState().pageTitle).toBe('');
    expect(useHistoryStackStore.getState().historyStack).toEqual([]);
  });
});
