/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import {
  AnnouncementBanner,
  CookieConsentBanner,
  type CookiePreferences,
  formatCountdown,
  GdprConsentModal,
  PromoBanner,
  PromptModal,
  SessionTimeoutWarning,
} from '../components/feedback/SystemBanners';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

function openDialog(): HTMLElement | null {
  return document.querySelector('[role="dialog"][data-open="true"]');
}

function buttonByText(root: ParentNode, label: string): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll('button')).find((b) => b.textContent === label);
}

describe('AnnouncementBanner & PromoBanner (batch 96)', () => {
  it('announcement renders message, link and fires dismiss; hides when closed', () => {
    let dismissed = 0;
    let linkClicks = 0;
    const { container, unmount } = render(
      <AnnouncementBanner
        message="Scheduled maintenance on Sunday 02:00 UTC"
        linkHref="/status"
        linkLabel="Status page"
        onLinkClick={() => linkClicks++}
        onDismiss={() => dismissed++}
      />,
    );
    expect(container.textContent).toContain('Scheduled maintenance on Sunday 02:00 UTC');
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/status');
    expect(link.textContent).toBe('Status page');
    act(() => link.click());
    expect(linkClicks).toBe(1);

    const x = container.querySelector('[aria-label="Dismiss"]') as HTMLButtonElement;
    act(() => x.click());
    expect(dismissed).toBe(1);

    const closed = render(<AnnouncementBanner open={false} message="Hidden" />);
    expect(closed.container.textContent ?? '').not.toContain('Hidden');
    closed.unmount();
    unmount();
  });

  it('promo renders badge/description and fires CTA, secondary and dismiss', () => {
    const calls: string[] = [];
    const { container, unmount } = render(
      <PromoBanner
        title="Spring sale — 20% off"
        description="Ends Sunday. Code applied at checkout."
        badge={<span data-testid="badge">Limited time</span>}
        ctaLabel="Shop now"
        onCta={() => calls.push('cta')}
        secondaryLabel="Remind me"
        onSecondary={() => calls.push('secondary')}
        onDismiss={() => calls.push('dismiss')}
      />,
    );
    expect(container.textContent).toContain('Spring sale — 20% off');
    expect(container.textContent).toContain('Limited time');
    expect(container.textContent).toContain('Ends Sunday.');

    act(() => (buttonByText(container, 'Shop now') as HTMLButtonElement).click());
    act(() => (buttonByText(container, 'Remind me') as HTMLButtonElement).click());
    act(() => (container.querySelector('[aria-label="Dismiss"]') as HTMLButtonElement).click());
    expect(calls).toEqual(['cta', 'secondary', 'dismiss']);
    unmount();
  });
});

describe('CookieConsentBanner (batch 96)', () => {
  it('shows copy + policy link and fires accept/reject in the decide step', () => {
    const calls: string[] = [];
    const { container, unmount } = render(
      <CookieConsentBanner
        policyHref="/cookies"
        onAcceptAll={() => calls.push('accept')}
        onReject={() => calls.push('reject')}
      />,
    );
    expect(container.textContent).toContain('We value your privacy');
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/cookies');
    expect(container.firstElementChild?.className).toContain('fixed');
    expect(container.firstElementChild?.className).toContain('z-chrome');

    act(() => (buttonByText(container, 'Accept all') as HTMLButtonElement).click());
    act(() => (buttonByText(container, 'Reject non-essential') as HTMLButtonElement).click());
    expect(calls).toEqual(['accept', 'reject']);
    unmount();
  });

  it('manage step exposes four categories (necessary locked) and saves the prefs', () => {
    const saves: CookiePreferences[] = [];
    const { container, unmount } = render(
      <CookieConsentBanner
        onSave={(prefs) => {
          saves.push(prefs);
        }}
      />,
    );
    act(() => (buttonByText(container, 'Manage preferences') as HTMLButtonElement).click());
    expect(container.textContent).toContain('Cookie preferences');
    const switches = Array.from(container.querySelectorAll('[role="switch"]'));
    expect(switches.length).toBe(4);
    const necessary = switches[0] as HTMLButtonElement;
    expect(necessary.disabled).toBe(true);
    expect(necessary.getAttribute('aria-checked')).toBe('true');

    const analytics = switches[2] as HTMLButtonElement;
    expect(analytics.getAttribute('aria-checked')).toBe('false');
    act(() => analytics.click());
    expect(analytics.getAttribute('aria-checked')).toBe('true');

    act(() => (buttonByText(container, 'Save preferences') as HTMLButtonElement).click());
    expect(saves[0]).toEqual({
      necessary: true,
      preferences: false,
      analytics: true,
      marketing: false,
    });

    // Back returns to the decide step.
    act(() => (buttonByText(container, 'Back') as HTMLButtonElement).click());
    expect(buttonByText(container, 'Accept all')).toBeTruthy();
    unmount();
  });

  it('renders nothing while closed', () => {
    const { container, unmount } = render(<CookieConsentBanner open={false} />);
    expect(container.textContent ?? '').toBe('');
    unmount();
  });
});

describe('GdprConsentModal (batch 96)', () => {
  it('lists purposes with required locked, saves selection, fires accept/reject', () => {
    const calls: unknown[] = [];
    const { unmount } = render(
      <GdprConsentModal
        open
        onClose={() => calls.push('close')}
        onAcceptAll={() => calls.push('accept')}
        onRejectAll={() => calls.push('reject')}
        onSave={(selected) => calls.push(selected)}
      >
        <p>Extra legal copy</p>
      </GdprConsentModal>,
    );
    const dialog = openDialog();
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain('Manage your privacy');
    expect(dialog?.textContent).toContain('Extra legal copy');

    const switches = Array.from(dialog?.querySelectorAll('[role="switch"]') ?? []);
    expect(switches.length).toBe(4);
    const necessary = switches[0] as HTMLButtonElement;
    expect(necessary.disabled).toBe(true);
    expect(necessary.getAttribute('aria-checked')).toBe('true');

    // Toggle analytics on; other optional purposes start off (opt-in consent).
    expect((switches[1] as HTMLButtonElement).getAttribute('aria-checked')).toBe('false');
    act(() => (switches[2] as HTMLButtonElement).click());
    expect((switches[2] as HTMLButtonElement).getAttribute('aria-checked')).toBe('true');

    act(() => (buttonByText(dialog as HTMLElement, 'Save choices') as HTMLButtonElement).click());
    act(() => (buttonByText(dialog as HTMLElement, 'Accept all') as HTMLButtonElement).click());
    act(() =>
      (buttonByText(dialog as HTMLElement, 'Reject non-essential') as HTMLButtonElement).click(),
    );

    expect(calls[0]).toEqual({
      necessary: true,
      preferences: false,
      analytics: true,
      marketing: false,
    });
    expect(calls.slice(1)).toEqual(['accept', 'reject']);
    unmount();
  });

  it('is inert (aria-hidden panel, closed backdrop) while open=false', () => {
    const { unmount } = render(<GdprConsentModal open={false} onClose={() => {}} />);
    const panel = document.querySelector('[role="dialog"]');
    expect(panel?.getAttribute('aria-hidden')).toBe('true');
    const backdrop = document.querySelector('[role="presentation"][data-open]');
    expect(backdrop?.getAttribute('data-open')).toBe('false');
    unmount();
  });
});

describe('PromptModal (batch 96)', () => {
  it('renders per-kind defaults for install, update and permission', () => {
    const seen: string[] = [];
    const cases: Array<{
      kind: 'install' | 'update' | 'permission';
      title: string;
      confirm: string;
    }> = [
      { kind: 'install', title: 'Install the app', confirm: 'Install' },
      { kind: 'update', title: 'Update available', confirm: 'Update now' },
      { kind: 'permission', title: 'Enable notifications', confirm: 'Allow' },
    ];
    for (const c of cases) {
      const { unmount } = render(
        <PromptModal kind={c.kind} open onClose={() => {}} onConfirm={() => seen.push(c.kind)} />,
      );
      const dialog = openDialog() as HTMLElement;
      expect(dialog.textContent).toContain(c.title);
      const confirm = buttonByText(dialog, c.confirm) as HTMLButtonElement;
      expect(confirm).toBeTruthy();
      act(() => confirm.click());
      unmount();
    }
    expect(seen).toEqual(['install', 'update', 'permission']);
  });

  it('accepts overrides and fires cancel via button and Escape', () => {
    const calls: string[] = [];
    const { unmount } = render(
      <PromptModal
        kind="update"
        open
        title="Version 2.0 is here"
        description="Custom rationale."
        confirmLabel="Reload"
        cancelLabel="Dismiss"
        onClose={() => calls.push('close')}
        onConfirm={() => calls.push('confirm')}
      />,
    );
    const dialog = openDialog() as HTMLElement;
    expect(dialog.textContent).toContain('Version 2.0 is here');
    expect(dialog.textContent).toContain('Custom rationale.');

    act(() => (buttonByText(dialog, 'Reload') as HTMLButtonElement).click());
    act(() => (buttonByText(dialog, 'Dismiss') as HTMLButtonElement).click());
    act(() => fire(document, 'keydown', { key: 'Escape' }));
    expect(calls).toEqual(['confirm', 'close', 'close']);
    unmount();
  });
});

describe('SessionTimeoutWarning (batch 96)', () => {
  it('renders the countdown, fires stay/sign-out, Escape stays (never signs out)', () => {
    const calls: string[] = [];
    const { unmount } = render(
      <SessionTimeoutWarning
        open
        secondsLeft={90}
        onStay={() => calls.push('stay')}
        onSignOut={() => calls.push('signout')}
      />,
    );
    const dialog = openDialog() as HTMLElement;
    expect(dialog.textContent).toContain('1:30');
    expect(dialog.querySelector('[data-urgent="false"]')).not.toBeNull();

    act(() => (buttonByText(dialog, 'Stay signed in') as HTMLButtonElement).click());
    act(() => (buttonByText(dialog, 'Sign out now') as HTMLButtonElement).click());
    act(() => fire(document, 'keydown', { key: 'Escape' }));
    expect(calls).toEqual(['stay', 'signout', 'stay']);
    unmount();
  });

  it('marks urgent (≤10s), uses a danger sign-out and supports a custom format', () => {
    const { unmount } = render(
      <SessionTimeoutWarning
        open
        secondsLeft={7}
        format={(s) => `${s} seconds`}
        onStay={() => {}}
        onSignOut={() => {}}
      />,
    );
    const dialog = openDialog() as HTMLElement;
    expect(dialog.textContent).toContain('7 seconds');
    expect(dialog.querySelector('[data-urgent="true"]')).not.toBeNull();
    expect(dialog.textContent).toContain('Sign out now');
    unmount();
  });

  it('omits sign-out when no handler is given', () => {
    const { unmount } = render(<SessionTimeoutWarning open secondsLeft={30} onStay={() => {}} />);
    expect(buttonByText(openDialog() as HTMLElement, 'Sign out now')).toBeUndefined();
    unmount();
  });

  it('formatCountdown renders s below a minute and m:ss above', () => {
    expect(formatCountdown(0)).toBe('0s');
    expect(formatCountdown(45)).toBe('45s');
    expect(formatCountdown(59)).toBe('59s');
    expect(formatCountdown(90)).toBe('1:30');
    expect(formatCountdown(600)).toBe('10:00');
    expect(formatCountdown(-5)).toBe('0s');
  });
});
