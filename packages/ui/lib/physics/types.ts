/**
 * Physics kernel primitives — todo/12 (Part VIII, §43–§51).
 *
 * Dependency-free value types shared by every law in `lib/physics`. Nothing
 * here touches the DOM, `Math.random` or `Date.now` — the kernel is pure so a
 * whole game can be replayed and tested tick-for-tick from a seed.
 */

/** 2D vector. Readonly by convention; laws return new vectors, never mutate. */
export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

/**
 * Axis-aligned box: min corner `(x, y)` + size `(w, h)`. All collision laws
 * work in this shape — convert circles at the call site (see `circleOverlaps`).
 */
export interface Aabb {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** A moving box in the world. `tag` is game-owned (`'player' | 'traffic' | …`). */
export interface Body {
  readonly id: string;
  readonly box: Aabb;
  readonly vel: Vec2;
  readonly tag?: string;
}

/** Result of a sweep (continuous collision) test — see `sweep` in `aabb.ts`. */
export interface SweepHit {
  /** Impact time in `[0, 1]` — fraction of `dt` at first contact. `0` = already overlapping. */
  readonly t: number;
  /** Unit axis the impact came from (which side of the swept body got hit). */
  readonly nx: number;
  readonly ny: number;
}

export const vec = (x: number, y: number): Vec2 => ({ x, y });

export const VEC_ZERO: Vec2 = { x: 0, y: 0 };

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });

export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });

export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });

export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;

export const length = (a: Vec2): number => Math.hypot(a.x, a.y);

export const normalize = (a: Vec2): Vec2 => {
  const len = length(a);
  return len === 0 ? VEC_ZERO : { x: a.x / len, y: a.y / len };
};
