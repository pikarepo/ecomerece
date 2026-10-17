/**
 * Engine performance layer — DESIGN.md §39 (todo/14).
 *
 * The kit is a design engine: it must ENFORCE a frame budget, not merely
 * document one. Two halves:
 *
 *   • `createFrameMonitor` — a pure rolling FPS monitor that escalates a
 *     fidelity level (high → medium → low) only after N consecutive bad
 *     windows, and recovers once the device is comfortable again. The engine
 *     (slabEngine, game loop, Stage3D) feeds it rAF deltas and reacts.
 *   • `perfBudgetFor` — the deterministic budget a level unlocks (particle
 *     count, shadow size, DPR cap, blur). Engine features read this instead
 *     of hardcoding magic numbers, so "best performance" is one table.
 *
 * Everything here is pure + SSR-safe so it can be unit-tested without a DOM.
 */

export type PerfLevel = 'high' | 'medium' | 'low';

export interface FrameMonitorOptions {
  /** Rolling window (ms) over which fps is averaged. Default 1000. */
  windowMs?: number;
  /** Average fps at/below this (inside the window) is a "bad" window. Default 45. */
  degradeBelowFps?: number;
  /** Average fps at/below this drops two levels at once. Default 28. */
  criticalBelowFps?: number;
  /** Consecutive bad windows before stepping down a level. Default 2. */
  strikes?: number;
  /** Consecutive good windows before stepping back up a level. Default 4. */
  recoverAfter?: number;
}

export interface FrameMonitor {
  /** Record one frame delta (ms). Returns the level after this frame. */
  tick(deltaMs: number): PerfLevel;
  /** Rolling fps of the window currently accumulating. */
  fps(): number;
  level(): PerfLevel;
  reset(): void;
}

const LEVELS: readonly PerfLevel[] = ['low', 'medium', 'high'];

/** Options resolved to concrete numbers (exported for tests/inspection). */
export interface ResolvedFrameMonitorOptions {
  windowMs: number;
  degradeBelowFps: number;
  criticalBelowFps: number;
  strikes: number;
  recoverAfter: number;
}

export function resolveFrameMonitorOptions(
  options: FrameMonitorOptions = {},
): ResolvedFrameMonitorOptions {
  return {
    windowMs: options.windowMs ?? 1000,
    degradeBelowFps: options.degradeBelowFps ?? 45,
    criticalBelowFps: options.criticalBelowFps ?? 28,
    strikes: Math.max(1, options.strikes ?? 2),
    recoverAfter: Math.max(1, options.recoverAfter ?? 4),
  };
}

/**
 * Step down one level (or two on a critical window), never below `low`.
 * `bad` counts consecutive bad windows; `good` resets it.
 */
export function nextLevel(
  level: PerfLevel,
  bad: number,
  good: number,
  opts: ResolvedFrameMonitorOptions,
): PerfLevel {
  const index = LEVELS.indexOf(level);
  let next = index;
  if (bad >= opts.strikes) next = Math.max(0, index - 1);
  if (good >= opts.recoverAfter) next = Math.min(LEVELS.length - 1, index + 1);
  return LEVELS[next] as PerfLevel;
}

export function createFrameMonitor(options: FrameMonitorOptions = {}): FrameMonitor {
  const opts = resolveFrameMonitorOptions(options);
  let level: PerfLevel = 'high';
  let frames = 0;
  let elapsed = 0;
  let badWindows = 0;
  let goodWindows = 0;
  let lastFps = 0;

  return {
    tick(deltaMs: number): PerfLevel {
      if (!Number.isFinite(deltaMs) || deltaMs <= 0) return level;
      frames += 1;
      elapsed += deltaMs;
      if (elapsed < opts.windowMs) return level;

      lastFps = (frames * 1000) / elapsed;
      frames = 0;
      elapsed = 0;

      if (lastFps <= opts.criticalBelowFps) {
        badWindows += 2; // a critical window is worth two strikes
        goodWindows = 0;
      } else if (lastFps <= opts.degradeBelowFps) {
        badWindows += 1;
        goodWindows = 0;
      } else {
        goodWindows += 1;
        badWindows = 0;
      }

      level = nextLevel(level, badWindows, goodWindows, opts);
      // Consume the window that drove a transition so the next step needs a
      // fresh run of consecutive bad (or good) windows.
      if (badWindows >= opts.strikes || goodWindows >= opts.recoverAfter) {
        badWindows = 0;
        goodWindows = 0;
      }
      return level;
    },
    fps: () => lastFps,
    level: () => level,
    reset: () => {
      level = 'high';
      frames = 0;
      elapsed = 0;
      badWindows = 0;
      goodWindows = 0;
      lastFps = 0;
    },
  };
}

export interface PerfBudget {
  /** Max concurrently animating particles/decorations. */
  maxParticles: number;
  /** Shadow-map edge length in px for WebGL slabs. */
  shadowMapSize: number;
  /** devicePixelRatio ceiling for canvases. */
  pixelRatioCap: number;
  /** Whether blur/backdrop-filter effects are allowed. */
  allowBlur: boolean;
}

/**
 * The single budget table. `low` is deliberately conservative (mobile / weak
 * devices); the slab engine, game loop and Stage3D read from this instead of
 * hardcoding values.
 */
export const PERF_BUDGETS: Record<PerfLevel, PerfBudget> = {
  high: { maxParticles: 160, shadowMapSize: 1024, pixelRatioCap: 1.5, allowBlur: true },
  medium: { maxParticles: 80, shadowMapSize: 512, pixelRatioCap: 1.25, allowBlur: true },
  low: { maxParticles: 24, shadowMapSize: 256, pixelRatioCap: 1, allowBlur: false },
};

export function perfBudgetFor(level: PerfLevel): PerfBudget {
  return PERF_BUDGETS[level];
}

/**
 * SSR-safe `prefers-reduced-motion` probe. Returns `true` when the user asks
 * for reduced motion OR the DOM is unavailable (SSR: assume the safe form).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return true;
  }
}
