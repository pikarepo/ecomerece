/**
 * Lane Runner — pure helpers (apps/web).
 *
 * Kept DOM-free so `bun test` can cover them without a canvas. The palette
 * reader is injected (`getVar`) — the component wires `getComputedStyle`, the
 * tests wire a plain object. Token names are the theme vars skins restyle
 * (§50: canvas reads the compiled `--*` vars, so switching a skin reskins
 * the game with zero game code).
 */

export interface GamePalette {
  /** Road surface. */
  road: string;
  /** Shoulders / off-road. */
  shoulder: string;
  /** Lane dashes + car outlines. */
  line: string;
  player: string;
  playerTrim: string;
  traffic: string;
  coin: string;
  coinTrim: string;
}

const FALLBACK: Record<string, string> = {
  '--canvas': '11 15 23',
  '--surface-1': '19 26 38',
  '--line': '255 255 255',
  '--accent': '37 99 235',
  '--accent-ink': '255 255 255',
  '--ink-3': '160 171 189',
  '--warning': '180 83 9',
};

/** `"37 99 235"` → `[37, 99, 235]`; malformed input → `null`. */
export function parseTriplet(value: string): [number, number, number] | null {
  const parts = value.trim().split(/\s+/);
  if (parts.length !== 3) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null;
  return [nums[0], nums[1], nums[2]];
}

/** Token triplet → a CSS/canvas colour string. */
export function tripletToRgba(value: string, alpha = 1): string {
  const rgb = parseTriplet(value) ?? parseTriplet(FALLBACK['--canvas']) ?? [0, 0, 0];
  const [r, g, b] = rgb;
  return alpha >= 1 ? `rgb(${r} ${g} ${b})` : `rgb(${r} ${g} ${b} / ${alpha})`;
}

/** Build the game palette from a token reader (injected `getPropertyValue`). */
export function readGamePalette(getVar: (name: string) => string): GamePalette {
  const token = (name: string): string => {
    const raw = getVar(name).trim();
    return raw.length > 0 ? raw : (FALLBACK[name] ?? '0 0 0');
  };
  const c = (name: string, alpha = 1): string => tripletToRgba(token(name), alpha);
  return {
    road: c('--surface-1'),
    shoulder: c('--canvas'),
    line: c('--line', 0.14),
    player: c('--accent'),
    playerTrim: c('--accent-ink', 0.85),
    traffic: c('--ink-3'),
    coin: c('--warning'),
    coinTrim: c('--warning', 0.35),
  };
}

/**
 * Canvas DPR cap — the §40 / todo-11 policy (1.5 on phones, 2 on desktop):
 * pixel count is the dominant cost of a full-screen canvas and DPR-3 phones
 * would otherwise render ~4× the desktop workload.
 */
export function dprCap(devicePixelRatio: number, width: number): number {
  const dpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  return Math.min(dpr, width <= 430 ? 1.5 : 2);
}

/** localStorage best-score parse — garbage and negatives become 0. */
export function loadBest(raw: string | null): number {
  if (raw === null) return 0;
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Group thousands with thin spaces, no locale dependency (deterministic). */
export function formatScore(value: number): string {
  const n = Math.max(0, Math.floor(value));
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Seeded run: `?seed=N` wins, else wall-clock — the one place time enters. */
export function seedFromSearch(search: string, now: number): number {
  const raw = new URLSearchParams(search).get('seed');
  if (raw === null) return now >>> 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n >>> 0 : now >>> 0;
}

/* ── lane mode & world geometry helpers (modes 3 to 8 lanes) ── */

export const LANE_MIN = 3;
export const LANE_MAX = 8;
export const LANE_WIDTH = 90;
export const SHOULDER = 45;
export const WORLD_H = 640;

/** Clamp lane count to the supported mode range `[3, 8]`. */
export function clampLanes(count: number): number {
  const n = Math.floor(Number(count));
  if (!Number.isFinite(n) || n < LANE_MIN) return LANE_MIN;
  if (n > LANE_MAX) return LANE_MAX;
  return n;
}

export interface WorldMetrics {
  laneCount: number;
  lanes: number[];
  roadWidth: number;
  worldWidth: number;
  worldHeight: number;
  roadX: number;
}

/** Compute road width, world width, and individual lane centres for N lanes. */
export function computeWorldMetrics(laneCount: number): WorldMetrics {
  const count = clampLanes(laneCount);
  const roadWidth = count * LANE_WIDTH;
  const worldWidth = roadWidth + SHOULDER * 2;
  const lanes = Array.from({ length: count }, (_, i) => SHOULDER + (i + 0.5) * LANE_WIDTH);
  return {
    laneCount: count,
    lanes,
    roadWidth,
    worldWidth,
    worldHeight: WORLD_H,
    roadX: SHOULDER,
  };
}

/** Map a pointer/click X coordinate in world units to the nearest lane index `[0, laneCount - 1]`. */
export function laneFromWorldX(worldX: number, laneCount: number): number {
  const count = clampLanes(laneCount);
  const rel = worldX - SHOULDER;
  const idx = Math.floor(rel / LANE_WIDTH);
  return Math.min(Math.max(idx, 0), count - 1);
}

export interface FittedWorld {
  metrics: WorldMetrics;
  scale: number;
}

/**
 * Fit the lane world to a container without letterboxing. Uses a "contain"
 * scale so the road is never cut and vertical reaction room never shrinks
 * below `WORLD_H`, then extends the world on whichever axis has leftover
 * space: extra width becomes symmetric shoulder/scenery, extra height extends
 * the road. Keeps lane centres centred on the road so phones of any aspect
 * ratio fill edge-to-edge.
 */
export function fitWorld(laneCount: number, cssW: number, cssH: number): FittedWorld {
  const base = computeWorldMetrics(laneCount);
  if (!(cssW > 0) || !(cssH > 0)) return { metrics: base, scale: 1 };
  const scale = Math.min(cssW / base.worldWidth, cssH / base.worldHeight);
  const worldWidth = cssW / scale;
  const worldHeight = cssH / scale;
  const roadX = (worldWidth - base.roadWidth) / 2;
  const lanes = Array.from({ length: base.laneCount }, (_, i) => roadX + (i + 0.5) * LANE_WIDTH);
  return {
    metrics: { ...base, lanes, worldWidth, worldHeight, roadX },
    scale,
  };
}

/** Read `?lanes=N` from query string with fallback to 3. */
export function lanesFromSearch(search: string, fallback = 3): number {
  const raw = new URLSearchParams(search).get('lanes');
  if (raw === null) return clampLanes(fallback);
  const n = Number(raw);
  return Number.isFinite(n) ? clampLanes(n) : clampLanes(fallback);
}
