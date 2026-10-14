/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  ChipButton,
  ChoiceChip,
  FilterChip,
  InputChip,
  SuggestionChip,
  TabChip,
} from '../components/controls/ChipButton';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 42 chip-button family', () => {
  it('FilterChip toggles selection via aria-pressed', () => {
    let selected = false;
    const { container, unmount } = render(
      <FilterChip selected={selected} onSelectedChange={(v) => (selected = v)}>
        In stock
      </FilterChip>,
    );
    const chip = first(container) as HTMLButtonElement;
    expect(chip.getAttribute('aria-pressed')).toBe('false');
    expect(chip.className).toContain('mat-control');

    act(() => chip.click());
    expect(selected).toBe(true);
    unmount();
  });

  it('ChoiceChip exposes radio semantics and the selected surface', () => {
    const { container, unmount } = render(
      <ChoiceChip selected onSelectedChange={() => {}}>
        Large
      </ChoiceChip>,
    );
    const chip = first(container) as HTMLButtonElement;
    expect(chip.getAttribute('role')).toBe('radio');
    expect(chip.getAttribute('aria-checked')).toBe('true');
    expect(chip.className).toContain('mat-primary');
    unmount();
  });

  it('TabChip exposes tab semantics', () => {
    const { container, unmount } = render(<TabChip selected={false}>Overview</TabChip>);
    const chip = first(container) as HTMLButtonElement;
    expect(chip.getAttribute('role')).toBe('tab');
    expect(chip.getAttribute('aria-selected')).toBe('false');
    unmount();
  });

  it('SuggestionChip fires onClick and toggles', () => {
    let clicks = 0;
    let selected: unknown = null;
    const { container, unmount } = render(
      <SuggestionChip
        onClick={() => clicks++}
        onSelectedChange={(v) => (selected = v)}
        selected={false}
      >
        Try it
      </SuggestionChip>,
    );
    const chip = first(container) as HTMLButtonElement;
    act(() => chip.click());
    expect(clicks).toBe(1);
    expect(selected).toBe(true);
    unmount();
  });

  it('InputChip composes label + remove buttons (no nested buttons)', () => {
    let removed = 0;
    const { container, unmount } = render(
      <InputChip leading={<span data-avatar />} onRemove={() => removed++}>
        jane@acme.io
      </InputChip>,
    );
    expect(container.querySelector('button button')).toBeNull();

    const remove = container.querySelector('button[aria-label="Remove"]') as HTMLButtonElement;
    expect(remove).not.toBeNull();
    expect(removed).toBe(0);
    act(() => remove.click());
    expect(removed).toBe(1);
    expect(container.querySelector('[data-avatar]')).not.toBeNull();
    unmount();
  });

  it('ChipButton does not toggle selection for the input variant', () => {
    let selected: unknown = null;
    const { container, unmount } = render(
      <ChipButton
        variant="input"
        removable
        onRemove={() => {}}
        onSelectedChange={(v) => (selected = v)}
      >
        Token
      </ChipButton>,
    );
    const labelBtn = container.querySelector('span > button') as HTMLButtonElement;
    act(() => labelBtn.click());
    expect(selected).toBeNull();
    unmount();
  });
});
