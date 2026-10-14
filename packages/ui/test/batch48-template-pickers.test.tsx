/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { LayoutPicker, TemplatePicker, ThemePicker } from '../components/form/TemplatePickers';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 48 template/layout/theme pickers', () => {
  it('TemplatePicker marks the selection and emits an id', () => {
    const picked: string[] = [];
    const { container, unmount } = render(
      <TemplatePicker value="blank" onValueChange={(id) => picked.push(id)} />,
    );
    expect(container.querySelectorAll('button[role="option"]').length).toBe(6);
    const store = Array.from(container.querySelectorAll('button[role="option"]')).find((b) =>
      b.textContent?.includes('Storefront'),
    ) as HTMLButtonElement;
    act(() => store.click());
    expect(picked).toEqual(['store']);
    unmount();
  });

  it('LayoutPicker toggles pressed state', () => {
    const { container, unmount } = render(<LayoutPicker value="sidebar" />);
    const sidebar = container.querySelector('button[aria-label="Sidebar"]') as HTMLButtonElement;
    expect(sidebar.getAttribute('aria-pressed')).toBe('true');
    unmount();
  });

  it('ThemePicker renders colour swatches and emits the theme id', () => {
    const picked: string[] = [];
    const { container, unmount } = render(
      <ThemePicker value="light" onValueChange={(id) => picked.push(id)} />,
    );
    const dark = Array.from(container.querySelectorAll('button[role="option"]')).find((b) =>
      b.textContent?.includes('Midnight'),
    ) as HTMLButtonElement;
    act(() => dark.click());
    expect(picked).toEqual(['dark']);
    unmount();
  });
});
