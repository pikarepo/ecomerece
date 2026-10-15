/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { EmailChipsInput, TagInput, TokenInput } from '../components/form/ChipInputs';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

function field(container: HTMLElement, label: string): HTMLInputElement {
  return container.querySelector(`input[aria-label="${label}"]`) as HTMLInputElement;
}

function typeAndEnter(input: HTMLInputElement, value: string) {
  act(() => fire(input, 'focusin'));
  act(() => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  act(() => fire(input, 'keydown', { key: 'Enter' }));
}

describe('batch 64 chip inputs', () => {
  it('TagInput commits tags on Enter', () => {
    const seen: string[][] = [];
    const { container, unmount } = render(<TagInput onValuesChange={(v) => seen.push(v)} />);
    typeAndEnter(field(container, 'Tags'), 'design');
    expect(seen).toEqual([['design']]);
    unmount();
  });

  it('TagInput splits on comma and appends multiple', () => {
    const seen: string[][] = [];
    const { container, unmount } = render(<TagInput onValuesChange={(v) => seen.push(v)} />);
    typeAndEnter(field(container, 'Tags'), 'a, b, c');
    expect(seen[0]).toEqual(['a', 'b', 'c']);
    unmount();
  });

  it('TagInput removes the last tag on Backspace when empty', () => {
    const seen: string[][] = [];
    const { container, unmount } = render(
      <TagInput values={['one', 'two']} onValuesChange={(v) => seen.push(v)} />,
    );
    const input = field(container, 'Tags');
    act(() => fire(input, 'focusin'));
    act(() => fire(input, 'keydown', { key: 'Backspace' }));
    expect(seen).toEqual([['one']]);
    unmount();
  });

  it('TokenInput parses key:value and renders the token', () => {
    const seen: { key: string; value: string }[][] = [];
    const { container, unmount } = render(<TokenInput onTokensChange={(t) => seen.push(t)} />);
    typeAndEnter(field(container, 'Tokens'), 'lang:typescript');
    expect(seen[0]).toEqual([{ key: 'lang', value: 'typescript' }]);
    unmount();
  });

  it('EmailChipsInput accepts valid emails and flags invalid ones', () => {
    const seen: string[][] = [];
    const valid = render(<EmailChipsInput onEmailsChange={(e) => seen.push(e)} />);
    typeAndEnter(field(valid.container, 'Recipients'), 'ada@example.com');
    expect(seen[0]).toEqual(['ada@example.com']);
    valid.unmount();

    const invalid = render(<EmailChipsInput />);
    typeAndEnter(field(invalid.container, 'Recipients'), 'not-an-email');
    expect(invalid.container.textContent).toContain('Some addresses were invalid');
    invalid.unmount();
  });

  it('EmailChipsInput removes a chip', () => {
    const seen: string[][] = [];
    const { container, unmount } = render(
      <EmailChipsInput emails={['a@b.com']} onEmailsChange={(e) => seen.push(e)} />,
    );
    act(() =>
      (container.querySelector('button[aria-label="Remove a@b.com"]') as HTMLButtonElement).click(),
    );
    expect(seen).toEqual([[]]);
    unmount();
  });
});
