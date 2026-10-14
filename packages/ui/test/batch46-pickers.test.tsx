/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  AvatarPicker,
  CurrencyPicker,
  TimezonePicker,
  UnitPicker,
} from '../components/form/Pickers';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

function optionButtons(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll('button[role="option"]')) as HTMLButtonElement[];
}

describe('batch 46 pickers', () => {
  it('UnitPicker opens the listbox and selects a unit', () => {
    const picked: string[] = [];
    const { container, unmount } = render(
      <UnitPicker value="px" onValueChange={(u) => picked.push(u)} />,
    );
    act(() => {
      (container.querySelector('button[role="combobox"]') as HTMLButtonElement).click();
    });
    expect(optionButtons(container).length).toBeGreaterThan(3);
    const rem = optionButtons(container).find((b) =>
      b.textContent?.includes('rem'),
    ) as HTMLButtonElement;
    act(() => rem.click());
    expect(picked).toEqual(['rem']);
    unmount();
  });

  it('CurrencyPicker filters the options as you search', () => {
    const { container, unmount } = render(<CurrencyPicker value="USD" />);
    act(() => {
      (container.querySelector('button[role="combobox"]') as HTMLButtonElement).click();
    });
    const search = container.querySelector(
      'input[aria-label="Search Currency"]',
    ) as HTMLInputElement;
    act(() => {
      search.value = 'eur';
      search.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const labels = optionButtons(container).map((b) => b.textContent ?? '');
    expect(labels.some((l) => l.includes('EUR'))).toBe(true);
    expect(labels.some((l) => l.includes('Yen'))).toBe(false);
    unmount();
  });

  it('TimezonePicker lists the supplied timezones', () => {
    const { container, unmount } = render(
      <TimezonePicker timezones={['UTC', 'Asia/Kolkata']} value="UTC" />,
    );
    act(() => {
      (container.querySelector('button[role="combobox"]') as HTMLButtonElement).click();
    });
    expect(container.textContent).toContain('Asia/Kolkata');
    unmount();
  });

  it('AvatarPicker shows a name initial and emits a picked file', () => {
    const files: File[] = [];
    const { container, unmount } = render(
      <AvatarPicker name="Ada Lovelace" onPick={(f) => files.push(f)} />,
    );
    expect(container.textContent).toContain('A');
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['x'], 'ada.png', { type: 'image/png' });
    Object.defineProperty(input, 'files', {
      value: { 0: file, length: 1, item: () => file },
      configurable: true,
    });
    act(() => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(files[0]?.name).toBe('ada.png');
    unmount();
  });

  it('AvatarPicker exposes a remove action when an image is set', () => {
    let removed = 0;
    const { container, unmount } = render(
      <AvatarPicker src="/a.png" name="Ada" onRemove={() => removed++} />,
    );
    const remove = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Remove',
    ) as HTMLButtonElement;
    act(() => remove.click());
    expect(removed).toBe(1);
    unmount();
  });
});
