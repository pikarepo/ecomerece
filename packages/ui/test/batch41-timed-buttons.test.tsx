/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { CooldownButton, CountdownButton, ResendCodeButton } from '../components/controls/Cooldown';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

const sleep = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

describe('batch 41 timed buttons', () => {
  it('CooldownButton cools down after activation then re-enables', async () => {
    let activated = 0;
    const { container, unmount } = render(
      <CooldownButton seconds={0.3} onActivate={() => activated++}>
        Send
      </CooldownButton>,
    );
    const btn = first(container) as HTMLButtonElement;

    act(() => btn.click());
    expect(activated).toBe(1);
    expect(btn.getAttribute('data-cooling')).toBe('');
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).not.toBe('Send');

    await sleep(700);
    expect(btn.getAttribute('data-cooling')).toBeNull();
    expect(btn.disabled).toBe(false);
    expect(btn.textContent).toBe('Send');
    unmount();
  });

  it('ResendCodeButton fires onResend once and shows the cooling label', async () => {
    let resends = 0;
    const { container, unmount } = render(
      <ResendCodeButton seconds={0.3} onResend={() => resends++} />,
    );
    const btn = first(container) as HTMLButtonElement;
    expect(btn.textContent).toBe('Resend code');

    act(() => btn.click());
    expect(resends).toBe(1);
    expect(btn.getAttribute('data-cooling')).toBe('');
    expect(btn.textContent).toContain('Resend in');

    await sleep(700);
    expect(btn.getAttribute('data-cooling')).toBeNull();
    unmount();
  });

  it('CountdownButton counts down on mount then fires onComplete', async () => {
    let done = 0;
    const { container, unmount } = render(
      <CountdownButton seconds={0.3} onComplete={() => done++}>
        Continue
      </CountdownButton>,
    );
    const btn = first(container) as HTMLButtonElement;

    expect(btn.getAttribute('data-counting')).toBe('');
    expect(btn.disabled).toBe(true);

    await sleep(700);
    expect(done).toBe(1);
    expect(btn.getAttribute('data-counting')).toBeNull();
    expect(btn.disabled).toBe(false);
    expect(btn.textContent).toBe('Continue');
    unmount();
  });
});
