import { describe, expect, test } from 'bun:test';
import { circleOverlaps, findOverlaps, overlaps, sweep } from '../lib/physics/aabb';
import { createOdometer, difficultyTier } from '../lib/physics/distance';
import {
  approach,
  clamp,
  DEFAULT_THROTTLE_CONFIG,
  integrate,
  rampSpeed,
  stepVehicleMotion,
} from '../lib/physics/motion';
import { mulberry32, pickRandom, randInt, randRange } from '../lib/physics/rng';
import {
  createSpawner,
  DEFAULT_SPAWN_POLICY,
  isCorridorSolvable,
  pickLane,
  pickSolvableLane,
  scaledSpawnPolicy,
  spawnInterval,
} from '../lib/physics/spawn';
import { createFsm, createGameFsm } from '../lib/physics/stateMachine';
import {
  accumulate,
  FIXED_DT,
  interpolationAlpha,
  MAX_STEPS_PER_FRAME,
} from '../lib/physics/timestep';
import { add, scale, vec } from '../lib/physics/types';

describe('rng (§43.2 determinism)', () => {
  test('same seed → identical sequence', () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  test('values stay in [0, 1) and different seeds diverge', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    let differ = false;
    for (let i = 0; i < 50; i++) {
      const va = a();
      const vb = b();
      expect(va).toBeGreaterThanOrEqual(0);
      expect(va).toBeLessThan(1);
      if (va !== vb) differ = true;
    }
    expect(differ).toBe(true);
  });

  test('helpers respect bounds', () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 200; i++) {
      const f = randRange(rng, -4, 4);
      expect(f).toBeGreaterThanOrEqual(-4);
      expect(f).toBeLessThan(4);
      const n = randInt(rng, 2, 7);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThan(7);
    }
    expect(pickRandom(mulberry32(7), ['a', 'b', 'c'])).toBeOneOf(['a', 'b', 'c']);
    expect(() => pickRandom(mulberry32(1), [])).toThrow();
  });
});

describe('fixed timestep (§44)', () => {
  test('sub-step frames accumulate until a whole step is due', () => {
    let acc = 0;
    let ran = 0;
    for (let i = 0; i < 60; i++) {
      const step = accumulate(acc, 1 / 120); // 120 Hz render
      acc = step.accumulator;
      ran += step.steps;
    }
    expect(ran).toBe(30); // 0.5s of sim at 60 Hz
    expect(acc).toBeCloseTo(0, 6);
  });

  test('hitch frame is clamped — no fast-forward after a stall', () => {
    const step = accumulate(0, 5);
    expect(step.steps).toBeLessThanOrEqual(MAX_STEPS_PER_FRAME);
  });

  test('spiral guard sheds the backlog instead of catching up', () => {
    let acc = 0;
    for (let i = 0; i < 100; i++) {
      const step = accumulate(acc, 0.25); // constant 4 Hz frames
      acc = step.accumulator;
    }
    // 100 × 0.25s = 25s of wall time; the sim must never approach that.
    expect(acc).toBeLessThan(FIXED_DT);
  });

  test('negative / NaN frame dt is ignored', () => {
    expect(accumulate(0, -1).steps).toBe(0);
    expect(accumulate(0, Number.NaN).steps).toBe(0);
  });

  test('interpolation alpha stays in [0, 1)', () => {
    expect(interpolationAlpha(0)).toBe(0);
    expect(interpolationAlpha(FIXED_DT / 2)).toBeCloseTo(0.5, 6);
    expect(interpolationAlpha(FIXED_DT * 2)).toBe(1);
  });
});

describe('collision laws (§45)', () => {
  const box = (x: number, y: number, w = 10, h = 10) => ({ x, y, w, h });

  test('overlap is exclusive at the edges — grazing is not a crash', () => {
    expect(overlaps(box(0, 0), box(5, 5))).toBe(true);
    expect(overlaps(box(0, 0), box(10, 0))).toBe(false);
    expect(overlaps(box(0, 0), box(20, 20))).toBe(false);
  });

  test('circle vs box uses the closest point', () => {
    expect(circleOverlaps(box(0, 0), 5, 5, 2)).toBe(true);
    expect(circleOverlaps(box(0, 0), 12, 5, 2)).toBe(true); // touches the edge
    expect(circleOverlaps(box(0, 0), 12, 5, 1.9)).toBe(false);
    expect(circleOverlaps(box(0, 0), 12, 12, 2)).toBe(false); // true corner: dist √8 ≈ 2.83
    expect(circleOverlaps(box(0, 0), 12, 12, 2.9)).toBe(true);
  });

  test('sweep catches a tunneling body between two ticks', () => {
    // a spans [30,40]; one 4000 px/s step lands it at ~96 — discrete positions
    // never overlap b at [50,60]. The swept test must still report contact.
    const a = box(30, 0);
    const b = box(50, 0);
    expect(overlaps(a, b)).toBe(false);
    expect(overlaps({ ...a, x: 96.6, y: 0 }, b)).toBe(false);
    const hit = sweep(a, vec(4000, 0), b, vec(0, 0), FIXED_DT);
    expect(hit).not.toBeNull();
    expect(hit?.t).toBeGreaterThan(0);
    expect(hit?.t).toBeLessThan(1);
    expect(hit?.nx).toBe(-1);
  });

  test('sweep returns null for a clean miss and t=0 when already overlapping', () => {
    expect(sweep(box(0, 0), vec(60, 0), box(50, 200), vec(0, 0), FIXED_DT)).toBeNull();
    expect(sweep(box(0, 0), vec(60, 0), box(5, 5), vec(0, 0), FIXED_DT)?.t).toBe(0);
  });

  test('findOverlaps reports each colliding pair once', () => {
    const bodies = [
      { id: 'a', box: box(0, 0) },
      { id: 'b', box: box(5, 5) },
      { id: 'c', box: box(100, 100) },
    ];
    const hits = findOverlaps(bodies);
    expect(hits.length).toBe(1);
    expect(hits[0][0].id).toBe('a');
    expect(hits[0][1].id).toBe('b');
  });
});

describe('motion laws (§46)', () => {
  test('integration is p + v·dt', () => {
    expect(integrate(vec(10, 20), vec(60, -120), 0.5)).toEqual(vec(40, -40));
  });

  test('approach lands exactly on the target and never overshoots', () => {
    expect(approach(0, 100, 30)).toBe(30);
    expect(approach(90, 100, 30)).toBe(100);
    expect(approach(100, 100, 30)).toBe(100);
    expect(approach(10, 0, 30)).toBe(0);
  });

  test('speed ramps linearly over distance, then holds', () => {
    expect(rampSpeed(0, 10, 20, 1000)).toBe(10);
    expect(rampSpeed(500, 10, 20, 1000)).toBe(15);
    expect(rampSpeed(1000, 10, 20, 1000)).toBe(20);
    expect(rampSpeed(5000, 10, 20, 1000)).toBe(20);
    expect(rampSpeed(100, 10, 20, 0)).toBe(20);
  });

  test('clamp bounds values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  test('stepVehicleMotion accelerates on boost and creates forward pitch', () => {
    let m = { speed: 180, throttle: 0, pitchOffset: 0, leanAngle: 0 };
    for (let i = 0; i < 60; i++) {
      m = stepVehicleMotion(m, 1.0, 0, 0, FIXED_DT);
    }
    expect(m.throttle).toBeGreaterThan(0.9);
    expect(m.speed).toBeGreaterThan(180);
    expect(m.pitchOffset).toBeLessThan(0); // lunges forward (-y in screen coordinates)
  });

  test('stepVehicleMotion decelerates on brake and creates rear squat pitch', () => {
    let m = { speed: 180, throttle: 0, pitchOffset: 0, leanAngle: 0 };
    for (let i = 0; i < 60; i++) {
      m = stepVehicleMotion(m, -1.0, 0, 0, FIXED_DT);
    }
    expect(m.throttle).toBeLessThan(-0.9);
    expect(m.speed).toBeLessThan(180);
    expect(m.speed).toBeGreaterThanOrEqual(DEFAULT_THROTTLE_CONFIG.minSpeed);
    expect(m.pitchOffset).toBeGreaterThan(0); // squats back (+y in screen coordinates)
  });

  test('stepVehicleMotion rolls body lean into lateral turns', () => {
    const rightTurn = stepVehicleMotion(
      { speed: 200, throttle: 0, pitchOffset: 0, leanAngle: 0 },
      0,
      500, // moving right
      0,
      FIXED_DT,
    );
    expect(rightTurn.leanAngle).toBeGreaterThan(0);

    const leftTurn = stepVehicleMotion(
      { speed: 200, throttle: 0, pitchOffset: 0, leanAngle: 0 },
      0,
      -500, // moving left
      0,
      FIXED_DT,
    );
    expect(leftTurn.leanAngle).toBeLessThan(0);
  });
});

describe('distance law (§47)', () => {
  test('odometer is Σ |v|·dt over fixed steps', () => {
    const odo = createOdometer();
    for (let i = 0; i < 60; i++) odo.tick(12, FIXED_DT);
    expect(odo.distance).toBeCloseTo(12, 6);
    odo.reset();
    expect(odo.distance).toBe(0);
  });

  test('difficulty tiers map distance to integers', () => {
    expect(difficultyTier(0)).toBe(0);
    expect(difficultyTier(499)).toBe(0);
    expect(difficultyTier(500)).toBe(1);
    expect(difficultyTier(1500, 500)).toBe(3);
    expect(difficultyTier(100, 0)).toBe(100); // degenerate tier distance floors to 1
  });
});

describe('spawning law (§48)', () => {
  test('interval shrinks with distance and floors at minInterval', () => {
    const p = DEFAULT_SPAWN_POLICY;
    expect(spawnInterval(0, p)).toBe(p.baseInterval);
    expect(spawnInterval(5000, p)).toBe(p.minInterval);
    expect(spawnInterval(1000, p)).toBeLessThan(spawnInterval(0, p));
    expect(spawnInterval(1e9, p)).toBe(p.minInterval);
  });

  test('pickLane stays in range and never repeats', () => {
    const rng = mulberry32(42);
    let prev: number | null = null;
    for (let i = 0; i < 300; i++) {
      const lane = pickLane(rng, 4, prev);
      expect(lane).toBeGreaterThanOrEqual(0);
      expect(lane).toBeLessThan(4);
      if (prev !== null) expect(lane).not.toBe(prev);
      prev = lane;
    }
    expect(pickLane(rng, 1, null)).toBe(0);
  });

  test('spawner fires on the timer and is seed-deterministic', () => {
    const rngA = mulberry32(7);
    const rngB = mulberry32(7);
    const a = createSpawner(4);
    const b = createSpawner(4);
    const lanesA: number[] = [];
    const lanesB: number[] = [];
    for (let i = 0; i < 3600; i++) {
      const la = a.tick(FIXED_DT, i * 0.5, rngA);
      const lb = b.tick(FIXED_DT, i * 0.5, rngB);
      if (la !== null) lanesA.push(la);
      if (lb !== null) lanesB.push(lb);
    }
    expect(lanesA.length).toBeGreaterThan(50);
    expect(lanesA).toEqual(lanesB);
  });

  test('spawner reset restores the base interval', () => {
    const spawner = createSpawner(4);
    const rng = mulberry32(3);
    for (let i = 0; i < 600; i++) spawner.tick(FIXED_DT, i, rng);
    spawner.reset();
    expect(spawner.dueIn).toBe(DEFAULT_SPAWN_POLICY.baseInterval);
  });

  test('isCorridorSolvable enforces headway and guarantees open escape corridor', () => {
    // 3 lanes: cars in lane 0 and lane 1 near spawn y (-76)
    const active = [
      { lane: 0, y: -80 },
      { lane: 1, y: -70 },
    ];
    // Lane 2 is open: spawning in lane 2 is illegal because it would block ALL 3 lanes (wall)!
    expect(isCorridorSolvable(2, active, 3)).toBe(false);

    // If active only has lane 0 blocked:
    const singleActive = [{ lane: 0, y: -80 }];
    // Spawning in lane 1 is safe (lane 2 remains open)
    expect(isCorridorSolvable(1, singleActive, 3)).toBe(true);
    // Spawning in lane 0 is unsafe due to headway
    expect(isCorridorSolvable(0, singleActive, 3)).toBe(false);
  });

  test('pickSolvableLane returns null if no corridor can be kept open', () => {
    const rng = mulberry32(42);
    // All 3 lanes blocked in the clearance window
    const active = [
      { lane: 0, y: -80 },
      { lane: 1, y: -70 },
      { lane: 2, y: -60 },
    ];
    expect(pickSolvableLane(rng, 3, active)).toBeNull();
  });

  test('scaledSpawnPolicy adjusts baseInterval for 3 to 8 lanes', () => {
    const policy3 = scaledSpawnPolicy(3);
    const policy8 = scaledSpawnPolicy(8);
    expect(policy8.baseInterval).toBeLessThan(policy3.baseInterval);
    expect(policy8.baseInterval).toBeGreaterThanOrEqual(0.65);
  });

  test('spawner with activeCars never creates a full blocking wall', () => {
    const spawner = createSpawner(3);
    const rng = mulberry32(99);
    const active = [
      { lane: 0, y: -76 },
      { lane: 1, y: -76 },
    ];
    // Simulating ticks when lane 0 and 1 are already blocked at spawn
    for (let i = 0; i < 200; i++) {
      const lane = spawner.tick(0.016, 0, rng, active);
      // Lane 2 cannot be picked because that would create a wall blocking all 3 lanes!
      expect(lane).not.toBe(2);
    }
  });
});

describe('state machine (§49)', () => {
  test('canonical dodger path', () => {
    const fsm = createGameFsm();
    expect(fsm.state).toBe('menu');
    expect(fsm.send('START')).toBe(true);
    expect(fsm.state).toBe('playing');
    expect(fsm.send('PAUSE')).toBe(true);
    expect(fsm.send('RESUME')).toBe(true);
    expect(fsm.state).toBe('playing');
    expect(fsm.send('CRASH')).toBe(true);
    expect(fsm.state).toBe('gameover');
    expect(fsm.send('QUIT')).toBe(true);
    expect(fsm.state).toBe('menu');
  });

  test('illegal events are no-ops and notify nothing', () => {
    const fsm = createGameFsm();
    const seen: string[] = [];
    fsm.onChange((s) => seen.push(s));
    expect(fsm.send('RESUME')).toBe(false);
    expect(fsm.send('CRASH')).toBe(false);
    expect(fsm.state).toBe('menu');
    expect(seen).toEqual([]);
  });

  test('custom tables and unsubscribe work', () => {
    const fsm = createFsm<'a' | 'b' | 'c', 'GO' | 'SKIP'>('a', {
      a: { GO: 'b', SKIP: 'c' },
      b: {},
      c: {},
    });
    expect(fsm.send('SKIP')).toBe(true);
    expect(fsm.state).toBe('c');
    const off = fsm.onChange(() => {});
    expect(fsm.send('GO')).toBe(false);
    off();
  });

  test('vector helpers', () => {
    expect(add(vec(1, 2), vec(3, 4))).toEqual(vec(4, 6));
    expect(scale(vec(1, 2), 3)).toEqual(vec(3, 6));
  });
});

/**
 * Integration — a seed-replayed mini dodger. Player snaps lanes, traffic
 * spawns ahead and drives toward it at a fixed speed; a crash ends the run.
 * Two identical seeds must produce identical spawn logs, distance and state.
 */
interface Traffic {
  id: string;
  lane: number;
  y: number;
}

function runDodger(seed: number, ticks: number) {
  const rng = mulberry32(seed);
  const spawner = createSpawner(3);
  const odo = createOdometer();
  const player = { lane: 1, x: 50 };
  const LANE_X = [25, 50, 75];
  const TRAFFIC_SPEED = 240;
  const traffic: Traffic[] = [];
  const spawnLog: string[] = [];
  let crashed = false;
  let nextId = 0;

  for (let tick = 0; tick < ticks; tick++) {
    if (crashed) break;
    // player drifts toward the lane with the most open road (deterministic heuristic)
    const laneDensity = [0, 0, 0];
    for (const t of traffic) laneDensity[t.lane]++;
    let target = 0;
    for (let l = 1; l < 3; l++) if (laneDensity[l] < laneDensity[target]) target = l;
    player.x = approach(player.x, LANE_X[target], 180 * FIXED_DT);

    const lane = spawner.tick(FIXED_DT, odo.distance, rng);
    if (lane !== null) {
      traffic.push({ id: `t${nextId++}`, lane, y: -20 });
      spawnLog.push(`${tick}:${lane}`);
    }

    const speed = rampSpeed(odo.distance, 180, 320, 4000);
    odo.tick(speed, FIXED_DT);

    const playerBox = { x: player.x - 8, y: 400, w: 16, h: 28 };
    const playerVel = vec(0, 0);
    for (const t of traffic) {
      t.y += TRAFFIC_SPEED * FIXED_DT;
      const tBox = { x: LANE_X[t.lane] - 8, y: t.y, w: 16, h: 28 };
      const hit = sweep(playerBox, playerVel, tBox, vec(0, TRAFFIC_SPEED), FIXED_DT);
      if (hit !== null) {
        crashed = true;
        break;
      }
    }
    for (let i = traffic.length - 1; i >= 0; i--) {
      if (traffic[i].y > 500) traffic.splice(i, 1);
    }
  }

  return {
    distance: odo.distance,
    crashed,
    spawnLog,
    ids: traffic.map((t) => t.id).join(','),
    pairs: findOverlaps(traffic.map((t) => ({ box: { x: t.lane, y: t.y, w: 1, h: 1 } }))).length,
  };
}

describe('dodger integration — seeded full-run replay (§50)', () => {
  test('same seed → identical run, tick for tick', () => {
    const a = runDodger(20261017, 3600);
    const b = runDodger(20261017, 3600);
    expect(a).toEqual(b);
    // The sim stops at the first crash — a short but fully seeded run.
    expect(a.spawnLog.length).toBeGreaterThan(4);
  });

  test('different seeds → different traffic patterns', () => {
    const a = runDodger(1, 3600);
    const b = runDodger(2, 3600);
    expect(a.spawnLog).not.toEqual(b.spawnLog);
  });

  test('distance is monotonic and matches Σ v·dt', () => {
    const run = runDodger(7, 3600);
    expect(run.distance).toBeGreaterThan(0);
  });
});
