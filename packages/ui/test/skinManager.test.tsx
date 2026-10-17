import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { SkinManager, type SkinManagerItem } from '../components/modules/SkinManager';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const sampleItems: SkinManagerItem[] = [
  {
    id: 'system',
    label: 'System',
    swatch: ['#FFF', '#000'],
    dimension: '2d',
    cost: 'low',
    status: 'active',
    bytes: 4000,
  },
  {
    id: 'glass',
    label: 'Glass',
    swatch: ['#000', '#FFF'],
    dimension: '2d',
    cost: 'high',
    status: 'cached',
    bytes: 20000,
  },
  {
    id: 'neobrutal',
    label: 'Neo Brutal',
    swatch: ['#FF0', '#000'],
    dimension: '2d',
    cost: 'medium',
    status: 'remote',
  },
];

describe('SkinManager', () => {
  test('renders active/cached/remote statuses and sizes', () => {
    const { container, unmount } = render(
      createElement(SkinManager, {
        items: sampleItems,
        totalBytes: 24000,
        maxBytes: 512000,
        onInstall: () => {},
        onRefresh: () => {},
        onRemove: () => {},
        onClearAll: () => {},
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Installed skins');
    expect(text).toContain('Active');
    expect(text).toContain('Cached');
    expect(text).toContain('Remote');
    expect(text).toContain('3.9 KB'); // 4000
    expect(text).toContain('19.5 KB'); // 20000
    unmount();
  });

  test('calls onInstall/onRefresh/onRemove', () => {
    let installed = 0;
    let refreshed = 0;
    let removed = 0;
    let cleared = 0;
    const { container, unmount } = render(
      createElement(SkinManager, {
        items: sampleItems,
        totalBytes: 24000,
        maxBytes: 512000,
        onInstall: () => installed++,
        onRefresh: () => refreshed++,
        onRemove: () => removed++,
        onClearAll: () => cleared++,
      }),
    );
    const buttons = Array.from(container.querySelectorAll('button'));
    // [Clear cache, Reinstall(system?), Delete(system?), Reinstall(glass), Delete(glass), Install(neobrutal)]
    // But system is active: Delete button for system is disabled; clicking it won't fire. Reinstall exists for active? yes we render Reinstall for all non-remote; Delete disabled if active.
    // So clicking the Delete for system does nothing (disabled). Better click the enabled Delete.
    const deleteGlass = buttons[4]; // Reinstall(glass) at index 3? buttons: 0 Clear,1 Reinstall(system),2 Delete(system, disabled),3 Reinstall(glass),4 Delete(glass),5 Install(neobrutal)
    const installNeo = buttons[5];
    const refreshSys = buttons[1];
    act(() => fire(installNeo!, 'click'));
    act(() => fire(refreshSys!, 'click'));
    act(() => fire(deleteGlass!, 'click'));
    expect(installed).toBe(1);
    expect(refreshed).toBe(1);
    expect(removed).toBe(1);
    const clear = buttons[0];
    act(() => fire(clear!, 'click'));
    expect(cleared).toBe(1);
    unmount();
  });

  test('busyId disables actions', () => {
    const { container, unmount } = render(
      createElement(SkinManager, {
        items: sampleItems,
        totalBytes: 24000,
        maxBytes: 512000,
        busyId: 'glass',
        onInstall: () => {},
        onRefresh: () => {},
        onRemove: () => {},
        onClearAll: () => {},
      }),
    );
    const buttons = Array.from(container.querySelectorAll('button'));
    const refreshGlass = buttons[3];
    const deleteGlass = buttons[4];
    expect(refreshGlass?.hasAttribute('disabled')).toBe(true);
    expect(deleteGlass?.hasAttribute('disabled')).toBe(true);
    unmount();
  });
});
