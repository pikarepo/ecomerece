/**
 * Hit detection laws — todo/12 (§45).
 *
 * Discrete AABB for same-tick overlap (car-vs-car at ~10–20 entities the
 * O(n²)/2 scan is cheaper than any spatial index), circle tests for pickups,
 * and a swept (continuous) test so a fast body cannot tunnel through another
 * between two fixed steps.
 */

import type { Aabb, SweepHit, Vec2 } from './types';

/** Edge-touching boxes do NOT collide — a car may graze the lane line. */
export function overlaps(a: Aabb, b: Aabb): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Circle (pickup) vs box (car): closest-point-on-box distance ≤ radius². */
export function circleOverlaps(box: Aabb, cx: number, cy: number, radius: number): boolean {
  const closestX = Math.min(Math.max(cx, box.x), box.x + box.w);
  const closestY = Math.min(Math.max(cy, box.y), box.y + box.h);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= radius * radius;
}

/** Inclusive overlap used by broad-phase shortlists (cheap reject). */
export function expand(a: Aabb, margin: number): Aabb {
  return { x: a.x - margin, y: a.y - margin, w: a.w + margin * 2, h: a.h + margin * 2 };
}

/**
 * Swept AABB (CCD) over one fixed step.
 *
 * Relative-motion slab test: `a` moves at `aVel`, `b` at `bVel`; `b` is
 * grown by `a`'s half-extents (Minkowski sum) and `a` becomes a point, so a
 * single slab crossing gives the exact first-contact time. Returns `null`
 * when the bodies never touch during `(0, dt]`.
 *
 * A body that is ALREADY overlapping returns `{ t: 0 }` — the discrete pass
 * owns resolving those; this exists to catch the tunneling case.
 */
export function sweep(a: Aabb, aVel: Vec2, b: Aabb, bVel: Vec2, dt: number): SweepHit | null {
  if (dt <= 0) return null;
  if (overlaps(a, b)) return { t: 0, nx: 0, ny: 0 };

  const relX = (aVel.x - bVel.x) * dt;
  const relY = (aVel.y - bVel.y) * dt;

  // Expanded (Minkowski) box: b grown by a's size.
  const minX = b.x - a.w;
  const maxX = b.x + b.w;
  const minY = b.y - a.h;
  const maxY = b.y + b.h;

  let tEnterX: number;
  let tExitX: number;
  if (relX === 0) {
    if (a.x <= minX || a.x >= maxX) return null;
    tEnterX = Number.NEGATIVE_INFINITY;
    tExitX = Number.POSITIVE_INFINITY;
  } else {
    const tx1 = (minX - a.x) / relX;
    const tx2 = (maxX - a.x) / relX;
    tEnterX = Math.min(tx1, tx2);
    tExitX = Math.max(tx1, tx2);
  }

  let tEnterY: number;
  let tExitY: number;
  if (relY === 0) {
    if (a.y <= minY || a.y >= maxY) return null;
    tEnterY = Number.NEGATIVE_INFINITY;
    tExitY = Number.POSITIVE_INFINITY;
  } else {
    const ty1 = (minY - a.y) / relY;
    const ty2 = (maxY - a.y) / relY;
    tEnterY = Math.min(ty1, ty2);
    tExitY = Math.max(ty1, ty2);
  }

  const tEnter = Math.max(tEnterX, tEnterY);
  const tExit = Math.min(tExitX, tExitY);
  if (tEnter > tExit || tExit < 0 || tEnter > 1) return null;

  const t = Math.max(tEnter, 0);
  if (tEnterX > tEnterY) {
    return { t, nx: relX > 0 ? -1 : 1, ny: 0 };
  }
  if (tEnterY > tEnterX) {
    return { t, nx: 0, ny: relY > 0 ? -1 : 1 };
  }
  return { t, nx: 0, ny: 0 };
}

/**
 * All pairs of bodies that overlap this tick — the arcade broad phase. With
 * a 10–20 entity dodger this is a handful of comparisons; do not optimise
 * until a profile says so (§28.5 — measure, don't preempt).
 */
export function findOverlaps<T extends { box: Aabb }>(items: readonly T[]): Array<[T, T]> {
  const hits: Array<[T, T]> = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (overlaps(items[i].box, items[j].box)) hits.push([items[i], items[j]]);
    }
  }
  return hits;
}
