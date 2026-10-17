/**
 * Spawning law — todo/12 (§48).
 *
 * Timer-based traffic in random lanes. The timer counts down in sim-seconds
 * (fixed dt), the interval tightens with distance travelled (difficulty), and
 * every random choice draws from the injected `Rng` — never `Math.random`.
 * A lane is never chosen twice in a row, so a wall of identical traffic can
 * never form directly in front of the player.
 */

import { type Rng, randInt } from './rng';

export interface SpawnPolicy {
  /** Seconds between spawns at distance 0. */
  readonly baseInterval: number;
  /** Lower bound — traffic never becomes a solid stream. */
  readonly minInterval: number;
  /** Extra seconds shaved off per metre travelled (the ramp). */
  readonly shrinkPerMeter: number;
  /** ±fraction of jitter applied to each interval, drawn from the RNG. */
  readonly jitter: number;
}

export const DEFAULT_SPAWN_POLICY: SpawnPolicy = {
  baseInterval: 1.4,
  minInterval: 0.45,
  shrinkPerMeter: 0.0004,
  jitter: 0.25,
};

/** Interval at a given distance — tighter as the run goes on. */
export function spawnInterval(distance: number, policy: SpawnPolicy): number {
  const base = Math.max(policy.baseInterval - distance * policy.shrinkPerMeter, policy.minInterval);
  return base;
}

/**
 * Pick a lane in `[0, lanes)`, avoiding `previous`. With a single lane there
 * is nothing to avoid; with two or more the result always differs from the
 * last pick.
 */
export function pickLane(rng: Rng, lanes: number, previous: number | null): number {
  if (lanes <= 1) return 0;
  if (previous === null || previous < 0 || previous >= lanes) return randInt(rng, 0, lanes);
  let lane = randInt(rng, 0, lanes - 1);
  if (lane >= previous) lane += 1;
  return lane;
}

export interface ActiveTrafficCar {
  readonly lane: number;
  readonly y: number;
}

/**
 * Checks whether spawning a car in `candidateLane` at `candidateY` preserves
 * at least one guaranteed open escape corridor across all lanes within the
 * clearance window, and avoids tailgating cars in the same lane.
 */
export function isCorridorSolvable(
  candidateLane: number,
  activeCars: readonly ActiveTrafficCar[],
  totalLanes: number,
  candidateY = -76,
  clearanceWindow = 145,
  sameLaneHeadway = 220,
): boolean {
  if (totalLanes <= 0 || candidateLane < 0 || candidateLane >= totalLanes) {
    return false;
  }

  // 1. Same-lane headway check: do not spawn immediately behind/ahead of another car in this lane
  for (const car of activeCars) {
    if (car.lane === candidateLane && Math.abs(car.y - candidateY) < sameLaneHeadway) {
      return false;
    }
  }

  // 2. Open corridor check: within the critical longitudinal clearance window,
  // at least ONE lane must remain completely unblocked across active traffic.
  const blockedLanes = new Set<number>();
  blockedLanes.add(candidateLane);

  for (const car of activeCars) {
    if (Math.abs(car.y - candidateY) < clearanceWindow) {
      blockedLanes.add(car.lane);
    }
  }

  // If every lane would have a car within this clearance window, the road is impassable (a wall)
  if (blockedLanes.size >= totalLanes) {
    return false;
  }

  return true;
}

/**
 * Picks a lane among all available lanes [0, totalLanes) that satisfies the
 * corridor solvability law. If multiple lanes are solvable, randomly picks
 * one (preferring not to repeat previous if possible). If none are solvable, returns null.
 */
export function pickSolvableLane(
  rng: Rng,
  totalLanes: number,
  activeCars: readonly ActiveTrafficCar[],
  previousLane: number | null = null,
  candidateY = -76,
  clearanceWindow = 145,
  sameLaneHeadway = 220,
): number | null {
  if (totalLanes <= 0) return null;

  const validLanes: number[] = [];
  for (let l = 0; l < totalLanes; l++) {
    if (
      isCorridorSolvable(l, activeCars, totalLanes, candidateY, clearanceWindow, sameLaneHeadway)
    ) {
      validLanes.push(l);
    }
  }

  if (validLanes.length === 0) return null;

  // Filter out previous lane if more than one lane is solvable
  if (previousLane !== null && validLanes.length > 1 && validLanes.includes(previousLane)) {
    const withoutPrev = validLanes.filter((l) => l !== previousLane);
    const idx = randInt(rng, 0, withoutPrev.length);
    return withoutPrev[idx];
  }

  const idx = randInt(rng, 0, validLanes.length);
  return validLanes[idx];
}

/** Scale spawn policy for different lane counts (e.g. 3 to 8 lanes). */
export function scaledSpawnPolicy(
  lanes: number,
  basePolicy: SpawnPolicy = DEFAULT_SPAWN_POLICY,
): SpawnPolicy {
  const scaleFactor = Math.sqrt(3 / Math.max(1, lanes));
  return {
    ...basePolicy,
    baseInterval: Math.max(0.65, basePolicy.baseInterval * scaleFactor),
    minInterval: Math.max(0.35, basePolicy.minInterval * scaleFactor),
  };
}

export interface Spawner {
  /** Seconds until the next spawn; drive it with `tick`. */
  readonly dueIn: number;
  /** Advance the timer; returns the lane to spawn into, or `null`. */
  tick(
    dt: number,
    distance: number,
    rng: Rng,
    activeCars?: readonly ActiveTrafficCar[],
  ): number | null;
  reset(): void;
}

export function createSpawner(lanes = 4, policy: SpawnPolicy = DEFAULT_SPAWN_POLICY): Spawner {
  let dueIn = policy.baseInterval;
  let lastLane: number | null = null;
  return {
    get dueIn() {
      return dueIn;
    },
    tick(
      dt: number,
      distance: number,
      rng: Rng,
      activeCars?: readonly ActiveTrafficCar[],
    ): number | null {
      dueIn -= dt;
      if (dueIn > 0) return null;
      const interval = spawnInterval(distance, policy);
      dueIn = interval * (1 - policy.jitter + rng() * policy.jitter * 2);

      let lane: number | null;
      if (activeCars) {
        lane = pickSolvableLane(rng, lanes, activeCars, lastLane);
      } else {
        lane = pickLane(rng, lanes, lastLane);
      }

      if (lane !== null) {
        lastLane = lane;
      }
      return lane;
    },
    reset() {
      dueIn = policy.baseInterval;
      lastLane = null;
    },
  };
}
