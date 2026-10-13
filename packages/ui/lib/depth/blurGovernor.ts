'use client';

import { useEffect } from 'react';

type BlurRole = 'overlay' | 'chrome' | 'card' | 'panel';

const BLUR_ROLES: readonly BlurRole[] = ['overlay', 'chrome', 'card', 'panel'] as const;

const ROLE_PRIORITY: Record<BlurRole, number> = {
  overlay: 4,
  chrome: 3,
  card: 2,
  panel: 1,
};

function getBlurRole(el: HTMLElement): BlurRole | null {
  for (const role of BLUR_ROLES) {
    if (el.classList.contains(`mat-${role}`)) return role;
  }
  return null;
}

/**
 * Blur budget governor (DESIGN.md §A.4).
 *
 * The active skin decides which roles may blur; the governor turns blur OFF
 * for off-screen / over-budget surfaces (and re-enables it for the highest
 * priority in-view ones) by toggling `data-blur` on `.mat-*` nodes.
 *
 * Performance: role-blur state is read from computed CSS only when the skin,
 * theme or fidelity actually changes (`rolesDirty`), and each scan queries
 * only the roles that currently blur. The old implementation read
 * `getComputedStyle(root)` AND queried every `.mat-*` node on every scroll
 * frame, forcing a synchronous style/layout pass per frame (visible jank).
 */
export function startBlurGovernor(): () => void {
  if (typeof window === 'undefined') return () => {};

  let rAFId: number | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let active = true;

  const roleBlurs: Record<BlurRole, boolean> = {
    overlay: false,
    chrome: false,
    card: false,
    panel: false,
  };
  let activeSelector = '';
  let rolesDirty = true;

  function readRoleBlurs() {
    const rootStyle = getComputedStyle(document.documentElement);
    const activeRoles: BlurRole[] = [];
    for (const role of BLUR_ROLES) {
      const backdrop = rootStyle.getPropertyValue(`--m-${role}-backdrop`).trim();
      const blurs = !!backdrop && backdrop !== 'none';
      roleBlurs[role] = blurs;
      if (blurs) activeRoles.push(role);
    }
    activeSelector = activeRoles.map((r) => `.mat-${r}`).join(', ');
    rolesDirty = false;

    // Drop flags that are now invalid (role stopped blurring / node changed
    // role) so a skin swap can never leave a stale opaque paint behind.
    for (const el of document.querySelectorAll<HTMLElement>('[data-blur]')) {
      const role = getBlurRole(el);
      if (!role || !roleBlurs[role]) el.removeAttribute('data-blur');
    }
  }

  function scheduleScan() {
    if (!active) return;
    if (rAFId !== null) return;
    rAFId = requestAnimationFrame(() => {
      rAFId = null;
      if (!active) return;
      scan();
    });
  }

  function scheduleDebouncedScan() {
    if (!active) return;
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      scheduleScan();
    }, 150);
  }

  function invalidateRoles() {
    rolesDirty = true;
    scheduleScan();
  }

  function setBlurAttr(el: HTMLElement, val: 'off' | null) {
    const current = el.getAttribute('data-blur');
    if (val === null) {
      if (current !== null) el.removeAttribute('data-blur');
    } else {
      if (current !== val) el.setAttribute('data-blur', val);
    }
  }

  function scan() {
    if (!active) return;
    if (rolesDirty) readRoleBlurs();
    // Nothing in the active skin blurs → no work to do.
    if (!activeSelector) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const cap = w <= 430 ? 2 : w < 1024 ? 3 : 4;

    const elements = Array.from(document.querySelectorAll<HTMLElement>(activeSelector));

    interface Candidate {
      el: HTMLElement;
      role: BlurRole;
      domIndex: number;
    }

    const viableCandidates: Candidate[] = [];

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      // 1. Skip data-slab elements (owned by slab engine)
      if (el.hasAttribute('data-slab')) {
        continue;
      }

      const role = getBlurRole(el);
      if (!role) continue;

      // 2. Viewport intersection
      const rect = el.getBoundingClientRect();
      const inView =
        rect.bottom > 0 &&
        rect.top < h &&
        rect.right > 0 &&
        rect.left < w &&
        rect.width > 0 &&
        rect.height > 0;

      if (!inView) {
        setBlurAttr(el, 'off');
        continue;
      }

      viableCandidates.push({ el, role, domIndex: i });
    }

    // Sort by priority (higher priority first; ties break by earlier DOM index)
    viableCandidates.sort((a, b) => {
      const priDiff = ROLE_PRIORITY[b.role] - ROLE_PRIORITY[a.role];
      if (priDiff !== 0) return priDiff;
      return a.domIndex - b.domIndex;
    });

    const kept = new Set<HTMLElement>();

    for (const cand of viableCandidates) {
      if (kept.size >= cap) {
        setBlurAttr(cand.el, 'off');
        continue;
      }

      // 3. No blur nested in blur: check if any ancestor already keeps blur
      let hasBlurAncestor = false;
      let parent = cand.el.parentElement;
      while (parent && parent !== document.body && parent !== document.documentElement) {
        if (kept.has(parent)) {
          hasBlurAncestor = true;
          break;
        }
        parent = parent.parentElement;
      }

      if (hasBlurAncestor) {
        setBlurAttr(cand.el, 'off');
      } else {
        kept.add(cand.el);
        setBlurAttr(cand.el, null);
      }
    }
  }

  // Initial scan
  scheduleScan();

  // Listeners. Resize/scroll only need a rescan; skin/theme/fidelity changes
  // also invalidate the cached role-blur map.
  window.addEventListener('resize', scheduleScan, { passive: true });
  window.addEventListener('scroll', scheduleScan, { capture: true, passive: true });

  const rootObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (
        m.attributeName === 'data-skin' ||
        m.attributeName === 'data-fidelity' ||
        m.attributeName === 'data-theme'
      ) {
        invalidateRoles();
        break;
      }
    }
  });
  rootObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-skin', 'data-fidelity', 'data-theme'],
  });

  const bodyObserver = new MutationObserver(() => {
    scheduleDebouncedScan();
  });
  bodyObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    active = false;
    if (rAFId !== null) cancelAnimationFrame(rAFId);
    if (debounceTimer !== null) clearTimeout(debounceTimer);

    window.removeEventListener('resize', scheduleScan);
    window.removeEventListener('scroll', scheduleScan, { capture: true });
    rootObserver.disconnect();
    bodyObserver.disconnect();

    // Clean up any data-blur attributes
    const blurred = document.querySelectorAll<HTMLElement>('[data-blur]');
    for (const el of blurred) {
      el.removeAttribute('data-blur');
    }
  };
}

export function BlurGovernor() {
  useEffect(() => {
    return startBlurGovernor();
  }, []);
  return null;
}
