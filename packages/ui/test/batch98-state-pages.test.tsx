/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import {
  ERROR_PAGE_COPY,
  ErrorPage,
  ExpiredLinkPage,
  OfflineState,
  type StatePageErrorCode,
  ThankYouPage,
  UnderConstructionPage,
  VerificationPendingPage,
} from '../components/feedback/StatePages';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

function buttonByText(root: ParentNode, label: string): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll('button')).find((b) => b.textContent === label);
}

function anchor(root: ParentNode): HTMLAnchorElement | null {
  return root.querySelector('a');
}

describe('ErrorPage (batch 98)', () => {
  it('renders the oversized code, label eyebrow and stock copy for all five statuses', () => {
    const codes = [400, 403, 404, 500, 503] as const;
    for (const code of codes) {
      const { container, unmount } = render(<ErrorPage code={code} />);
      const root = container.firstElementChild as HTMLElement;
      expect(root.textContent).toContain(String(code));
      expect(root.textContent).toContain(ERROR_PAGE_COPY[code].label);
      expect(root.textContent).toContain(ERROR_PAGE_COPY[code].title);
      expect(root.textContent).toContain(ERROR_PAGE_COPY[code].description);
      expect(root.querySelector('svg')).not.toBeNull();
      unmount();
    }
  });

  it('maps tones: 500 danger circle, 403/500... warning/neutral per copy', () => {
    const danger = render(<ErrorPage code={500} />);
    expect(
      (danger.container.firstElementChild as HTMLElement).querySelector('.bg-danger\\/10'),
    ).not.toBeNull();
    danger.unmount();

    const warn = render(<ErrorPage code={403} />);
    expect(
      (warn.container.firstElementChild as HTMLElement).querySelector('.bg-warning\\/10'),
    ).not.toBeNull();
    warn.unmount();

    const neutral = render(<ErrorPage code={404} />);
    expect(
      (neutral.container.firstElementChild as HTMLElement).querySelector('.bg-surface-3'),
    ).not.toBeNull();
    neutral.unmount();
  });

  it('honours overrides, retry, custom actions and the details box', () => {
    let retries = 0;
    const { container, unmount } = render(
      <ErrorPage
        code={500}
        title="Custom broke title"
        description="Custom explanation."
        onRetry={() => retries++}
        details="req_8f21 · 2026-10-16T09:14Z"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toContain('Custom broke title');
    expect(root.textContent).toContain('Custom explanation.');
    expect(root.textContent).toContain('req_8f21 · 2026-10-16T09:14Z');

    const retry = buttonByText(root, 'Try again') as HTMLButtonElement;
    act(() => retry.click());
    expect(retries).toBe(1);
    unmount();

    const custom = render(
      <ErrorPage
        code={403}
        primaryAction={<button type="button">Sign in as admin</button>}
        secondaryAction={<button type="button">Request access</button>}
      />,
    );
    const root2 = custom.container.firstElementChild as HTMLElement;
    expect(buttonByText(root2, 'Sign in as admin')).toBeTruthy();
    expect(buttonByText(root2, 'Request access')).toBeTruthy();
    expect(buttonByText(root2, 'Try again')).toBeUndefined();
    custom.unmount();
  });

  it('ERROR_PAGE_COPY covers every supported code with label/title/description/tone/icon', () => {
    const keys = Object.keys(ERROR_PAGE_COPY);
    expect(keys.sort()).toEqual(['400', '403', '404', '500', '503']);
    for (const key of keys) {
      const entry = ERROR_PAGE_COPY[Number(key) as StatePageErrorCode];
      expect(entry.label.length).toBeGreaterThan(0);
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.description.length).toBeGreaterThan(0);
      expect(['neutral', 'success', 'warning', 'danger']).toContain(entry.tone);
      // lucide icons are memo-wrapped forwardRef components (objects), plain
      // function components would be functions — both must be renderable,
      // which the per-code render loop above already proves.
      expect(['function', 'object']).toContain(typeof entry.icon);
      expect(entry.icon).toBeTruthy();
    }
  });
});

describe('OfflineState (batch 98)', () => {
  it('shows offline copy, status and fires retry', () => {
    let retries = 0;
    const { container, unmount } = render(
      <OfflineState onRetry={() => retries++} status="Last synced 2 minutes ago" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toContain("You're offline");
    expect(root.textContent).toContain('Last synced 2 minutes ago');
    expect(root.querySelector('.bg-warning\\/10')).not.toBeNull();

    const retry = buttonByText(root, 'Try again') as HTMLButtonElement;
    act(() => retry.click());
    expect(retries).toBe(1);
    unmount();
  });

  it('accepts overrides and an extra action', () => {
    const { container, unmount } = render(
      <OfflineState title="No connection" action={<button type="button">Work offline</button>} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toContain('No connection');
    expect(buttonByText(root, 'Work offline')).toBeTruthy();
    expect(buttonByText(root, 'Try again')).toBeUndefined();
    unmount();
  });
});

describe('UnderConstructionPage (batch 98)', () => {
  it('renders the indeterminate bar (decorative), ETA and action', () => {
    let opened = 0;
    const { container, unmount } = render(
      <UnderConstructionPage eta="ETA: Friday" action={<ButtonLike onClick={() => opened++} />} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toContain('Under construction');
    expect(root.textContent).toContain('Work in progress');
    expect(root.textContent).toContain('ETA: Friday');
    const bar = root.querySelector('[data-variant="indeterminate"]');
    expect(bar).not.toBeNull();
    // Decorative: the bar sits under an aria-hidden wrapper.
    expect(bar?.parentElement?.getAttribute('aria-hidden')).toBe('true');

    act(() => (buttonByText(root, 'Notify me') as HTMLButtonElement).click());
    expect(opened).toBe(1);
    unmount();
  });
});

function ButtonLike({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}>
      Notify me
    </button>
  );
}

describe('ExpiredLinkPage (batch 98)', () => {
  it('renders expiry note and fires resend; home link carries href', () => {
    let resends = 0;
    const { container, unmount } = render(
      <ExpiredLinkPage
        expiresAt="Expired 2026-10-16 09:00 UTC"
        onResend={() => resends++}
        homeHref="/"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toContain('This link has expired');
    expect(root.textContent).toContain('Expired 2026-10-16 09:00 UTC');

    act(() => (buttonByText(root, 'Send a new link') as HTMLButtonElement).click());
    expect(resends).toBe(1);

    const home = anchor(root) as HTMLAnchorElement;
    expect(home.getAttribute('href')).toBe('/');
    expect(home.textContent).toBe('Back to home');
    unmount();
  });
});

describe('ThankYouPage (batch 98)', () => {
  it('renders success tone, reference chip, action and home link', () => {
    const { container, unmount } = render(
      <ThankYouPage
        reference="Order #1042"
        action={<button type="button">Track order</button>}
        homeHref="/orders"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toContain('Thank you!');
    expect(root.textContent).toContain('Order #1042');
    expect(root.querySelector('.bg-success\\/10')).not.toBeNull();
    expect(buttonByText(root, 'Track order')).toBeTruthy();
    const home = anchor(root) as HTMLAnchorElement;
    expect(home.getAttribute('href')).toBe('/orders');
    unmount();
  });
});

describe('VerificationPendingPage (batch 98)', () => {
  it('describes the masked email, hints, and fires resend', () => {
    let resends = 0;
    const { container, unmount } = render(
      <VerificationPendingPage
        maskedEmail="a•••@example.com"
        hint="Didn't arrive? Check spam."
        onResend={() => resends++}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toContain('Verify your email');
    expect(root.textContent).toContain('a•••@example.com');
    expect(root.textContent).toContain("Didn't arrive? Check spam.");
    expect(root.querySelector('[data-variant="indeterminate"]')).not.toBeNull();

    act(() => (buttonByText(root, 'Resend email') as HTMLButtonElement).click());
    expect(resends).toBe(1);
    unmount();
  });

  it('falls back to generic copy without an email', () => {
    const { container, unmount } = render(<VerificationPendingPage />);
    expect(container.textContent).toContain('We sent you a verification link.');
    unmount();
  });
});
