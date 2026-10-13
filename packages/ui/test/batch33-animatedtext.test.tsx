/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import {
  FadeInText,
  ScrambleText,
  SplitText,
  Typewriter,
  WordRotator,
} from '../components/surface/AnimatedText';
import { registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 33 animated text', () => {
  it('Typewriter shows a controlled number of characters', () => {
    const partial = render(
      <Typewriter text="Hello" visibleChars={3} cursor={false}>
        x
      </Typewriter>,
    );
    const el = first(partial.container);
    expect(el.textContent).toBe('Hel');
    expect(el.getAttribute('data-done')).toBe('false');

    const full = render(<Typewriter text="Hello" visibleChars={5} cursor={false} />);
    expect(first(full.container).getAttribute('data-done')).toBe('true');
  });

  it('FadeInText toggles opacity from its controlled prop', () => {
    const on = render(<FadeInText show>fade</FadeInText>);
    expect(first(on.container).getAttribute('data-visible')).toBe('true');
    expect(first(on.container).className).toContain('opacity-100');

    const off = render(<FadeInText show={false}>fade</FadeInText>);
    expect(first(off.container).getAttribute('data-visible')).toBe('false');
    expect(first(off.container).className).toContain('opacity-0');
  });

  it('WordRotator renders the controlled word', () => {
    const { container } = render(<WordRotator words={['One', 'Two', 'Three']} index={2} />);
    const el = first(container);
    expect(el.textContent).toBe('Three');
    expect(el.getAttribute('data-index')).toBe('2');
  });

  it('ScrambleText reveals or masks the text', () => {
    const revealed = render(<ScrambleText text="Ready" revealed />);
    expect(first(revealed.container).textContent).toBe('Ready');
    expect(first(revealed.container).getAttribute('data-revealed')).toBe('true');

    const masked = render(<ScrambleText text="Ready" revealed={false} />);
    expect(first(masked.container).textContent).not.toBe('Ready');
    expect(first(masked.container).textContent?.length).toBe(5);
    expect(first(masked.container).getAttribute('data-revealed')).toBe('false');
  });

  it('SplitText splits into staggered pieces', () => {
    const chars = render(<SplitText text="Hi" />);
    const charEl = first(chars.container);
    expect(charEl.getAttribute('data-show')).toBe('true');
    expect(charEl.querySelector('.sr-only')?.textContent).toBe('Hi');
    const charPieces = charEl.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(charPieces.children.length).toBe(2);

    const words = render(<SplitText text="two words" by="word" show={false} />);
    const wordEl = first(words.container);
    const wordPieces = wordEl.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(wordPieces.children.length).toBe(2);
    expect(wordEl.getAttribute('data-show')).toBe('false');
    expect((wordPieces.children[0] as HTMLElement).className).toContain('opacity-0');
  });
});
