/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  EmojiPicker,
  FontPicker,
  GradientPicker,
  IconPicker,
  ShadowPicker,
} from '../components/form/AdvancedPickers';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 47 pickers II', () => {
  it('EmojiPicker switches category and emits a chosen emoji', () => {
    const picked: string[] = [];
    const { container, unmount } = render(<EmojiPicker onValueChange={(e) => picked.push(e)} />);
    expect(container.textContent).toContain('Smileys');
    const animalsTab = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Animals',
    ) as HTMLButtonElement;
    act(() => animalsTab.click());
    expect(container.querySelector('button[aria-label="🐶"]')).not.toBeNull();
    act(() => {
      (container.querySelector('button[aria-label="🐶"]') as HTMLButtonElement).click();
    });
    expect(picked).toEqual(['🐶']);
    unmount();
  });

  it('FontPicker selects a font option', () => {
    const picked: string[] = [];
    const { container, unmount } = render(
      <FontPicker value="system" onValueChange={(f) => picked.push(f)} />,
    );
    expect(container.textContent).toContain('Georgia');
    const georgia = Array.from(container.querySelectorAll('button[role="option"]')).find((b) =>
      b.textContent?.includes('Georgia'),
    ) as HTMLButtonElement;
    act(() => georgia.click());
    expect(picked).toEqual(['georgia']);
    unmount();
  });

  it('IconPicker filters by name and emits the icon name', () => {
    const picked: string[] = [];
    const { container, unmount } = render(<IconPicker onValueChange={(n) => picked.push(n)} />);
    const search = container.querySelector('input[aria-label="Search Icon"]') as HTMLInputElement;
    act(() => {
      search.value = 'heart';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const options = container.querySelectorAll('button[role="option"]');
    expect(options.length).toBe(1);
    act(() => (options[0] as HTMLButtonElement).click());
    expect(picked).toEqual(['heart']);
    unmount();
  });

  it('GradientPicker emits the chosen gradient CSS', () => {
    const picked: string[] = [];
    const { container, unmount } = render(<GradientPicker onValueChange={(c) => picked.push(c)} />);
    expect(container.querySelectorAll('button[role="option"]').length).toBe(6);
    act(() => {
      (container.querySelector('button[aria-label="Ocean"]') as HTMLButtonElement).click();
    });
    expect(picked[0]).toContain('linear-gradient');
    expect(picked[0]).toContain('#2193b0');
    unmount();
  });

  it('ShadowPicker emits the chosen shadow CSS', () => {
    const picked: string[] = [];
    const { container, unmount } = render(<ShadowPicker onValueChange={(c) => picked.push(c)} />);
    act(() => {
      (container.querySelector('button[aria-label="Large"]') as HTMLButtonElement).click();
    });
    expect(picked[0]).toContain('rgba');
    unmount();
  });
});
