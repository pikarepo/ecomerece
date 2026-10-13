/** @jsxImportSource react */

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/cn';

export interface PopoutPanelProps {
  /** When true, opens a real browser popup window and portals children into it. */
  open: boolean;
  title?: string;
  children?: ReactNode;
  onClose?: () => void;
  width?: number;
  height?: number;
  /** Rendered in place when popups are blocked (or before the window exists). */
  fallback?: ReactNode;
  className?: string;
}

/**
 * Renders its children into a separate browser window (Every Layout "Pop-out
 * window"). Uses `window.open` + a React portal. If the popup is blocked,
 * `fallback` is rendered inline instead.
 */
export function PopoutPanel({
  open,
  title = 'Popout',
  children,
  onClose,
  width = 480,
  height = 360,
  fallback = null,
  className,
}: PopoutPanelProps) {
  const [win, setWin] = useState<Window | null>(null);
  const [blocked, setBlocked] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      setWin(null);
      setBlocked(false);
      return;
    }
    const popup = window.open('', title, `popup=yes,width=${width},height=${height},noopener=no`);
    if (!popup) {
      setBlocked(true);
      return;
    }
    popup.document.title = title;
    // Mirror theme attributes + stylesheets so the popout is painted by the
    // active skin rather than appearing unstyled.
    const root = popup.document.documentElement;
    for (const attr of ['data-skin', 'data-theme', 'data-accent', 'data-fidelity'] as const) {
      const value = document.documentElement.getAttribute(attr);
      if (value !== null) root.setAttribute(attr, value);
    }
    for (const sheet of document.querySelectorAll('link[rel="stylesheet"]')) {
      const href = (sheet as HTMLLinkElement).href;
      if (!href) continue;
      const link = popup.document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      popup.document.head.appendChild(link);
    }
    setWin(popup);

    const poll = setInterval(() => {
      if (popup.closed) {
        setWin(null);
        onCloseRef.current?.();
      }
    }, 400);

    return () => {
      clearInterval(poll);
      popup.close();
    };
  }, [open, title, width, height]);

  if (blocked) return <>{fallback}</>;
  if (!win) return null;

  return createPortal(
    <div className={cn('mat-ground min-h-screen p-4 text-ink', className)}>{children}</div>,
    win.document.body,
  );
}
