import { afterAll, describe, expect, test } from 'bun:test';
import type { RegistryEntry } from '../lib/skin/useSkin';
import { useSkin } from '../lib/skin/useSkin';
import { act, dispatchDomEvent, registerDom, renderHook, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const REG: RegistryEntry[] = [
  {
    id: 'system',
    label: 'System',
    cost: 'low',
    a11yTier: 'AA',
    dimension: 'layered',
    swatch: ['#E9EAEE', '#0A0B0D'],
  },
  {
    id: 'clay',
    label: 'Clay',
    cost: 'medium',
    a11yTier: 'AA',
    dimension: 'layered',
    swatch: ['#FFFBF2', '#17120B'],
    needs: [],
  },
  {
    id: 'glass',
    label: 'Glass',
    cost: 'high',
    a11yTier: 'AA',
    dimension: 'layered',
    swatch: ['#FFFFFF', '#0A0B0D'],
    needs: ['backdrop-filter'],
  },
  {
    id: 'neo',
    label: 'Neo',
    cost: 'low',
    a11yTier: 'AA',
    dimension: 'layered',
    swatch: ['#FFFFFF', '#0A0B0D'],
    needs: [],
  },
];

function pendingLink(): HTMLLinkElement {
  const link = document.getElementById('skin-css-next');
  if (!link) throw new Error('expected a pending #skin-css-next link');
  return link as HTMLLinkElement;
}

function currentLink(): HTMLLinkElement {
  const link = document.getElementById('skin-css');
  if (!link) throw new Error('expected a committed #skin-css link');
  return link as HTMLLinkElement;
}

function commitSkin(id: string): HTMLLinkElement {
  const link = pendingLink();
  act(() => dispatchDomEvent(link, 'load'));
  expect(document.documentElement.getAttribute('data-skin')).toBe(id);
  return currentLink();
}

describe('useSkin', () => {
  test('bootstraps from the document the bootstrap script already prepared', () => {
    document.documentElement.setAttribute('data-skin', 'clay');
    document.documentElement.setAttribute('data-fidelity', 'low');

    const h = renderHook(() => useSkin(REG));

    expect(h.latest().ready).toBe(true);
    expect(h.latest().skin).toBe('clay');
    expect(h.latest().fidelity).toBe('low');
    expect(document.documentElement.getAttribute('data-fidelity')).toBe('low');
    h.unmount();
  });

  test('setSkin appends a stylesheet link and only commits after onload', () => {
    const h = renderHook(() => useSkin(REG));

    h.latest().setSkin('clay');
    const link = pendingLink();
    expect(link.rel).toBe('stylesheet');
    expect(link.href).toContain('/skins/clay.css');
    // not committed until the sheet loads
    expect(document.documentElement.getAttribute('data-skin')).toBeNull();

    act(() => dispatchDomEvent(link, 'load'));

    expect(document.documentElement.getAttribute('data-skin')).toBe('clay');
    expect(document.documentElement.getAttribute('data-dimension')).toBe('layered');
    expect(document.getElementById('skin-css')).not.toBeNull();
    expect(document.getElementById('skin-css-next')).toBeNull();
    expect(h.latest().skin).toBe('clay');
    expect(localStorage.getItem('skin')).toBe('clay');
    h.unmount();
  });

  test('setSkin activates data-accent="skin" (A2) and drops it with system', () => {
    const h = renderHook(() => useSkin(REG));

    h.latest().setSkin('clay');
    expect(document.documentElement.getAttribute('data-accent')).toBeNull(); // not yet
    commitSkin('clay');
    expect(document.documentElement.getAttribute('data-accent')).toBe('skin');

    act(() => h.latest().setSkin('system'));
    expect(document.documentElement.getAttribute('data-accent')).toBeNull();
    h.unmount();
  });

  test('re-selecting the active skin is a no-op (no re-fetch, no new link)', () => {
    const h = renderHook(() => useSkin(REG));

    h.latest().setSkin('clay');
    commitSkin('clay');
    const linksBefore = document.head.querySelectorAll('link').length;

    h.latest().setSkin('clay');

    expect(document.head.querySelectorAll('link').length).toBe(linksBefore);
    expect(document.getElementById('skin-css-next')).toBeNull();
    expect(document.documentElement.getAttribute('data-skin')).toBe('clay');
    h.unmount();
  });

  test('a superseded pending swap cannot commit (stale-link token guard)', () => {
    const h = renderHook(() => useSkin(REG));

    h.latest().setSkin('clay');
    commitSkin('clay');

    h.latest().setSkin('glass');
    const stale = pendingLink();
    h.latest().setSkin('neo');
    const current = pendingLink();
    expect(stale.isConnected).toBe(false);

    // Old link finished loading AFTER the newer swap started → discarded.
    act(() => dispatchDomEvent(stale, 'load'));
    expect(document.documentElement.getAttribute('data-skin')).toBe('clay');
    expect(h.latest().skin).toBe('clay');

    act(() => dispatchDomEvent(current, 'load'));
    expect(document.documentElement.getAttribute('data-skin')).toBe('neo');
    expect(h.latest().skin).toBe('neo');
    h.unmount();
  });

  test('a failed skin load aborts cleanly (onerror → token bump, link removed)', () => {
    const h = renderHook(() => useSkin(REG));

    h.latest().setSkin('clay');
    commitSkin('clay');

    h.latest().setSkin('glass');
    const link = pendingLink();
    act(() => dispatchDomEvent(link, 'error'));

    expect(document.getElementById('skin-css-next')).toBeNull();
    expect(document.documentElement.getAttribute('data-skin')).toBe('clay');
    expect(h.latest().skin).toBe('clay');

    // A later attempt still works.
    h.latest().setSkin('glass');
    expect(document.getElementById('skin-css-next')).not.toBeNull();
    h.unmount();
  });

  test('setSkin("system") resets the root and drops the active sheet', () => {
    const h = renderHook(() => useSkin(REG));

    h.latest().setSkin('clay');
    commitSkin('clay');

    act(() => h.latest().setSkin('system'));

    expect(document.documentElement.getAttribute('data-skin')).toBeNull();
    expect(document.documentElement.getAttribute('data-dimension')).toBeNull();
    expect(document.getElementById('skin-css')).toBeNull();
    expect(h.latest().skin).toBe('system');
    expect(localStorage.getItem('skin')).toBe('system');
    h.unmount();
  });

  test('invalid skin ids are sanitized to system (§38 id pattern)', () => {
    const h = renderHook(() => useSkin(REG));

    act(() => h.latest().setSkin('Bad ID!'));

    expect(document.documentElement.getAttribute('data-skin')).toBeNull();
    expect(h.latest().skin).toBe('system');

    h.latest().setSkin('clay');
    commitSkin('clay');
    act(() => h.latest().setSkin('../../etc/passwd'));
    expect(document.documentElement.getAttribute('data-skin')).toBeNull();
    expect(h.latest().skin).toBe('system');
    h.unmount();
  });

  test('setFidelity maps to the data-fidelity attribute (auto → remove)', () => {
    const h = renderHook(() => useSkin(REG));

    act(() => h.latest().setFidelity('low'));
    expect(document.documentElement.getAttribute('data-fidelity')).toBe('low');

    act(() => h.latest().setFidelity('auto'));
    expect(document.documentElement.getAttribute('data-fidelity')).toBeNull();
    h.unmount();
  });

  test('a stored skin that is not in the registry self-heals to system', () => {
    document.documentElement.setAttribute('data-skin', 'nope');

    const h = renderHook(() => useSkin(REG));

    expect(h.latest().ready).toBe(true);
    expect(h.latest().skin).toBe('system');
    expect(document.documentElement.getAttribute('data-skin')).toBeNull();
    h.unmount();
  });
});
