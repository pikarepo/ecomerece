import { describe, expect, test } from 'bun:test';
import { supportsBackdropFilter, supportsWebgl2 } from '../lib/skin/capabilities';

describe('shared capability probes', () => {
  test('are server-safe (window undefined → false, never throws)', () => {
    // Bun reuses workers across files, so another file's happy-dom install
    // may have leaked `window`/`CSS` into this one. Force the server branch.
    const g = globalThis as Record<string, unknown>;
    const win = g.window;
    const css = g.CSS;
    try {
      delete g.window;
      delete g.CSS;
      expect(supportsWebgl2()).toBe(false);
      expect(supportsBackdropFilter()).toBe(false);
    } finally {
      if (win !== undefined) g.window = win;
      if (css !== undefined) g.CSS = css;
    }
  });

  test('return booleans', () => {
    expect(typeof supportsWebgl2()).toBe('boolean');
    expect(typeof supportsBackdropFilter()).toBe('boolean');
  });
});
