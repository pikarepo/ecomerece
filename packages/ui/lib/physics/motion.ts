/**
 * Motion laws — todo/12 (§46).
 *
 * Euler integration (`p += v·dt`) at a fixed timestep is exact enough for an
 * arcade dodger and trivially testable. Lane physics is the arcade contract:
 * lateral movement snaps to lane centres with an eased approach — there is
 * no friction/slip simulation, only a target and a rate.
 */

import type { Vec2 } from './types';

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** `p' = p + v·dt` — the only integration rule in the kernel. */
export function integrate(pos: Vec2, vel: Vec2, dt: number): Vec2 {
  return { x: pos.x + vel.x * dt, y: pos.y + vel.y * dt };
}

/**
 * Move `current` toward `target` by at most `maxDelta` (per tick). The lane
 * snap: `maxDelta = LANE_SNAP_SPEED · dt` gives a frame-rate-independent
 * glide that lands exactly on the lane centre.
 */
export function approach(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return target;
}

/**
 * Speed ramp over distance — the difficulty curve. `current` climbs linearly
 * from `start` toward `max` across the first `rampDistance` metres of the
 * odometer, then holds at `max`. Pure: same distance ⇒ same speed, so score
 * and traffic timing replay identically.
 */
export function rampSpeed(
  distance: number,
  start: number,
  max: number,
  rampDistance: number,
): number {
  if (rampDistance <= 0) return max;
  return start + ((max - start) * clamp(distance, 0, rampDistance)) / rampDistance;
}

/** Vector speed at distance travelled — convenience over `rampSpeed` for straight-line play. */
export function speedAt(distance: number, start: number, max: number, rampDistance: number): Vec2 {
  return { x: 0, y: -rampSpeed(distance, start, max, rampDistance) };
}

/* ── vehicle throttle, weight transfer & body roll motion laws ── */

export interface ThrottleConfig {
  minSpeed: number;
  startSpeed: number;
  maxCruiseSpeed: number;
  maxBoostSpeed: number;
  accelRate: number;
  brakeRate: number;
  dragRate: number;
  rampDistance: number;
}

export const DEFAULT_THROTTLE_CONFIG: ThrottleConfig = {
  minSpeed: 120,
  startSpeed: 180,
  maxCruiseSpeed: 330,
  maxBoostSpeed: 380,
  accelRate: 120,
  brakeRate: 160,
  dragRate: 60,
  rampDistance: 4500,
};

export interface VehicleMotion {
  speed: number;
  throttle: number;
  pitchOffset: number;
  leanAngle: number;
}

/**
 * Step vehicle motion laws forward by one fixed timestep dt.
 * Pure physical law: acceleration/brake response rates, pitch weight transfer,
 * and lateral roll lean.
 */
export function stepVehicleMotion(
  current: VehicleMotion,
  targetThrottle: number,
  lateralSpeed: number,
  distance: number,
  dt: number,
  cfg: ThrottleConfig = DEFAULT_THROTTLE_CONFIG,
): VehicleMotion {
  // Smooth throttle response
  const throttle = approach(current.throttle, targetThrottle, 5.0 * dt);

  // Cruise ramp from distance
  const baseSpeed = rampSpeed(distance, cfg.startSpeed, cfg.maxCruiseSpeed, cfg.rampDistance);

  // Target speed based on throttle input
  let targetSpeed = baseSpeed;
  if (throttle > 0) {
    targetSpeed = baseSpeed + (cfg.maxBoostSpeed - baseSpeed) * throttle;
  } else if (throttle < 0) {
    targetSpeed = Math.max(cfg.minSpeed, baseSpeed + (baseSpeed - cfg.minSpeed) * throttle);
  }

  // Acceleration / deceleration rate with inertia
  const rate = throttle < 0 ? cfg.brakeRate : throttle > 0 ? cfg.accelRate : cfg.dragRate;
  const speed = approach(current.speed, targetSpeed, rate * dt);

  // Pitch weight transfer: lunges forward on boost (-y), squats back on brake (+y)
  const targetPitch = -throttle * 18;
  const pitchOffset = approach(current.pitchOffset, targetPitch, 40 * dt);

  // Lateral roll lean proportional to lateral speed
  const targetLean = Math.max(-0.12, Math.min(0.12, lateralSpeed * 0.00035));
  const leanAngle = approach(current.leanAngle, targetLean, 14 * dt);

  return { speed, throttle, pitchOffset, leanAngle };
}
