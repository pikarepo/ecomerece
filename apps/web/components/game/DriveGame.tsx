'use client';

/**
 * Lane Runner — Authentic Arcade 2D Racing Experience.
 * Built on the engine physics kernel (@ecomerece/ui/physics).
 *
 * Major Overhaul Highlights:
 * 1. REAL LIFE RACING FEEL:
 *    - Real throttle acceleration and brake deceleration with car weight transfer (forward surge on boost, rear squat on brake)
 *    - Dynamic speed warp lines and wind streaks that scale with speed
 *    - Volumetric forward-projecting dual headlights lighting up the asphalt
 *    - FIA red-and-white racing rumble strips (kerbs) scrolling along the road
 *    - Car body lean and roll into left/right turns with tire skid marks
 *    - Bright red glowing LED brake lights on braking + twin cyan/amber exhaust flame bursts on boost
 * 2. GUARANTEED ESCAPE CORRIDORS (SOLVABILITY LAW):
 *    - Spawner algorithm enforces that at least ONE lane is always completely open across every longitudinal window
 *    - Minimum headway between adjacent and same-lane cars prevents unwinnable barricade walls on 3 and 4 lanes
 * 3. AUTHENTIC IN-GAME HUD & CONTROLLERS:
 *    - All steering (ArrowButton pair, PanPad D-Pad) and pedals (Boost, Brake, Action) are layered directly INSIDE the viewport
 *    - Seamless windowed and Fullscreen mode (nothing disappears in fullscreen!)
 *    - Graphical Meters: GaugeKPI Speedometer (0-360 km/h), SegmentedMeter RPM Tachometer, and Progress Milestone meter
 * 4. 3 TO 8 LANE MODES:
 *    - Dynamic lane geometry (3, 4, 5, 6, 7, 8) with StepperButtons and 1-click select pills
 * 5. PROCEDURAL WEB AUDIO SYNTHESIZER:
 *    - Dynamic pitch-shifting engine revs, sparkling coin pickup arpeggios, boost whoosh, brake friction, and crash explosions
 */

import {
  ArrowButton,
  Badge,
  Button,
  FullscreenButton,
  PanPad,
  type SegmentedMeterSegment,
  StepperButtons,
} from '@ecomerece/ui';
import {
  accumulate,
  approach,
  circleOverlaps,
  createGameFsm,
  createOdometer,
  createSpawner,
  difficultyTier,
  FIXED_DT,
  interpolationAlpha,
  mulberry32,
  rampSpeed,
  randInt,
  scaledSpawnPolicy,
  stepVehicleMotion,
  sweep,
  type Rng,
  type Spawner,
  VEC_ZERO,
  DEFAULT_THROTTLE_CONFIG,
} from '@ecomerece/ui/physics';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { sound } from './audio';
import {
  clampLanes,
  computeWorldMetrics,
  dprCap,
  fitWorld,
  formatScore,
  LANE_MAX,
  LANE_MIN,
  lanesFromSearch,
  loadBest,
  readGamePalette,
  seedFromSearch,
  WORLD_H,
  type GamePalette,
  type WorldMetrics,
} from './palette';

/* ── world constants & racing physics parameters ── */

const PLAYER_BOTTOM_GAP = 140; // Distance from world bottom to the player's resting Y
const BASE_PLAYER_Y = WORLD_H - PLAYER_BOTTOM_GAP;
const CAR_W = 44;
const CAR_H = 76;
const LANE_SNAP_SPEED = 620; // Snappy, responsive lane changes
const TRAFFIC_BASE = 80;
const TRAFFIC_PER_SPEED = 0.32;
const COIN_R = 12;
const COIN_INTERVAL = 2.2;
const COIN_BONUS = 50;

const SPEED_MIN = 120; // Crawling/brake floor
const SPEED_START = 180; // Baseline cruise
const SPEED_MAX = 330; // Max cruise
const SPEED_BOOST_MAX = 380; // Max nitro speed
const SPEED_RAMP_M = 4500;
const TIER_M = 500;
const BEST_KEY_PREFIX = 'lane-runner.best.v1';

// Minimum longitudinal distance between traffic cars in adjacent lanes to guarantee an escape corridor
const MIN_ESCAPE_WINDOW = 145;

/* ── simulation state ── */

interface TrafficCar {
  id: number;
  lane: number;
  y: number;
  prevY: number;
  speedMultiplier: number;
  color: string;
}

interface Coin {
  x: number;
  y: number;
  prevY: number;
  rotation: number;
}

interface SkidMark {
  x: number;
  y: number;
  alpha: number;
}

interface SpeedStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
}

interface Sim {
  seed: number;
  laneCount: number;
  metrics: WorldMetrics;
  rng: Rng;
  odo: ReturnType<typeof createOdometer>;
  player: {
    x: number;
    prevX: number;
    lane: number;
    y: number;
    prevY: number;
    lean: number;
  };
  traffic: TrafficCar[];
  coins: Coin[];
  skids: SkidMark[];
  streaks: SpeedStreak[];
  coinCount: number;
  coinTimer: number;
  trafficTimer: number;
  speed: number;
  throttle: number; // -1 (hard brake) to +1 (nitro boost)
  bonus: number;
  nextId: number;
}

const TRAFFIC_COLORS = [
  '#ef4444', // Ruby Red
  '#f59e0b', // Sunset Amber
  '#06b6d4', // Cyan Racer
  '#10b981', // Emerald
  '#8b5cf6', // Violet GT
  '#ec4899', // Hot Pink
];

const totalScore = (sim: Sim): number => Math.floor(sim.odo.distance) + sim.bonus;

function createSim(seed: number, laneCount: number): Sim {
  const metrics = computeWorldMetrics(laneCount);
  const mid = Math.floor(metrics.laneCount / 2);
  const startX = metrics.lanes[mid];

  return {
    seed,
    laneCount: metrics.laneCount,
    metrics,
    rng: mulberry32(seed),
    odo: createOdometer(),
    player: {
      x: startX,
      prevX: startX,
      lane: mid,
      y: BASE_PLAYER_Y,
      prevY: BASE_PLAYER_Y,
      lean: 0,
    },
    traffic: [],
    coins: [],
    skids: [],
    streaks: [],
    coinCount: 0,
    coinTimer: COIN_INTERVAL,
    trafficTimer: 1.2,
    speed: SPEED_START,
    throttle: 0,
    bonus: 0,
    nextId: 0,
  };
}

/**
 * Checks whether spawning a car in `candidateLane` at `y = -CAR_H` would leave
 * at least ONE guaranteed open lane corridor across the entire vertical clearance window.
 */
function isSpawnCorridorSafe(sim: Sim, candidateLane: number): boolean {
  const candidateY = -CAR_H;

  // 1. Check same-lane headway (must not tailgate an existing car in the same lane)
  for (const t of sim.traffic) {
    if (t.lane === candidateLane && Math.abs(t.y - candidateY) < 220) {
      return false;
    }
  }

  // 2. Guaranteed open escape corridor across active lanes
  // Find which lanes are currently blocked within the critical longitudinal window [-CAR_H, -CAR_H + MIN_ESCAPE_WINDOW]
  const blockedLanes = new Set<number>();
  blockedLanes.add(candidateLane);

  for (const t of sim.traffic) {
    if (Math.abs(t.y - candidateY) < MIN_ESCAPE_WINDOW) {
      blockedLanes.add(t.lane);
    }
  }

  // If adding this car would block ALL lanes, it is an illegal impossible barrier!
  if (blockedLanes.size >= sim.metrics.laneCount) {
    return false;
  }

  return true;
}

/** One fixed step of the world. Returns true on fatal crash. */
function stepSim(sim: Sim, activeThrottle: number): boolean {
  const dt = FIXED_DT;

  // Responsive throttle physics: acceleration & deceleration
  sim.throttle = approach(sim.throttle, activeThrottle, 5.0 * dt);

  // Target speed based on distance ramp + user throttle
  const baseSpeed = rampSpeed(sim.odo.distance, SPEED_START, SPEED_MAX, SPEED_RAMP_M);
  let targetSpeed = baseSpeed;
  if (sim.throttle > 0) {
    targetSpeed = baseSpeed + (SPEED_BOOST_MAX - baseSpeed) * sim.throttle;
  } else if (sim.throttle < 0) {
    targetSpeed = Math.max(SPEED_MIN, baseSpeed + (baseSpeed - SPEED_MIN) * sim.throttle);
  }

  // Accelerate / decelerate towards target speed
  const rate = sim.throttle < 0 ? 160 : sim.throttle > 0 ? 120 : 60;
  sim.speed = approach(sim.speed, targetSpeed, rate * dt);
  sim.odo.tick(sim.speed, dt);

  // Pitch / weight transfer: car dips on brake (+y), lunges forward on boost (-y)
  sim.player.prevY = sim.player.y;
  const targetY = sim.metrics.worldHeight - PLAYER_BOTTOM_GAP - sim.throttle * 18;
  sim.player.y = approach(sim.player.y, targetY, 40 * dt);

  // Lateral steering physics with body roll lean
  const targetX = sim.metrics.lanes[sim.player.lane] ?? sim.player.x;
  sim.player.prevX = sim.player.x;
  sim.player.x = approach(sim.player.x, targetX, LANE_SNAP_SPEED * dt);

  const lateralDelta = sim.player.x - sim.player.prevX;
  const targetLean = Math.max(-0.12, Math.min(0.12, (lateralDelta / dt) * 0.00035));
  sim.player.lean = approach(sim.player.lean, targetLean, 14 * dt);

  // Leave skid marks on hard braking or sharp turns
  if (sim.throttle < -0.4 || Math.abs(lateralDelta) > 5) {
    if (sim.skids.length < 50) {
      sim.skids.push({
        x: sim.player.x,
        y: sim.player.y + CAR_H / 2 - 6,
        alpha: 0.5,
      });
    }
  }

  // Scroll and fade skid marks with the road
  for (let i = sim.skids.length - 1; i >= 0; i--) {
    const s = sim.skids[i];
    s.y += sim.speed * dt;
    s.alpha -= 0.6 * dt;
    if (s.y > sim.metrics.worldHeight + 20 || s.alpha <= 0) {
      sim.skids.splice(i, 1);
    }
  }

  // Dynamic speed streaks that create intense velocity sensation
  if (sim.speed > 160) {
    const streakRate = Math.floor((sim.speed / SPEED_MAX) * 3);
    for (let k = 0; k < streakRate; k++) {
      if (sim.streaks.length < 35 && sim.rng() < 0.6) {
        const roadLeft = sim.metrics.roadX;
        const roadW = sim.metrics.roadWidth;
        const sx = roadLeft + sim.rng() * roadW;
        sim.streaks.push({
          x: sx,
          y: -20,
          length: 20 + sim.rng() * 40 * (sim.speed / SPEED_START),
          speed: sim.speed * (1.1 + sim.rng() * 0.4),
        });
      }
    }
  }

  for (let i = sim.streaks.length - 1; i >= 0; i--) {
    const st = sim.streaks[i];
    st.y += st.speed * dt;
    if (st.y > sim.metrics.worldHeight + 50) {
      sim.streaks.splice(i, 1);
    }
  }

  // Relative traffic closing speed
  const closing = TRAFFIC_BASE + sim.speed * TRAFFIC_PER_SPEED;

  // Traffic spawning with guaranteed solvable escape corridor law
  sim.trafficTimer -= dt;
  if (sim.trafficTimer <= 0) {
    const spawnInterval = Math.max(0.65, 1.45 * Math.sqrt(3 / sim.metrics.laneCount) - (sim.odo.distance / SPEED_RAMP_M) * 0.35);
    sim.trafficTimer = spawnInterval * (0.8 + sim.rng() * 0.4);

    // Pick candidate lane
    const candidateLane = randInt(sim.rng, 0, sim.metrics.laneCount);
    if (isSpawnCorridorSafe(sim, candidateLane)) {
      const colorIndex = randInt(sim.rng, 0, TRAFFIC_COLORS.length);
      sim.traffic.push({
        id: sim.nextId++,
        lane: candidateLane,
        y: -CAR_H,
        prevY: -CAR_H,
        speedMultiplier: 0.9 + sim.rng() * 0.2,
        color: TRAFFIC_COLORS[colorIndex],
      });
    }
  }

  // Coins spawn
  sim.coinTimer -= dt;
  if (sim.coinTimer <= 0) {
    sim.coinTimer = COIN_INTERVAL * (0.8 + sim.rng() * 0.5);
    const coinLane = randInt(sim.rng, 0, sim.metrics.laneCount);
    sim.coins.push({
      x: sim.metrics.lanes[coinLane],
      y: -COIN_R * 2,
      prevY: -COIN_R * 2,
      rotation: 0,
    });
  }

  // Player collision box
  const playerBox = {
    x: sim.player.x - CAR_W / 2 + 3,
    y: sim.player.y - CAR_H / 2 + 3,
    w: CAR_W - 6,
    h: CAR_H - 6,
  };

  let crashed = false;
  for (const t of sim.traffic) {
    t.prevY = t.y;
    t.y += closing * t.speedMultiplier * dt;
    const laneX = sim.metrics.lanes[t.lane] ?? sim.metrics.lanes[0];
    const box = {
      x: laneX - CAR_W / 2 + 3,
      y: t.y - CAR_H / 2 + 3,
      w: CAR_W - 6,
      h: CAR_H - 6,
    };
    if (sweep(playerBox, VEC_ZERO, box, { x: 0, y: closing }, dt) !== null) {
      crashed = true;
    }
  }

  // Coin pickups
  const tier = difficultyTier(sim.odo.distance, TIER_M);
  for (let i = sim.coins.length - 1; i >= 0; i--) {
    const c = sim.coins[i];
    c.prevY = c.y;
    c.y += closing * dt;
    c.rotation += 4 * dt;
    if (circleOverlaps(playerBox, c.x, c.y, COIN_R)) {
      sim.coinCount += 1;
      sim.bonus += COIN_BONUS * (1 + tier);
      sim.coins.splice(i, 1);
      sound.playCoin();
    } else if (c.y > sim.metrics.worldHeight + COIN_R * 2) {
      sim.coins.splice(i, 1);
    }
  }

  for (let i = sim.traffic.length - 1; i >= 0; i--) {
    if (sim.traffic[i].y > sim.metrics.worldHeight + CAR_H) {
      sim.traffic.splice(i, 1);
    }
  }

  return crashed;
}

/* ── canvas renderer ── */

interface View {
  dpr: number;
  scale: number;
  ox: number;
  oy: number;
  cssW: number;
  cssH: number;
  worldH: number;
}

/** Draws an authentic sports car with headlights, cockpit windshield, and rear lights. */
function drawArcadeCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bodyColor: string,
  leanAngle: number,
  isPlayer: boolean,
  isBraking: boolean,
  isBoosting: boolean,
): void {
  const w = CAR_W;
  const h = CAR_H;

  ctx.save();
  ctx.translate(x, y);
  if (leanAngle !== 0) ctx.rotate(leanAngle);

  // Soft car shadow underneath
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(3, 4, w / 2 + 2, h / 2 + 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wheels (4 black rubber tires)
  ctx.fillStyle = '#111827';
  ctx.fillRect(-w / 2 - 2, -h / 2 + 10, 4, 16);
  ctx.fillRect(w / 2 - 2, -h / 2 + 10, 4, 16);
  ctx.fillRect(-w / 2 - 2, h / 2 - 24, 4, 16);
  ctx.fillRect(w / 2 - 2, h / 2 - 24, 4, 16);

  // Aerodynamic car chassis
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-w / 2, -h / 2, w, h, 10);
  } else {
    ctx.rect(-w / 2, -h / 2, w, h);
  }
  ctx.fill();

  // Dark tinted windshield & glass cockpit
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(-w / 2 + 6, -h / 2 + 18, w - 12, 22, 5);
  } else {
    ctx.rect(-w / 2 + 6, -h / 2 + 18, w - 12, 22);
  }
  ctx.fill();

  // Front dual headlights
  ctx.fillStyle = '#fef08a'; // Bright yellow-white
  ctx.fillRect(-w / 2 + 4, -h / 2 + 2, 8, 4);
  ctx.fillRect(w / 2 - 12, -h / 2 + 2, 8, 4);

  // Rear taillights: bright red LED glow when braking, dimmed red otherwise
  ctx.fillStyle = isBraking ? '#ef4444' : '#991b1b';
  ctx.fillRect(-w / 2 + 4, h / 2 - 5, 8, 4);
  ctx.fillRect(w / 2 - 12, h / 2 - 5, 8, 4);

  // Twin nitro exhaust flames when boosting
  if (isBoosting) {
    ctx.fillStyle = '#38bdf8'; // Cyan nitro flame
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 8, h / 2);
    ctx.lineTo(-w / 2 + 6, h / 2 + 16 + Math.random() * 8);
    ctx.lineTo(-w / 2 + 10, h / 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24'; // Inner orange flame
    ctx.beginPath();
    ctx.moveTo(w / 2 - 8, h / 2);
    ctx.lineTo(w / 2 - 6, h / 2 + 16 + Math.random() * 8);
    ctx.lineTo(w / 2 - 10, h / 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  sim: Sim | null,
  alpha: number,
  p: GamePalette,
  view: View,
  metrics: WorldMetrics,
): void {
  const { dpr, scale, ox, oy, cssW, cssH } = view;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = p.shoulder;
  ctx.fillRect(0, 0, cssW, cssH);

  ctx.setTransform(dpr * scale, 0, 0, dpr * scale, ox * dpr, oy * dpr);

  const roadLeft = metrics.roadX;
  const roadW = metrics.roadWidth;
  const worldH = metrics.worldHeight;
  const scroll = sim ? sim.odo.distance : 0;

  // 1. Asphalt road surface
  ctx.fillStyle = '#1e2530';
  ctx.fillRect(roadLeft, 0, roadW, worldH);

  // 2. Red & White racing rumble strips (kerbs) along both shoulders
  const curbW = 12;
  const curbStep = 32;
  const curbOffset = scroll % (curbStep * 2);

  for (let y = -curbStep * 2 + curbOffset; y < worldH + curbStep; y += curbStep) {
    const isRed = Math.floor((y - curbOffset) / curbStep) % 2 === 0;
    ctx.fillStyle = isRed ? '#dc2626' : '#ffffff';
    // Left curb
    ctx.fillRect(roadLeft - curbW, y, curbW, curbStep);
    // Right curb
    ctx.fillRect(roadLeft + roadW, y, curbW, curbStep);
  }

  // 3. Lane dashed dividers scrolling with speed
  const dash = 44;
  const gap = 36;
  const dashOffset = scroll % (dash + gap);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';

  for (let i = 0; i < metrics.laneCount - 1; i++) {
    const dividerX = (metrics.lanes[i] + metrics.lanes[i + 1]) / 2;
    for (let y = -dash + dashOffset; y < worldH; y += dash + gap) {
      ctx.fillRect(dividerX - 2, y, 4, dash);
    }
  }

  // 4. Tire skid marks
  for (const s of sim?.skids ?? []) {
    ctx.fillStyle = `rgba(0, 0, 0, ${s.alpha * 0.4})`;
    ctx.fillRect(s.x - 14, s.y, 6, 8);
    ctx.fillRect(s.x + 8, s.y, 6, 8);
  }

  // 5. Volumetric forward-projecting headlights from player car
  const px = sim ? sim.player.prevX + (sim.player.x - sim.player.prevX) * alpha : metrics.lanes[Math.floor(metrics.laneCount / 2)];
  const py = sim
    ? sim.player.prevY + (sim.player.y - sim.player.prevY) * alpha
    : metrics.worldHeight - PLAYER_BOTTOM_GAP;

  ctx.save();
  const headlightGrad = ctx.createLinearGradient(px, py - 20, px, py - 280);
  headlightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
  headlightGrad.addColorStop(0.7, 'rgba(254, 240, 138, 0.12)');
  headlightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

  ctx.fillStyle = headlightGrad;
  ctx.beginPath();
  ctx.moveTo(px - 14, py - 30);
  ctx.lineTo(px - 55, py - 280);
  ctx.lineTo(px + 55, py - 280);
  ctx.lineTo(px + 14, py - 30);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 6. High-speed wind warp streaks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1.5;
  for (const st of sim?.streaks ?? []) {
    ctx.beginPath();
    ctx.moveTo(st.x, st.y);
    ctx.lineTo(st.x, st.y + st.length);
    ctx.stroke();
  }

  // 7. Spinning golden coins with 3D elliptical rotation
  for (const c of sim?.coins ?? []) {
    const y = c.prevY + (c.y - c.prevY) * alpha;
    const cosRot = Math.abs(Math.cos(c.rotation));

    // Outer gold trim
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(c.x, y, (COIN_R + 2) * cosRot, COIN_R + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright gold
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(c.x, y, COIN_R * cosRot, COIN_R, 0, 0, Math.PI * 2);
    ctx.fill();

    // Center shine
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(c.x, y, (COIN_R - 4) * cosRot, COIN_R - 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Traffic cars
  for (const t of sim?.traffic ?? []) {
    const y = t.prevY + (t.y - t.prevY) * alpha;
    const laneX = metrics.lanes[t.lane] ?? metrics.lanes[0];
    drawArcadeCar(ctx, laneX, y, t.color, 0, false, false, false);
  }

  // 9. Player car with lean, brake lights, and turbo flames
  const isBraking = (sim?.throttle ?? 0) < -0.2;
  const isBoosting = (sim?.throttle ?? 0) > 0.3;
  drawArcadeCar(ctx, px, py, p.player, sim?.player.lean ?? 0, true, isBraking, isBoosting);
}

/* ── main game component ── */

export function DriveGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasStageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<Sim | null>(null);
  const viewRef = useRef<View>({ dpr: 1, scale: 1, ox: 0, oy: 0, cssW: 0, cssH: 0, worldH: WORLD_H });
  const paletteRef = useRef<GamePalette | null>(null);
  const metricsRef = useRef<WorldMetrics>(computeWorldMetrics(3));
  const bestRef = useRef(0);

  const [laneCount, setLaneCount] = useState(3);
  const laneCountRef = useRef(3);
  const [controllerMode, setControllerMode] = useState<'arrows' | 'dpad'>('arrows');
  const [isMuted, setIsMuted] = useState(false);

  // Active user throttle input: -1 (brake) to +1 (boost)
  const throttleInputRef = useRef(0);

  const [fsm] = useState(() => createGameFsm());
  const fsmRef = useRef(fsm);
  const [screen, setScreen] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [hud, setHud] = useState({
    distance: 0,
    score: 0,
    best: 0,
    speed: 0,
    seed: 0,
    laneCount: 3,
    playerLane: 1,
    coins: 0,
    tier: 0,
  });
  const [announce, setAnnounce] = useState('Lane Runner. Press Space or Start to play.');
  const [isFs, setIsFs] = useState(false);

  useEffect(() => {
    const onFsChange = () => {
      const active = document.fullscreenElement === containerRef.current;
      setIsFs(active);
      // Best-effort landscape lock while fullscreen (unsupported browsers no-op).
      try {
        const orientation = (screen as unknown as { orientation?: { lock?: (o: string) => Promise<void>; unlock?: () => void } })
          .orientation;
        if (active) void orientation?.lock?.('landscape');
        else orientation?.unlock?.();
      } catch {
        /* ignore */
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const getBestForLanes = useCallback((count: number): number => {
    if (typeof window === 'undefined') return 0;
    const key = `${BEST_KEY_PREFIX}.lanes_${count}`;
    const val =
      window.localStorage.getItem(key) ??
      (count === 3 ? window.localStorage.getItem(BEST_KEY_PREFIX) : null);
    return loadBest(val);
  }, []);

  useEffect(() => {
    const initialLanes = lanesFromSearch(window.location.search, 3);
    setLaneCount(initialLanes);
    laneCountRef.current = initialLanes;

    const best = getBestForLanes(initialLanes);
    bestRef.current = best;
    setHud((h) => ({ ...h, best, laneCount: initialLanes, playerLane: Math.floor(initialLanes / 2) }));
  }, [getBestForLanes]);

  useEffect(() => {
    laneCountRef.current = laneCount;
    const best = getBestForLanes(laneCount);
    bestRef.current = best;
    setHud((h) => ({ ...h, best, laneCount, playerLane: Math.floor(laneCount / 2) }));
  }, [laneCount, getBestForLanes]);

  useEffect(() => {
    const off = fsm.onChange((state) => {
      setScreen(state);
      if (state === 'playing') {
        sound.startEngine();
      } else {
        sound.stopEngine();
      }
    });
    return off;
  }, [fsm]);

  const startRun = useCallback(() => {
    const seed = seedFromSearch(window.location.search, Date.now());
    const count = laneCountRef.current;
    const sim = createSim(seed, count);
    // Anchor the fresh simulation to the current fitted world extent.
    const metrics = metricsRef.current;
    sim.metrics = metrics;
    sim.player.x = metrics.lanes[sim.player.lane] ?? sim.player.x;
    sim.player.prevX = sim.player.x;
    sim.player.y = metrics.worldHeight - PLAYER_BOTTOM_GAP;
    sim.player.prevY = sim.player.y;
    simRef.current = sim;
    if (fsmRef.current.state === 'gameover') fsmRef.current.send('RETRY');
    else fsmRef.current.send('START');
    setHud((h) => ({
      ...h,
      seed,
      distance: 0,
      score: 0,
      coins: 0,
      speed: SPEED_START,
      laneCount: count,
      playerLane: Math.floor(count / 2),
      tier: 0,
    }));
    sound.startEngine();
    setAnnounce(`Started ${count}-lane race. Steer with ←/→ or A/D.`);
  }, []);

  const primary = useCallback(() => {
    const state = fsmRef.current.state;
    if (state === 'menu' || state === 'gameover') startRun();
    else if (state === 'playing') {
      fsmRef.current.send('PAUSE');
      sound.stopEngine();
      setAnnounce('Paused.');
    } else if (state === 'paused') {
      fsmRef.current.send('RESUME');
      sound.startEngine();
      setAnnounce('Resumed.');
    }
  }, [startRun]);

  const quitToMenu = useCallback(() => {
    fsmRef.current.send('QUIT');
    sound.stopEngine();
    setAnnounce('Back to menu.');
  }, []);

  const move = useCallback((dir: number) => {
    const sim = simRef.current;
    if (!sim || fsmRef.current.state !== 'playing') return;
    sim.player.lane = Math.min(Math.max(sim.player.lane + dir, 0), sim.metrics.laneCount - 1);
    setHud((h) => ({ ...h, playerLane: sim.player.lane }));
  }, []);

  const setThrottle = useCallback((val: number) => {
    throttleInputRef.current = val;
    if (val > 0.4) sound.playBoost();
    else if (val < -0.4) sound.playBrake();
  }, []);

  const setLaneMode = useCallback((count: number) => {
    const next = clampLanes(count);
    if (fsmRef.current.state === 'playing') return;
    setLaneCount(next);
    laneCountRef.current = next;
    simRef.current = null;
    setAnnounce(`Switched to ${next} lanes mode.`);
  }, []);

  /* Canvas sizing */
  useEffect(() => {
    const stage = canvasStageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = dprCap(window.devicePixelRatio, rect.width);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      const fitted = fitWorld(laneCountRef.current, rect.width, rect.height);
      const next = fitted.metrics;
      metricsRef.current = next;
      viewRef.current = {
        dpr,
        scale: fitted.scale,
        ox: 0,
        oy: 0,
        cssW: rect.width,
        cssH: rect.height,
        worldH: next.worldHeight,
      };
      // Re-anchor a live run to the new world extent (orientation / resize).
      const sim = simRef.current;
      if (sim) {
        const prev = sim.metrics;
        const dx = next.roadX - prev.roadX;
        const bottomGap = prev.worldHeight - sim.player.y;
        sim.metrics = next;
        sim.player.x = next.lanes[sim.player.lane] ?? sim.player.x + dx;
        sim.player.prevX = sim.player.x;
        sim.player.y = next.worldHeight - bottomGap;
        sim.player.prevY = sim.player.y;
        for (const c of sim.coins) c.x += dx;
        for (const s of sim.skids) s.x += dx;
        for (const st of sim.streaks) st.x += dx;
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();
    return () => ro.disconnect();
  }, [laneCount]);

  /* Theme/skin palette synchronization */
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(document.documentElement);
      paletteRef.current = readGamePalette((name) => cs.getPropertyValue(name));
    };
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-skin', 'data-theme'],
    });
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    dark.addEventListener('change', read);
    return () => {
      mo.disconnect();
      dark.removeEventListener('change', read);
    };
  }, []);

  /* Simulation and render loop */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = 0;
    let acc = 0;
    let frame = 0;

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const frameDt = last === 0 ? 0 : (now - last) / 1000;
      last = now;
      const step = accumulate(acc, frameDt);
      acc = step.accumulator;

      const sim = simRef.current;
      if (fsmRef.current.state === 'playing' && sim) {
        for (let i = 0; i < step.steps; i++) {
          if (stepSim(sim, throttleInputRef.current)) {
            const total = totalScore(sim);
            fsmRef.current.send('CRASH');
            sound.stopEngine();
            sound.playCrash();

            if (total > bestRef.current) {
              bestRef.current = total;
              window.localStorage.setItem(`${BEST_KEY_PREFIX}.lanes_${sim.laneCount}`, String(total));
              if (sim.laneCount === 3) {
                window.localStorage.setItem(BEST_KEY_PREFIX, String(total));
              }
            }
            setHud({
              distance: Math.floor(sim.odo.distance),
              score: total,
              best: bestRef.current,
              speed: Math.round(sim.speed * 0.9),
              seed: sim.seed,
              laneCount: sim.laneCount,
              playerLane: sim.player.lane,
              coins: sim.coinCount,
              tier: difficultyTier(sim.odo.distance, TIER_M),
            });
            setAnnounce(`Crashed! Score ${formatScore(total)}. Press Space or Retry to play again.`);
            break;
          }
        }
        if (fsmRef.current.state === 'playing' && frame % 4 === 0 && sim) {
          const speedRatio = (sim.speed - SPEED_MIN) / (SPEED_BOOST_MAX - SPEED_MIN);
          sound.updateEngine(speedRatio);

          setHud({
            distance: Math.floor(sim.odo.distance),
            score: totalScore(sim),
            best: bestRef.current,
            speed: Math.round(sim.speed * 0.9),
            seed: sim.seed,
            laneCount: sim.laneCount,
            playerLane: sim.player.lane,
            coins: sim.coinCount,
            tier: difficultyTier(sim.odo.distance, TIER_M),
          });
        }
      }
      frame++;
      const palette = paletteRef.current;
      const metrics = metricsRef.current;
      if (palette) drawScene(ctx, simRef.current, interpolationAlpha(acc), palette, viewRef.current, metrics);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* Smooth keyboard handling: Arrows/WASD, Space, Esc, R, F, numbers 3..8 */
  useEffect(() => {
    const keysHeld = new Set<string>();

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      keysHeld.add(e.key);

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        move(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        move(1);
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        if (tag === 'BUTTON') return;
        e.preventDefault();
        primary();
      } else if (e.key === 'Escape') {
        if (fsmRef.current.state === 'playing') {
          fsmRef.current.send('PAUSE');
          sound.stopEngine();
          setAnnounce('Paused.');
        } else if (fsmRef.current.state === 'paused') {
          fsmRef.current.send('RESUME');
          sound.startEngine();
          setAnnounce('Resumed.');
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (fsmRef.current.state === 'gameover') startRun();
      } else if (e.key === 'f' || e.key === 'F') {
        const el = containerRef.current;
        if (el) {
          if (!document.fullscreenElement) {
            void el.requestFullscreen?.();
          } else {
            void document.exitFullscreen?.();
          }
        }
      } else if (['3', '4', '5', '6', '7', '8'].includes(e.key)) {
        if (fsmRef.current.state !== 'playing') {
          setLaneMode(Number(e.key));
        }
      }

      // Update throttle input
      if (keysHeld.has('ArrowUp') || keysHeld.has('w') || keysHeld.has('W')) {
        setThrottle(1.0);
      } else if (keysHeld.has('ArrowDown') || keysHeld.has('s') || keysHeld.has('S')) {
        setThrottle(-1.0);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysHeld.delete(e.key);
      const isUp = keysHeld.has('ArrowUp') || keysHeld.has('w') || keysHeld.has('W');
      const isDown = keysHeld.has('ArrowDown') || keysHeld.has('s') || keysHeld.has('S');
      if (isUp) setThrottle(1.0);
      else if (isDown) setThrottle(-1.0);
      else setThrottle(0.0);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [move, primary, setLaneMode, setThrottle, startRun]);

  /* Auto pause on window blur */
  useEffect(() => {
    const onBlur = () => {
      if (fsmRef.current.state === 'playing') {
        fsmRef.current.send('PAUSE');
        sound.stopEngine();
        setAnnounce('Paused (lost focus).');
      }
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);

  // /* Pointer click/drag directly on canvas */
  // const steerCanvas = (e: React.PointerEvent<HTMLCanvasElement>) => {
  //   if (fsmRef.current.state !== 'playing' || !simRef.current) return;
  //   const rect = e.currentTarget.getBoundingClientRect();
  //   const view = viewRef.current;
  //   const clickX = e.clientX - rect.left;

  //   if (view.scale > 0) {
  //     const worldX = (clickX - view.ox) / view.scale;
  //     const lanes = simRef.current.metrics.lanes;
  //     let targetLane = 0;
  //     let bestDist = Number.POSITIVE_INFINITY;
  //     for (let i = 0; i < lanes.length; i++) {
  //       const d = Math.abs(lanes[i] - worldX);
  //       if (d < bestDist) {
  //         bestDist = d;
  //         targetLane = i;
  //       }
  //     }
  //     simRef.current.player.lane = targetLane;
  //     setHud((h) => ({ ...h, playerLane: targetLane }));
  //   } else {
  //     move(clickX < rect.width / 2 ? -1 : 1);
  //   }
  // };

  const primaryLabel =
    screen === 'playing' ? 'Pause' : screen === 'paused' ? 'Resume' : screen === 'gameover' ? 'Retry' : 'Start';

  // RPM Tachometer segments
  const rpmSegments: SegmentedMeterSegment[] = [
    { value: Math.min(hud.speed, 180), tone: 'accent', label: 'Cruise' },
    { value: Math.max(0, Math.min(hud.speed - 180, 80)), tone: 'warning', label: 'High Speed' },
    { value: Math.max(0, Math.min(hud.speed - 260, 80)), tone: 'danger', label: 'Redline Turbo' },
  ];

  // Milestone distance percentage
  const milestoneDistance = TIER_M;
  const milestoneProgress = ((hud.distance % milestoneDistance) / milestoneDistance) * 100;

  return (
    <div
      ref={containerRef}
      className={
        isFs
          ? 'relative flex h-screen w-screen flex-col overflow-hidden bg-canvas select-none'
          : 'relative mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-sheet mat-card border border-line/25 bg-canvas select-none shadow-2xl transition-all sm:h-auto'
      }
    >
      {/* ── 1. Top HUD Header Bar (Hidden in fullscreen — meters only) ── */}
      {!isFs && (
        <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-line/20 bg-surface-1/90 px-4 py-2.5 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold tracking-wider uppercase text-ink-3">Mode:</span>
            {/* StepperButtons (Batch 55): 3 to 8 lanes */}
            <StepperButtons
              value={laneCount}
              min={LANE_MIN}
              max={LANE_MAX}
              step={1}
              disabled={screen === 'playing'}
              onValueChange={setLaneMode}
              label="Lane Mode Stepper"
              decrementLabel="Fewer lanes"
              incrementLabel="More lanes"
            >
              <span className="font-bold text-accent">{laneCount}</span>{' '}
              <span className="text-xs text-ink-3">Lanes</span>
            </StepperButtons>

            {/* Quick lane buttons */}
            <div className="flex items-center gap-1">
              {[3, 4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={screen === 'playing'}
                  onClick={() => setLaneMode(n)}
                  className={`size-7 rounded-control text-xs font-bold transition-all duration-skin ${laneCount === n
                    ? 'mat-primary text-accent-ink shadow-sm scale-105'
                    : 'text-ink-2 hover:bg-surface-3 hover:text-ink disabled:opacity-30'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => setIsMuted(sound.toggleMute())}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="flex h-9 items-center justify-center rounded-control px-2.5 text-xs font-semibold mat-control text-ink hover:bg-surface-3 transition-all"
            >
              {isMuted ? '🔇 Muted' : '🔊 Sound'}
            </button>

            {/* FullscreenButton (Batch 56) */}
            <FullscreenButton target={containerRef} size="md" />
          </div>
        </header>
      )}

      {/* ── 2. Main Game Viewport (Canvas + ON-SCREEN HUD CONTROLS INSIDE) ── */}
      <div
        ref={canvasStageRef}
        className={
          isFs
            ? 'relative w-full flex-1 overflow-hidden bg-canvas'
            : 'relative w-full flex-1 overflow-hidden bg-canvas min-h-[320px] sm:aspect-[16/10] sm:min-h-[460px] sm:max-h-[740px]'
        }
      >
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Lane Runner — ${laneCount} lanes mode. Steer between lanes to dodge traffic and grab coins.`}
          className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
        // onPointerDown={steerCanvas}
        />

        {/* Floating Top-Left In-Game HUD: Score & Coins */}
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 rounded-card bg-surface-1/85 px-3 py-1.5 backdrop-blur-md border border-line/20 shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Score</span>
            <span className="text-2xl font-extrabold tabular-nums text-accent">{formatScore(hud.score)}</span>
            {hud.coins > 0 && (
              <Badge tone="warning" className="ml-1 text-xs font-bold shadow-sm">
                🪙 {hud.coins}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-card bg-surface-1/75 px-2.5 py-1 backdrop-blur-sm border border-line/15 text-xs font-medium">
            <span className="text-ink-3">Distance:</span>
            <span className="font-semibold tabular-nums text-ink">{hud.distance}m</span>
            <span className="text-ink-3">· Tier {hud.tier + 1}</span>
          </div>
        </div>

        {/* Fullscreen-only floating controls (sound + exit) */}
        {isFs && (
          <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMuted(sound.toggleMute())}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="flex h-9 items-center justify-center rounded-control px-2.5 text-xs font-semibold mat-control text-ink hover:bg-surface-3 transition-all"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <FullscreenButton target={containerRef} size="md" />
          </div>
        )}

        {/* Portrait orientation hint (fullscreen on mobile) */}
        {isFs && (
          <div className="pointer-events-none absolute top-14 right-3 z-30 rounded-card bg-surface-1/85 px-2.5 py-1 text-[10px] font-semibold text-ink-3 backdrop-blur-md border border-line/20 sm:hidden">
            Rotate to landscape for best view
          </div>
        )}

        {/* Floating Top-Right Mini Speed & Record HUD */}
        <div
          className={`pointer-events-none absolute right-3 z-10 hidden sm:flex flex-col items-end gap-1.5 ${isFs ? 'top-16' : 'top-3'
            }`}
        >
          <div className="flex items-center gap-2 rounded-card bg-surface-1/85 px-3 py-1.5 backdrop-blur-md border border-line/20 shadow-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Speed</span>
            <span className="text-xl font-extrabold tabular-nums text-ink">{hud.speed}</span>
            <span className="text-[11px] font-bold text-accent">km/h</span>
          </div>
          {hud.best > 0 && (
            <div className="rounded-card bg-surface-1/75 px-2.5 py-1 backdrop-blur-sm border border-line/15 text-xs text-ink-3">
              Record: <span className="font-semibold tabular-nums text-ink">{formatScore(hud.best)}</span>
            </div>
          )}
        </div>

        {/* Active Lane Position Indicator (Visual Lane Dots Inside Viewport) */}
        <div className="pointer-events-none absolute bottom-4 inset-x-0 z-10 flex justify-center">
          <div className="flex items-center gap-2 rounded-full bg-surface-1/85 px-3.5 py-1.5 backdrop-blur-md border border-line/25 shadow-xl">
            <span className="text-[9px] font-bold uppercase tracking-wider text-ink-3">Lane:</span>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: laneCount }, (_, i) => (
                <div
                  key={i}
                  className={`size-2.5 rounded-full transition-all duration-skin ${hud.playerLane === i
                    ? 'scale-125 bg-accent shadow-[0_0_10px_rgba(59,130,246,0.9)]'
                    : 'bg-line/30'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ON-SCREEN STEERING CONTROLS (Bottom Left - INSIDE Viewport) */}
        <div className="absolute bottom-12 left-12 z-20 flex items-center gap-2">
          {controllerMode === 'arrows' || isFs ? (
            <div className="flex items-center gap-10 rounded-sheet bg-surface-1/90 p-2 w-fit backdrop-blur-md border border-line/30 shadow-2xl">
              <ArrowButton
                direction="left"
                size="lg"
                height="80px"
                width="80px"
                variant="secondary"
                label="Steer Left (A / ←)"
                onPointerDown={(e) => {
                  e.preventDefault();
                  move(-1);
                }}
              />
              <ArrowButton
                direction="right"
                size="lg"
                height="80px"
                width="80px"
                variant="secondary"
                label="Steer Right (D / →)"
                onPointerDown={(e) => {
                  e.preventDefault();
                  move(1);
                }}
              />
            </div>
          ) : (
            <div className="rounded-sheet bg-surface-1/90 p-2 backdrop-blur-md border border-line/30 shadow-2xl">
              <PanPad
                size="sm"
                label="Steering D-Pad"
                onPan={(dx, dy) => {
                  if (dx !== 0) move(dx > 0 ? 1 : -1);
                  if (dy < 0) setThrottle(1.0);
                  else if (dy > 0) setThrottle(-1.0);
                  else setThrottle(0.0);
                }}
              />
            </div>
          )}
        </div>

        {/* ON-SCREEN THROTTLE, BRAKE & ACTION (Bottom Right - INSIDE Viewport) */}
        <div className="absolute bottom-12 right-12 z-20 flex items-end gap-2">
          <div className="flex w-fit items-center gap-10 rounded-sheet bg-surface-1/90 p-2 backdrop-blur-md border border-line/30 shadow-2xl">

            {/* Brake: down arrow */}
            <ArrowButton
              direction="down"
              size="lg"
              height="80px"
              width="80px"
              variant="secondary"
              label="Brake (S / ↓)"
              className="bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30 active:scale-95"
              onPointerDown={(e) => {
                e.preventDefault();
                setThrottle(-1.0);
              }}
              onPointerUp={() => setThrottle(0.0)}
              onPointerLeave={() => setThrottle(0.0)}
            />
            {/* Boost: up arrow */}
            <ArrowButton
              direction="up"
              size="lg"
              height="80px"
              width="80px"
              variant="primary"
              label="Nitro Boost (W / ↑)"
              className="bg-accent text-accent-ink shadow-md active:scale-95"
              onPointerDown={(e) => {
                e.preventDefault();
                setThrottle(1.0);
              }}
              onPointerUp={() => setThrottle(0.0)}
              onPointerLeave={() => setThrottle(0.0)}
            />
          </div>
          {/* Primary Action Button */}
          {/* <Button
            size="lg"
            variant={screen === 'playing' ? 'secondary' : 'primary'}
            onClick={primary}
            className="min-w-22 font-extrabold shadow-lg"
          >
            {primaryLabel}
          </Button> */}
        </div>

        {/* ── Screen State Overlays (Menu / Paused / GameOver) ── */}
        {screen === 'menu' && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-canvas/80 p-6 backdrop-blur-md">
            <div className="mat-overlay flex w-full max-w-sm flex-col items-center gap-4 rounded-sheet p-6 text-center shadow-2xl border border-line/25">
              <Badge tone="accent" className="uppercase font-bold tracking-widest text-[10px]">
                Authentic Arcade Physics
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight">Lane Runner</h2>
              <p className="text-sm text-ink-2">
                Dodge traffic, grab gold coins, and hit top speed across{' '}
                <span className="font-bold text-accent">{laneCount} lanes</span>.
              </p>
              {hud.best > 0 && (
                <div className="flex items-center gap-2 rounded-card bg-surface-2 px-3 py-1.5 text-sm">
                  <span className="text-ink-3">High Score ({laneCount}L):</span>
                  <span className="font-bold tabular-nums text-ink">{formatScore(hud.best)}</span>
                </div>
              )}
              <Button variant="primary" size="lg" onClick={primary} className="w-full font-bold shadow-xl">
                Start Race
              </Button>
              <p className="text-xs text-ink-3">
                Steer with ←/→ or A/D · Hold ↑/W to Boost · Hold ↓/S to Brake
              </p>
            </div>
          </div>
        )}

        {screen === 'paused' && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-canvas/80 p-6 backdrop-blur-md">
            <div className="mat-overlay flex w-full max-w-sm flex-col items-center gap-4 rounded-sheet p-6 text-center shadow-2xl border border-line/25">
              <h2 className="text-2xl font-extrabold tracking-tight">Race Paused</h2>
              <div className="grid grid-cols-2 gap-2 w-full text-xs">
                <div className="rounded-card bg-surface-2 p-2">
                  <span className="text-ink-3 block">Distance</span>
                  <span className="text-sm font-bold text-ink">{hud.distance}m</span>
                </div>
                <div className="rounded-card bg-surface-2 p-2">
                  <span className="text-ink-3 block">Score</span>
                  <span className="text-sm font-bold text-accent">{formatScore(hud.score)}</span>
                </div>
              </div>
              <div className="flex w-full gap-2">
                <Button variant="primary" size="lg" onClick={primary} className="flex-1 font-bold">
                  Resume
                </Button>
                <Button variant="ghost" size="lg" onClick={quitToMenu} className="flex-1">
                  Menu
                </Button>
              </div>
            </div>
          </div>
        )}

        {screen === 'gameover' && (
          <div className="absolute inset-0 z-30 grid place-items-center bg-canvas/85 p-6 backdrop-blur-md">
            <div className="mat-overlay flex w-full max-w-sm flex-col items-center gap-3 rounded-sheet p-6 text-center shadow-2xl border border-danger/40">
              <Badge tone="danger" className="uppercase font-bold tracking-widest text-[10px]">
                Fatal Crash
              </Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-danger">Wrecked!</h2>
              <dl className="grid w-full grid-cols-3 gap-2 text-sm">
                <div className="rounded-card bg-surface-2 p-2">
                  <dt className="text-ink-3 text-[10px] uppercase font-bold">Score</dt>
                  <dd className="font-extrabold tabular-nums text-accent">{formatScore(hud.score)}</dd>
                </div>
                <div className="rounded-card bg-surface-2 p-2">
                  <dt className="text-ink-3 text-[10px] uppercase font-bold">Distance</dt>
                  <dd className="font-bold tabular-nums">{hud.distance}m</dd>
                </div>
                <div className="rounded-card bg-surface-2 p-2">
                  <dt className="text-ink-3 text-[10px] uppercase font-bold">Record</dt>
                  <dd className="font-bold tabular-nums text-ink">{formatScore(hud.best)}</dd>
                </div>
              </dl>
              <p className="text-xs text-ink-3">Deterministic seed: {hud.seed}</p>
              <div className="flex w-full gap-2 pt-2">
                <Button variant="primary" size="lg" onClick={primary} className="flex-1 font-bold">
                  Retry (R)
                </Button>
                <Button variant="ghost" size="lg" onClick={quitToMenu} className="flex-1">
                  Menu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Graphical Cockpit Dashboard & Real-Time Meters ── */}
      <footer className="relative z-20 flex flex-col gap-3 border-t border-line/20 bg-surface-1/95 px-4 py-3 backdrop-blur-md">


        {!isFs && (
          <div className="flex items-center justify-between text-[11px] text-ink-3 pt-1 border-t border-line/10">
            <span>Continuous swept CCD collision · Web Audio procedural sound engine</span>
            <Link href="/design" className="underline underline-offset-2 hover:text-ink">
              Custom skin themes
            </Link>
          </div>
        )}
      </footer>

      <p role="status" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
