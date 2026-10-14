/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  EmailInput,
  PasswordInput,
  PasswordStrength,
  UrlInput,
  UsernameInput,
} from '../components/form/SmartInputs';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 44 smart inputs', () => {
  it('EmailInput suggests a matching domain', () => {
    const { container, unmount } = render(<EmailInput defaultValue="ada@gm" />);
    expect(container.querySelector('button')?.textContent).toContain('ada@gmail.com');
    unmount();
  });

  it('UrlInput normalises a missing scheme on blur', () => {
    const seen: string[] = [];
    const { container, unmount } = render(
      <UrlInput defaultValue="example.com" onValueChange={(v) => seen.push(v)} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    act(() => {
      input.dispatchEvent(new Event('focusout', { bubbles: true }));
    });
    expect(seen.at(-1)).toBe('https://example.com');
    unmount();
  });

  it('UsernameInput debounces an async availability check', async () => {
    const check = async (u: string) => u === 'ada';
    const { container, unmount } = render(
      <UsernameInput defaultValue="ada" check={check} debounceMs={5} />,
    );
    await act(async () => {
      await new Promise((r) => setTimeout(r, 35));
    });
    expect(container.textContent).toContain('available');
    unmount();
  });

  it('PasswordStrength scores and lists rules', () => {
    const { container, unmount } = render(<PasswordStrength value="Abcdef1!" showRules />);
    expect(container.querySelector('[role="meter"]')).not.toBeNull();
    expect(container.textContent).toContain('At least 8 characters');
    expect(container.textContent).toContain('Strong');
    unmount();
  });

  it('PasswordInput toggles visibility', () => {
    const { container, unmount } = render(
      <PasswordInput defaultValue="secret" showStrength={false} />,
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
    act(() => {
      (container.querySelector('button') as HTMLButtonElement).click();
    });
    expect(input.type).toBe('text');
    unmount();
  });
});
