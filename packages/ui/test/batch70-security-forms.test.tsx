/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import { Honeypot, PasskeyPrompt, RecoveryCodes, TwoFactorSetup } from '../components/form';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 70 security forms', () => {
  it('TwoFactorSetup shows the manual-entry key grouped by 4 plus issuer/account', () => {
    const { container, unmount } = render(
      <TwoFactorSetup issuer="Acme" account="ada@example.com" secret="jbswy3dpehp3" />,
    );
    expect(container.textContent).toContain('JBSW Y3DP EHP3');
    expect(container.textContent).toContain('Acme · ada@example.com');
    expect(container.querySelector('img')).toBeNull(); // no qrSrc → manual only
    unmount();
  });

  it('TwoFactorSetup renders the QR only when qrSrc is provided', () => {
    const { container, unmount } = render(
      <TwoFactorSetup issuer="Acme" account="a@b.c" secret="ABCD" qrSrc="/qr.png" />,
    );
    expect(container.querySelector('img')?.getAttribute('src')).toBe('/qr.png');
    unmount();
  });

  it('TwoFactorSetup verify stays disabled under 6 digits and reports the code', () => {
    let heard = '';
    const { container, unmount } = render(
      <TwoFactorSetup
        issuer="Acme"
        account="a@b.c"
        secret="ABCD"
        onVerify={(code) => {
          heard = code;
        }}
      />,
    );
    const verify = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Verify'),
    ) as HTMLButtonElement;
    expect(verify.disabled).toBe(true);

    const first = container.querySelector('input') as HTMLInputElement;
    act(() => fire(first, 'focusin'));
    act(() => {
      first.value = '1';
      first.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(verify.disabled).toBe(true); // only 1 digit so far

    act(() => {
      first.value = '123456';
      first.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(verify.disabled).toBe(false);
    act(() => verify.click());
    expect(heard).toBe('123456');
    unmount();
  });

  it('TwoFactorSetup shows an alert with the error message when status=error', () => {
    const { container, unmount } = render(
      <TwoFactorSetup
        issuer="Acme"
        account="a@b.c"
        secret="ABCD"
        status="error"
        errorMessage="Wrong code"
      />,
    );
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Wrong code');
    unmount();
  });

  it('RecoveryCodes masks codes until revealed', () => {
    const { container, rerender, unmount } = render(<RecoveryCodes codes={['AAAA1111']} />);
    expect(container.textContent).toContain('••••••••');
    expect(container.textContent).not.toContain('AAAA1111');
    rerender(<RecoveryCodes codes={['AAAA1111']} masked={false} />);
    expect(container.textContent).toContain('AAAA1111');
    unmount();
  });

  it('RecoveryCodes copy-all fires onCopyAll and regenerate renders on demand', () => {
    let copied = false;
    const { container, rerender, unmount } = render(
      <RecoveryCodes codes={['AAAA1111']} onCopyAll={() => (copied = true)} />,
    );
    expect(container.textContent).not.toContain('Regenerate');
    act(() =>
      Array.from(container.querySelectorAll('button'))
        .find((b) => b.textContent?.includes('Copy all'))
        ?.click(),
    );
    expect(copied).toBe(true);
    rerender(<RecoveryCodes codes={['AAAA1111']} onRegenerate={() => {}} />);
    expect(container.textContent).toContain('Regenerate');
    unmount();
  });

  it('PasskeyPrompt continue & cancel fire their callbacks', () => {
    let cont = false;
    let cancel = false;
    const { container, unmount } = render(
      <PasskeyPrompt onContinue={() => (cont = true)} onCancel={() => (cancel = true)} />,
    );
    const buttons = Array.from(container.querySelectorAll('button'));
    act(() => buttons.find((b) => b.textContent?.includes('Continue with a passkey'))?.click());
    act(() => buttons.find((b) => b.textContent?.includes('Use your password instead'))?.click());
    expect(cont).toBe(true);
    expect(cancel).toBe(true);
    unmount();
  });

  it('Honeypot is hidden, out of the tab order and autofill-off', () => {
    const { container, unmount } = render(<Honeypot />);
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.tabIndex).toBe(-1);
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(input.name).toBe('company');
    unmount();
  });

  it('Honeypot reports its value so submissions can be gated on empty', () => {
    let heard = '';
    const { container, unmount } = render(<Honeypot value="" onValueChange={(v) => (heard = v)} />);
    const input = container.querySelector('input') as HTMLInputElement;
    act(() => fire(input, 'focusin'));
    act(() => {
      input.value = 'https://spam.example';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(heard).toBe('https://spam.example');
    unmount();
  });
});
