import { useCallback, useEffect, useRef, useState } from 'react';

/** Boolean state with a stable toggle and explicit setter. */
export function useToggle(initial = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

/** Returns the value from the previous render. */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * setInterval with a declarative delay. Pass `null` to pause.
 * The latest callback is always invoked (no stale closure).
 */
export function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

/**
 * setTimeout with a declarative delay. Pass `null` to cancel.
 * The latest callback is always invoked (no stale closure).
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay === null) return;
    const id = setTimeout(() => saved.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
}

/**
 * Calls `handler` when a pointerdown/keydown occurs outside `ref`.
 * Disabled when `enabled` is false.
 */
export function useClickAway<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: (event: MouseEvent | TouchEvent | KeyboardEvent) => void,
  enabled = true,
) {
  const saved = useRef(handler);
  useEffect(() => {
    saved.current = handler;
  }, [handler]);
  useEffect(() => {
    if (!enabled) return;
    const onDown = (event: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) saved.current(event);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') saved.current(event);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [enabled, ref]);
}
