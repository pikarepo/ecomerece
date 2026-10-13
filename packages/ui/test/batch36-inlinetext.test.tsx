/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { Emoji, Hashtag, Mention, TextDiff } from '../components/surface/InlineText';
import { registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 36 inline text', () => {
  it('Mention renders @handle as a span and as a link with href', () => {
    const plain = render(<Mention>ada</Mention>);
    const el = first(plain.container);
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el.className).toContain('text-accent');
    expect(el.textContent).toBe('@ada');

    const linked = render(
      <Mention href="/users/ada" className="extra">
        ada
      </Mention>,
    );
    const a = first(linked.container);
    expect(a.tagName.toLowerCase()).toBe('a');
    expect(a.getAttribute('href')).toBe('/users/ada');
    expect(a.className).toContain('hover:underline');
    expect(a.className).toContain('extra');
    expect(a.textContent).toBe('@ada');
  });

  it('Hashtag renders #tag as a span and as a link with href', () => {
    const plain = render(<Hashtag>ui</Hashtag>);
    const el = first(plain.container);
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el.textContent).toBe('#ui');

    const linked = render(<Hashtag href="/tags/ui">ui</Hashtag>);
    const a = first(linked.container);
    expect(a.tagName.toLowerCase()).toBe('a');
    expect(a.getAttribute('href')).toBe('/tags/ui');
    expect(a.textContent).toBe('#ui');
  });

  it('Emoji is decorative by default and labeled when given a label', () => {
    const decorative = render(<Emoji>🎉</Emoji>);
    const el = first(decorative.container);
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.getAttribute('role')).toBeNull();
    expect(el.textContent).toBe('🎉');

    const labeled = render(<Emoji label="party popper">🎉</Emoji>);
    const el2 = first(labeled.container);
    expect(el2.getAttribute('role')).toBe('img');
    expect(el2.getAttribute('aria-label')).toBe('party popper');
    expect(el2.getAttribute('aria-hidden')).toBeNull();
  });

  it('TextDiff marks word-level removals and additions', () => {
    const { container } = render(
      <TextDiff before="the quick brown fox" after="the slow brown fox" />,
    );
    const wrap = first(container);
    const del = wrap.querySelector('del');
    const ins = wrap.querySelector('ins');
    expect(del?.textContent).toBe('quick ');
    expect(del?.className).toContain('line-through');
    expect(ins?.textContent).toBe('slow ');
    expect(ins?.className).toContain('text-success');
    // unchanged words render outside ins/del
    expect(wrap.textContent).toContain('brown');
    const inDel = del?.contains(wrap.querySelector('ins')) ?? true;
    expect(inDel).toBe(false);
  });

  it('TextDiff char mode and identical strings', () => {
    const { container } = render(<TextDiff before="kitten" after="sitten" by="char" />);
    const wrap = first(container);
    expect(wrap.querySelector('del')?.textContent).toBe('k');
    expect(wrap.querySelector('ins')?.textContent).toBe('s');
    // <del> text stays in the DOM (strikethrough) — full text is before+after merged
    expect(wrap.textContent).toBe('ksitten');

    const same = render(<TextDiff before="same text" after="same text" />);
    const wrap2 = first(same.container);
    expect(wrap2.querySelector('del')).toBeNull();
    expect(wrap2.querySelector('ins')).toBeNull();
    expect(wrap2.textContent).toBe('same text');
  });
});
