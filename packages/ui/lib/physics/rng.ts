/**
 * Seeded RNG — todo/12 (§43.2, determinism contract).
 *
 * The kernel NEVER calls `Math.random`. Every random decision (spawn lanes,
 * jitter, pickups) draws from an injected `Rng`, so a seed replays the exact
 * same run — the same discipline as the hydration fixes (first paint and
 * replay must be deterministic functions of their inputs).
 */

/** A deterministic random source returning `[0, 1)`. Inject it; never hardwire. */
export type Rng = () => number;

/**
 * mulberry32 — 32-bit seed, ~2^32 period, passes gjrand; the standard tiny
 * game-RNG. Same seed ⇒ identical sequence on every engine and OS.
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Uniform float in `[min, max)`. */
export function randRange(rng: Rng, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Uniform integer in `[min, max)` — the lane/jitter workhorse. */
export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min));
}

/** Uniform element of a non-empty array. */
export function pickRandom<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new Error('pickRandom: empty array');
  return items[randInt(rng, 0, items.length)];
}
