import { useEffect, useRef } from 'react';

export interface UseOverlayOptions {
  open: boolean;
  onClose: () => void;
  /**
   * Trap focus within the overlay and restore focus to the trigger on close.
   * Enabled by default for modals/sheets/panels.
   */
  trapFocus?: boolean;
}

/**
 * Shared overlay behaviour: body scroll lock, Escape-to-close, optional focus trap.
 * Per DESIGN.md §21.9 — Escape closes, backdrop click closes, focus traps and
 * returns to the trigger.
 */
export function useOverlay({ open, onClose, trapFocus = true }: UseOverlayOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Escape to close. Guarded for reduced-motion is handled by CSS.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Remember the trigger so focus can be restored on close.
  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  // Trap focus inside the container.
  useEffect(() => {
    if (!open || !trapFocus) return;
    const container = containerRef.current;
    if (!container) return;

    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      'summary',
    ].join(',');

    const handleFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((el) => el.offsetParent !== null);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      // If focus somehow escaped the container, pull it back to the first item.
      if (!active || !container.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleFocus);
    // Move focus into the overlay on open.
    const frame = requestAnimationFrame(() => {
      const first = container.querySelector<HTMLElement>(focusableSelector);
      first?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', handleFocus);
    };
  }, [open, trapFocus]);

  return { containerRef };
}

export type { UseOverlayOptions as OverlayOptions };
