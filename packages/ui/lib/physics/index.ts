/**
 * Physics kernel — todo/12 (DESIGN.md Part VIII, §43–§51).
 *
 * Pure-TS physical laws for building 2D games on the engine: fixed-timestep
 * clock, AABB + swept collision, arcade lane motion, distance odometer,
 * seeded spawner and a game state machine. Zero dependencies, zero DOM, no
 * `Math.random` / `Date.now` — everything is injected, so a seed replays a
 * whole run tick-for-tick.
 *
 * Import via the subpath (kept out of the client barrel on purpose):
 * `import { createGameFsm, mulberry32 } from '@ecomerece/ui/physics'`
 */

export { circleOverlaps, expand, findOverlaps, overlaps, sweep } from './aabb';
export { createOdometer, difficultyTier, type Odometer } from './distance';
export {
  approach,
  clamp,
  DEFAULT_THROTTLE_CONFIG,
  integrate,
  rampSpeed,
  speedAt,
  stepVehicleMotion,
  type ThrottleConfig,
  type VehicleMotion,
} from './motion';
export { mulberry32, pickRandom, type Rng, randInt, randRange } from './rng';
export {
  type ActiveTrafficCar,
  createSpawner,
  DEFAULT_SPAWN_POLICY,
  isCorridorSolvable,
  pickLane,
  pickSolvableLane,
  type Spawner,
  type SpawnPolicy,
  scaledSpawnPolicy,
  spawnInterval,
} from './spawn';
export {
  createFsm,
  createGameFsm,
  type Fsm,
  type GameEvent,
  type GameState,
  type TransitionMap,
} from './stateMachine';
export {
  accumulate,
  FIXED_DT,
  interpolationAlpha,
  MAX_FRAME_DT,
  MAX_STEPS_PER_FRAME,
  type StepResult,
} from './timestep';
export type { Aabb, Body, SweepHit, Vec2 } from './types';
export { add, dot, length, normalize, scale, sub, VEC_ZERO, vec } from './types';
