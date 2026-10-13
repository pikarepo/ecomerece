import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders into document.body. Mounted-gated so the server HTML and the first
 * client (hydration) render both output nothing, avoiding hydration mismatches.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
