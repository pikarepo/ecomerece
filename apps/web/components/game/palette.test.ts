import { describe, expect, test } from 'bun:test';
import {
  clampLanes,
  computeWorldMetrics,
  dprCap,
  fitWorld,
  formatScore,
  laneFromWorldX,
  lanesFromSearch,
  loadBest,
  parseTriplet,
  readGamePalette,
  seedFromSearch,
  tripletToRgba,
} from './palette';

describe('palette helpers (Lane Runner)', () => {
  test('parseTriplet accepts rgb triplets and rejects garbage', () => {
    expect(parseTriplet('37 99 235')).toEqual([37, 99, 235]);
    expect(parseTriplet(' 255 255 255 ')).toEqual([255, 255, 255]);
    expect(parseTriplet('37 99')).toBeNull();
    expect(parseTriplet('37 99 999')).toBeNull();
    expect(parseTriplet('a b c')).toBeNull();
    expect(parseTriplet('')).toBeNull();
  });

  test('tripletToRgba renders canvas colour strings with optional alpha', () => {
    expect(tripletToRgba('37 99 235')).toBe('rgb(37 99 235)');
    expect(tripletToRgba('37 99 235', 0.14)).toBe('rgb(37 99 235 / 0.14)');
    // malformed input falls back to the canvas token, never throws
    expect(tripletToRgba('garbage')).toBe('rgb(11 15 23)');
  });

  test('readGamePalette reads tokens with injected fallbacks', () => {
    const vars: Record<string, string> = {
      '--surface-1': '19 26 38',
      '--accent': '37 99 235',
      '--warning': '180 83 9',
    };
    const p = readGamePalette((n) => vars[n] ?? '');
    expect(p.road).toBe('rgb(19 26 38)');
    expect(p.player).toBe('rgb(37 99 235)');
    expect(p.coin).toBe('rgb(180 83 9)');
    // tokens absent from the fake still resolve via the built-in fallbacks
    expect(p.shoulder).toBe('rgb(11 15 23)');
    expect(p.line).toBe('rgb(255 255 255 / 0.14)');
  });

  test('dprCap mirrors the §40 small-device policy', () => {
    expect(dprCap(3, 390)).toBe(1.5);
    expect(dprCap(3, 1440)).toBe(2);
    expect(dprCap(1, 390)).toBe(1);
    expect(dprCap(0, 1440)).toBe(1);
    expect(dprCap(Number.NaN, 390)).toBe(1);
  });

  test('loadBest survives localStorage garbage', () => {
    expect(loadBest(null)).toBe(0);
    expect(loadBest('1200')).toBe(1200);
    expect(loadBest('1200.9')).toBe(1200);
    expect(loadBest('-5')).toBe(0);
    expect(loadBest('NaN')).toBe(0);
    expect(loadBest('')).toBe(0);
  });

  test('formatScore groups thousands deterministically', () => {
    expect(formatScore(0)).toBe('0');
    expect(formatScore(999)).toBe('999');
    expect(formatScore(1000)).toBe('1 000');
    expect(formatScore(1234567.9)).toBe('1 234 567');
    expect(formatScore(-10)).toBe('0');
  });

  test('seedFromSearch: ?seed wins, wall-clock otherwise', () => {
    expect(seedFromSearch('?seed=42', 999999)).toBe(42);
    expect(seedFromSearch('?seed=0', 999999)).toBe(0);
    expect(seedFromSearch('?seed=abc', 1234)).toBe(1234);
    expect(seedFromSearch('', 1234)).toBe(1234);
    expect(seedFromSearch('?seed=4294967296', 1)).toBe(0); // >>> 0 wrap
  });

  test('clampLanes bounds lanes strictly to [3, 8]', () => {
    expect(clampLanes(1)).toBe(3);
    expect(clampLanes(2)).toBe(3);
    expect(clampLanes(3)).toBe(3);
    expect(clampLanes(5)).toBe(5);
    expect(clampLanes(8)).toBe(8);
    expect(clampLanes(10)).toBe(8);
    expect(clampLanes(Number.NaN)).toBe(3);
  });

  test('computeWorldMetrics scales world width and lane positions across 3 to 8 lanes', () => {
    // 3 lanes (original baseline)
    const m3 = computeWorldMetrics(3);
    expect(m3.laneCount).toBe(3);
    expect(m3.worldWidth).toBe(360);
    expect(m3.roadWidth).toBe(270);
    expect(m3.lanes).toEqual([90, 180, 270]);

    // 5 lanes
    const m5 = computeWorldMetrics(5);
    expect(m5.laneCount).toBe(5);
    expect(m5.worldWidth).toBe(540);
    expect(m5.lanes).toEqual([90, 180, 270, 360, 450]);

    // 8 lanes
    const m8 = computeWorldMetrics(8);
    expect(m8.laneCount).toBe(8);
    expect(m8.worldWidth).toBe(810);
    expect(m8.lanes).toEqual([90, 180, 270, 360, 450, 540, 630, 720]);
  });

  test('laneFromWorldX maps pointer coordinates to nearest lane', () => {
    // 3 lanes: lanes are at 90 (0-90-135), 180 (135-225), 270 (225-315)
    expect(laneFromWorldX(50, 3)).toBe(0);
    expect(laneFromWorldX(90, 3)).toBe(0);
    expect(laneFromWorldX(150, 3)).toBe(1);
    expect(laneFromWorldX(280, 3)).toBe(2);
    expect(laneFromWorldX(1000, 3)).toBe(2);
    expect(laneFromWorldX(-50, 3)).toBe(0);
  });

  test('lanesFromSearch reads ?lanes parameter with fallback', () => {
    expect(lanesFromSearch('?lanes=4')).toBe(4);
    expect(lanesFromSearch('?lanes=7')).toBe(7);
    expect(lanesFromSearch('?lanes=12')).toBe(8);
    expect(lanesFromSearch('?lanes=1')).toBe(3);
    expect(lanesFromSearch('', 5)).toBe(5);
    expect(lanesFromSearch('?lanes=invalid', 6)).toBe(6);
  });

  test('fitWorld fills the container without letterboxing', () => {
    // Portrait phone: taller than the base world -> extra height, not width.
    const portrait = fitWorld(3, 360, 640);
    expect(portrait.metrics.worldWidth * portrait.scale).toBeCloseTo(360);
    expect(portrait.metrics.worldHeight * portrait.scale).toBeCloseTo(640);
    expect(portrait.metrics.roadX).toBeCloseTo(45); // width was the constraining axis

    // Wide landscape: width is extended, height pinned to the base world.
    const landscape = fitWorld(3, 1200, 400);
    expect(landscape.metrics.worldWidth * landscape.scale).toBeCloseTo(1200);
    expect(landscape.metrics.worldHeight * landscape.scale).toBeCloseTo(400);
    expect(landscape.metrics.worldHeight).toBeCloseTo(640);
    expect(landscape.metrics.roadX).toBeGreaterThan(45);
    // Road stays centred and lanes stay evenly spaced.
    const lanes = landscape.metrics.lanes;
    expect(lanes[1] - lanes[0]).toBeCloseTo(90);
    const mid = (lanes[0] + lanes[lanes.length - 1]) / 2;
    expect(mid).toBeCloseTo(landscape.metrics.roadX + landscape.metrics.roadWidth / 2);
  });

  test('fitWorld clamps degenerate containers to a usable scale', () => {
    const zero = fitWorld(3, 0, 0);
    expect(zero.scale).toBe(1);
    expect(zero.metrics.worldWidth).toBe(360);
  });
});
