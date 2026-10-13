import { afterAll, describe, expect, test } from 'bun:test';
import { startBlurGovernor } from '../lib/depth/blurGovernor';
import { flushFrames, installDom, inViewRect, outOfViewRect, restoreDom } from './_dom';

installDom();
afterAll(() => restoreDom());

type CssVars = Record<string, string>;

function stubComputedStyle(vars: CssVars): void {
  globalThis.getComputedStyle = (() => {
    const style = {
      getPropertyValue: (prop: string) => vars[prop] ?? '',
      getPropertyPriority: () => '',
      item: () => '',
      length: 0,
      cssText: '',
    } as unknown as CSSStyleDeclaration;
    return style;
  }) as typeof getComputedStyle;
}

function element(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  return el;
}

function place(id: string, rect: DOMRect): void {
  element(id).getBoundingClientRect = () => rect;
}

/** card + overlay blur; control does not blur (V12-valid skin state). */
const BLURRED = {
  '--m-card-backdrop': 'blur(14px)',
  '--m-overlay-backdrop': 'blur(18px)',
  '--m-control-backdrop': 'none',
};

describe('startBlurGovernor', () => {
  test('keeps in-view blur, flags off-screen surfaces, skips data-slab + non-blurring roles', async () => {
    document.body.innerHTML = `
      <div id="card" class="mat-card"></div>
      <div id="ovl" class="mat-overlay"></div>
      <div id="slab" class="mat-card" data-slab></div>
      <div id="ctrl" class="mat-control"></div>
    `;
    stubComputedStyle(BLURRED);
    place('card', inViewRect());
    place('ovl', outOfViewRect());
    place('slab', inViewRect());
    place('ctrl', inViewRect());

    const stop = startBlurGovernor();
    await flushFrames(2);

    expect(element('card').getAttribute('data-blur')).toBeNull();
    expect(element('ovl').getAttribute('data-blur')).toBe('off');
    expect(element('slab').getAttribute('data-blur')).toBeNull();
    expect(element('ctrl').getAttribute('data-blur')).toBeNull();

    stop();
  });

  test('caps the number of blurred surfaces (3 on a ≥430px viewport)', async () => {
    document.body.innerHTML = [
      '<div id="c0" class="mat-card"></div>',
      '<div id="c1" class="mat-card"></div>',
      '<div id="c2" class="mat-card"></div>',
      '<div id="c3" class="mat-card"></div>',
      '<div id="c4" class="mat-card"></div>',
    ].join('');
    stubComputedStyle(BLURRED);
    for (let i = 0; i < 5; i++) place(`c${i}`, inViewRect());

    const stop = startBlurGovernor();
    await flushFrames(2);

    for (const id of ['c0', 'c1', 'c2']) {
      expect(element(id).getAttribute('data-blur'), id).toBeNull();
    }
    for (const id of ['c3', 'c4']) {
      expect(element(id).getAttribute('data-blur'), id).toBe('off');
    }

    stop();
  });

  test('invalidates the role-blur cache on skin change and clears stale flags', async () => {
    document.body.innerHTML = `
      <div id="card" class="mat-card"></div>
      <div id="ovl" class="mat-overlay"></div>
    `;
    stubComputedStyle(BLURRED);
    place('card', inViewRect());
    place('ovl', outOfViewRect());

    const stop = startBlurGovernor();
    await flushFrames(2);
    expect(element('ovl').getAttribute('data-blur')).toBe('off');

    // The new skin stops blurring overlays entirely.
    stubComputedStyle({ ...BLURRED, '--m-overlay-backdrop': 'none' });
    document.documentElement.setAttribute('data-skin', 'glass');
    await Promise.resolve();
    await flushFrames(2);

    expect(element('ovl').getAttribute('data-blur')).toBeNull();

    stop();
  });

  test('dispose stops work and strips every data-blur flag', async () => {
    document.body.innerHTML = `
      <div id="card" class="mat-card"></div>
      <div id="ovl" class="mat-overlay"></div>
    `;
    stubComputedStyle(BLURRED);
    place('card', inViewRect());
    place('ovl', outOfViewRect());

    const stop = startBlurGovernor();
    await flushFrames(2);
    expect(element('ovl').getAttribute('data-blur')).toBe('off');

    stop();
    await flushFrames(3);

    expect(document.querySelectorAll('[data-blur]').length).toBe(0);
    expect(element('card').getAttribute('data-blur')).toBeNull();
  });
});
