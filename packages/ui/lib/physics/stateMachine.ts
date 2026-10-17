/**
 * Game state machine — todo/12 (§49).
 *
 * A minimal guarded FSM: states are strings, events drive transitions, and an
 * illegal event is a no-op (`send` returns `false`) so a stray keypress can
 * never corrupt the run. The canonical dodger wiring (`menu → playing →
 * paused → game-over`) is provided as `createGameFsm`; any other game can use
 * `createFsm` with its own table.
 */

export type TransitionMap<S extends string, E extends string> = Readonly<
  Record<S, Readonly<Partial<Record<E, S>>>>
>;

export interface Fsm<S extends string, E extends string> {
  readonly state: S;
  can(event: E): boolean;
  /** Attempt a transition. Returns `true` when the state changed. */
  send(event: E): boolean;
  /** Subscribe to state changes; returns an unsubscribe function. */
  onChange(listener: (state: S, previous: S) => void): () => void;
}

export function createFsm<S extends string, E extends string>(
  initial: S,
  transitions: TransitionMap<S, E>,
): Fsm<S, E> {
  let state = initial;
  const listeners = new Set<(state: S, previous: S) => void>();
  return {
    get state() {
      return state;
    },
    can(event: E) {
      return transitions[state]?.[event] !== undefined;
    },
    send(event: E) {
      const next = transitions[state]?.[event];
      if (next === undefined || next === state) return false;
      const previous = state;
      state = next;
      for (const listener of listeners) listener(state, previous);
      return true;
    },
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** Canonical dodger states. */
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export type GameEvent = 'START' | 'PAUSE' | 'RESUME' | 'CRASH' | 'RETRY' | 'QUIT';

const GAME_TRANSITIONS: TransitionMap<GameState, GameEvent> = {
  menu: { START: 'playing' },
  playing: { PAUSE: 'paused', CRASH: 'gameover' },
  paused: { RESUME: 'playing', QUIT: 'menu' },
  gameover: { RETRY: 'playing', QUIT: 'menu' },
};

/** The menu → playing → paused → game-over loop, pre-wired. */
export function createGameFsm(initial: GameState = 'menu'): Fsm<GameState, GameEvent> {
  return createFsm(initial, GAME_TRANSITIONS);
}
