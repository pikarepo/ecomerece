import { describe, expect, test } from 'bun:test';
import {
  createFrameMonitor,
  nextLevel,
  perfBudgetFor,
  prefersReducedMotion,
  resolveFrameMonitorOptions,
} from '../lib/perf/frameMonitor';

function feedFrames(
  m: ReturnType<typeof createFrameMonitor>,
  fps: number,
  frames: number,
  dtFactor = 1,
) {
  const dt = (1000 / fps) * dtFactor;
  for (let i = 0; i < frames; i++) m.tick(dt);
}

describe('frameMonitor', () => {
  test('defaults resolved', () => {
    const o = resolveFrameMonitorOptions();
    expect(o.windowMs).toBe(1000);
    expect(o.degradeBelowFps).toBe(45);
    expect(o.criticalBelowFps).toBe(28);
    expect(o.strikes).toBe(2);
    expect(o.recoverAfter).toBe(4);
  });

  test('good windows keep high', () => {
    const m = createFrameMonitor();
    feedFrames(m, 60, 6); // ~6 frames/second? 6 frames * (16.67ms) = 100ms, call 6 times? easier: call tick repeatedly with 60fps dt
    // 60fps = 16.666...ms
    for (let i = 0; i < 12; i++) m.tick(1000 / 60);
    expect(m.level()).toBe('high');
  });

  test('degrades after consecutive bad windows', () => {
    const m = createFrameMonitor({ windowMs: 100, degradeBelowFps: 45, strikes: 2 });
    // 20fps = 50ms; 2 frames fill 100ms → bad window (fps 20 <=28 critical) each time
    for (let i = 0; i < 2; i++) m.tick(50); // 2 bad windows
    expect(m.level()).toBe('medium');
  });

  test('drops to low after more bad windows', () => {
    const m = createFrameMonitor({
      windowMs: 100,
      degradeBelowFps: 45,
      criticalBelowFps: 28,
      strikes: 2,
    });
    for (let i = 0; i < 2; i++) m.tick(50); // → medium
    for (let i = 0; i < 2; i++) m.tick(50); // → low
    expect(m.level()).toBe('low');
  });

  test('recovers after good windows', () => {
    const m = createFrameMonitor({
      windowMs: 100,
      degradeBelowFps: 45,
      criticalBelowFps: 28,
      strikes: 2,
      recoverAfter: 2,
    });
    // go low
    for (let i = 0; i < 2; i++) {
      m.tick(50);
      m.tick(50);
    } // → medium (2 bad windows)
    for (let i = 0; i < 2; i++) {
      m.tick(50);
      m.tick(50);
    } // → low (2 more bad windows)
    // recover: 2 good windows at 60fps
    for (let w = 0; w < 2; w++) {
      for (let i = 0; i < 6; i++) m.tick(1000 / 60);
    }
    expect(m.level()).toBe('medium');
  });

  test('nextLevel clamps', () => {
    const o = resolveFrameMonitorOptions({ strikes: 2, recoverAfter: 2 });
    expect(nextLevel('low', 2, 0, o)).toBe('low');
    expect(nextLevel('high', 2, 0, o)).toBe('medium');
    expect(nextLevel('high', 0, 2, o)).toBe('high');
    expect(nextLevel('medium', 0, 2, o)).toBe('high');
  });

  test('perfBudgetFor returns expected caps', () => {
    expect(perfBudgetFor('low').maxParticles).toBe(24);
    expect(perfBudgetFor('medium').maxParticles).toBe(80);
    expect(perfBudgetFor('high').maxParticles).toBe(160);
    expect(perfBudgetFor('low').allowBlur).toBe(false);
    expect(perfBudgetFor('high').allowBlur).toBe(true);
    expect(perfBudgetFor('high').shadowMapSize).toBe(1024);
  });

  test('prefersReducedMotion is safe SSR', () => {
    expect(typeof prefersReducedMotion()).toBe('boolean');
  });
});
