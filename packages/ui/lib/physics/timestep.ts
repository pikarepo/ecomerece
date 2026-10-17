/**
 * Fixed-timestep clock — todo/12 (§44).
 *
 * Simulation advances in whole `FIXED_DT` steps regardless of frame rate:
 * `distance = Σ v·dt` over fixed steps is identical on a 30 Hz phone and a
 * 144 Hz desktop, and a recorded seed + input stream replays exactly. The
 * render loop interpolates between the last two sim states for smoothness;
 * the sim itself never sees a variable dt.
 */

/** One simulation step — 60 Hz. All laws assume this unless told otherwise. */
export const FIXED_DT = 1 / 60;

/**
 * Frame-dt clamp. A background tab or hitch can report seconds of elapsed
 * time; integrating that would teleport entities. Beyond the clamp the time
 * is dropped, not queued (a paused tab must not fast-forward the sim).
 */
export const MAX_FRAME_DT = 0.25;

/**
 * Steps-per-frame cap. If the sim ever falls behind by more than this many
 * steps it is shedding load, not catching up — the backlog is discarded so a
 * slow machine degrades to slow-motion instead of a spiral of death.
 */
export const MAX_STEPS_PER_FRAME = 8;

export interface StepResult {
  /** Whole fixed steps to run this frame (`0 … MAX_STEPS_PER_FRAME`). */
  readonly steps: number;
  /** Leftover sub-step time carried to the next frame. */
  readonly accumulator: number;
}

/**
 * Feed one rendered frame's elapsed time, get back how many fixed steps to
 * run. Pure — the caller owns the accumulator value.
 *
 * ```ts
 * let acc = 0;
 * const { steps, accumulator } = accumulate(acc, frameDt);
 * acc = accumulator;
 * for (let i = 0; i < steps; i++) sim.tick(FIXED_DT);
 * ```
 */
export function accumulate(accumulator: number, frameDt: number): StepResult {
  const dt = Number.isFinite(frameDt) && frameDt > 0 ? Math.min(frameDt, MAX_FRAME_DT) : 0;
  let acc = accumulator + dt;
  let steps = 0;
  while (acc >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
    acc -= FIXED_DT;
    steps++;
  }
  if (steps === MAX_STEPS_PER_FRAME && acc >= FIXED_DT) acc = 0;
  return { steps, accumulator: acc };
}

/**
 * Render interpolation alpha in `[0, 1)` — how far the display sits between
 * the previous and the next sim state. Feed it to the renderer so motion is
 * smooth between fixed steps.
 */
export function interpolationAlpha(accumulator: number): number {
  return Math.min(Math.max(accumulator / FIXED_DT, 0), 1);
}
