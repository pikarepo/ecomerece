/**
 * Distance law — todo/12 (§47).
 *
 * The odometer is `Σ v·dt` over fixed steps — the single source of truth for
 * score, difficulty tier, the "km driven" HUD stat and the speed ramp input.
 * Because every step is `FIXED_DT`, the sum is identical across devices.
 */

export interface Odometer {
  /** Total metres travelled since reset. */
  readonly distance: number;
  /** Fold one simulation step in; returns the new total. */
  tick(speed: number, dt: number): number;
  reset(): void;
}

export function createOdometer(): Odometer {
  let distance = 0;
  return {
    get distance() {
      return distance;
    },
    tick(speed: number, dt: number) {
      distance += Math.abs(speed) * dt;
      return distance;
    },
    reset() {
      distance = 0;
    },
  };
}

/**
 * Difficulty tier from distance — pure mapping so HUD copy and spawn policy
 * agree without either importing the other's state.
 */
export function difficultyTier(distance: number, tierDistance = 500): number {
  return Math.floor(distance / Math.max(tierDistance, 1));
}
