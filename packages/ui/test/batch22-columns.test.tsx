/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { Columns, Gutter, MultiColumn, Offset, Pull, Push } from '../components/surface/Primitives';
import { registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 22 column layout', () => {
  it('MultiColumn sets column-count and gap', () => {
    const { container } = render(<MultiColumn count={3} gap="3rem" />);
    const el = first(container);
    expect(el.className).toContain('[column-count:3]');
    expect(el.style.columnGap).toBe('3rem');
  });

  it('Columns is an auto-fit grid with a minimum width', () => {
    const { container } = render(<Columns min="20rem" gap="2rem" />);
    const el = first(container);
    expect(el.className).toContain('grid');
    expect(el.style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(20rem, 1fr))');
    expect(el.style.gap).toBe('2rem');
  });

  it('Gutter applies vertical rhythm only between siblings', () => {
    const { container } = render(
      <Gutter size={6}>
        <p>one</p>
        <p>two</p>
      </Gutter>,
    );
    expect(first(container).className).toContain('[&>*+*]:mt-6');
  });

  it('Offset places children on explicit grid tracks', () => {
    const spanning = render(<Offset start={2} span={4} />);
    expect(first(spanning.container).style.gridColumn).toBe('2 / span 4');

    const bounded = render(<Offset start={5} span={6} columns={12} />);
    expect(first(bounded.container).style.gridColumn).toBe('5 / 11');
  });

  it('Push and Pull translate without touching layout', () => {
    const p = render(<Push amount="2rem" />);
    expect(first(p.container).style.transform).toBe('translateX(2rem)');
    const l = render(<Pull amount="2rem" />);
    expect(first(l.container).style.transform).toBe('translateX(calc(-1 * 2rem))');
  });
});
