/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  AppStoreBadge,
  QrDownload,
  SignInButton,
  WalletButton,
} from '../components/controls/ProviderButtons';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 61 provider buttons', () => {
  it('SignInButton labels the provider and fires click', () => {
    let clicked = 0;
    const { container, unmount } = render(
      <SignInButton provider="github" onClick={() => clicked++} />,
    );
    const btn = container.querySelector('button') as HTMLButtonElement;
    expect(btn.textContent).toContain('Sign in with GitHub');
    expect(btn.getAttribute('data-provider')).toBe('github');
    act(() => btn.click());
    expect(clicked).toBe(1);
    unmount();
  });

  it('WalletButton renders provider label', () => {
    const { container, unmount } = render(<WalletButton provider="paypal" />);
    expect(container.querySelector('[data-wallet="paypal"]')?.textContent).toContain('PayPal');
    unmount();
  });

  it('AppStoreBadge renders a link when href is set', () => {
    const { container, unmount } = render(<AppStoreBadge store="google-play" href="/app" />);
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/app');
    expect(link.getAttribute('aria-label')).toContain('Google Play');
    unmount();
  });

  it('QrDownload renders an image for a src', () => {
    const { container, unmount } = render(
      <QrDownload src="data:image/png;base64,AAAA" label="Scan me" />,
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toContain('base64');
    expect(container.textContent).toContain('Scan me');
    unmount();
  });
});
