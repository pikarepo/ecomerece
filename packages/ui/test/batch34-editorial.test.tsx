/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import {
  Citation,
  DropCap,
  Footnote,
  FootnoteList,
  FootnoteRef,
  PullQuote,
} from '../components/surface/Editorial';
import { registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 34 editorial', () => {
  it('DropCap enlarges the first letter', () => {
    const { container } = render(<DropCap size="lg">Once upon a time.</DropCap>);
    const el = first(container);
    expect(el.tagName.toLowerCase()).toBe('p');
    expect(el.className).toContain('first-letter:float-left');
    expect(el.className).toContain('first-letter:text-6xl');
  });

  it('PullQuote renders a blockquote with attribution', () => {
    const { container } = render(
      <PullQuote cite="Ada Lovelace">Programs must be written for people to read.</PullQuote>,
    );
    const figure = first(container);
    expect(figure.tagName.toLowerCase()).toBe('figure');
    expect(figure.querySelector('blockquote')?.textContent).toContain('Programs');
    expect(figure.querySelector('figcaption')?.textContent).toContain('Ada Lovelace');
  });

  it('FootnoteRef links to the note and Footnote links back', () => {
    const ref = render(<FootnoteRef id="a" index={1} />);
    const sup = first(ref.container);
    expect(sup.tagName.toLowerCase()).toBe('sup');
    expect(sup.id).toBe('fnref-a');
    expect(sup.querySelector('a')?.getAttribute('href')).toBe('#fn-a');

    const note = render(
      <Footnote id="a" index={1}>
        The source.
      </Footnote>,
    );
    const li = first(note.container);
    expect(li.tagName.toLowerCase()).toBe('li');
    expect(li.id).toBe('fn-a');
    expect(li.querySelector('a')?.getAttribute('href')).toBe('#fnref-a');
  });

  it('FootnoteList groups notes under a title', () => {
    const { container } = render(
      <FootnoteList heading="Notes">
        <Footnote id="a" index={1}>
          first
        </Footnote>
      </FootnoteList>,
    );
    const section = first(container);
    expect(section.textContent).toContain('Notes');
    expect(section.querySelectorAll('ol > li').length).toBe(1);
  });

  it('Citation renders optional link, author and year', () => {
    const linked = render(
      <Citation href="https://example.com" author="Knuth" year={1984}>
        The TeXbook
      </Citation>,
    );
    const cite = first(linked.container);
    expect(cite.tagName.toLowerCase()).toBe('cite');
    expect(cite.querySelector('a')?.getAttribute('href')).toBe('https://example.com');
    expect(cite.textContent).toContain('Knuth');
    expect(cite.textContent).toContain('1984');

    const plain = render(<Citation>Anonymous</Citation>);
    expect(first(plain.container).querySelector('a')).toBeNull();
  });
});
