/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import {
  Bento,
  BentoCell,
  JustifiedGallery,
  MasonryBoard,
  MosaicGrid,
  MosaicItem,
} from '../components/surface/Gallery';
import { act, fire, registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 26 galleries', () => {
  it('MosaicGrid lays out equal tracks and MosaicItem spans them', () => {
    const grid = render(<MosaicGrid columns={6} rowHeight="4rem" gap="0.5rem" />);
    expect(first(grid.container).style.gridTemplateColumns).toBe('repeat(6, minmax(0, 1fr))');
    expect(first(grid.container).style.gridAutoRows).toBe('4rem');

    const item = render(<MosaicItem colSpan={2} rowSpan={3} />);
    expect(first(item.container).style.gridColumn).toBe('span 2');
    expect(first(item.container).style.gridRow).toBe('span 3');
  });

  it('BentoCell places itself on explicit tracks', () => {
    const bento = render(<Bento columns={4} />);
    expect(first(bento.container).style.gridAutoRows).toBe('7rem');

    const cell = render(<BentoCell col={2} row={1} colSpan={2} rowSpan={2} />);
    expect(first(cell.container).style.gridColumn).toBe('2 / span 2');
    expect(first(cell.container).style.gridRow).toBe('1 / span 2');

    const spanning = render(<BentoCell colSpan={3} />);
    expect(first(spanning.container).style.gridColumn).toBe('span 3');
  });

  it('MasonryBoard uses CSS columns and keeps children unbroken', () => {
    const { container } = render(
      <MasonryBoard columns={4} gap="2rem">
        <div>a</div>
        <div>b</div>
      </MasonryBoard>,
    );
    const el = first(container);
    expect(el.style.columnCount).toBe('4');
    expect(el.style.columnGap).toBe('2rem');
    expect(el.className).toContain('[&>*]:break-inside-avoid');
  });

  it('JustifiedGallery renders proportional tiles with alt text', () => {
    const { container } = render(
      <JustifiedGallery
        rowHeight={200}
        items={[
          { src: '/a.jpg', alt: 'Alpha', aspect: 2 },
          { src: '/b.jpg', alt: 'Bravo' },
        ]}
      />,
    );
    const images = container.querySelectorAll('img');
    expect(images.length).toBe(2);
    expect(images[0]?.getAttribute('alt')).toBe('Alpha');
    const tiles = first(container).children;
    expect((tiles[0] as HTMLElement).style.flexGrow).toBe('2');
    expect((tiles[0] as HTMLElement).style.flexBasis).toBe('400px');
    expect((tiles[1] as HTMLElement).style.height).toBe('200px');
  });

  it('JustifiedGallery reports selection when onSelect is provided', () => {
    let selected = -1;
    const { container } = render(
      <JustifiedGallery
        items={[
          { src: '/a.jpg', alt: 'Alpha' },
          { src: '/b.jpg', alt: 'Bravo' },
        ]}
        onSelect={(_item, index) => {
          selected = index;
        }}
      />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    act(() => fire(buttons[1] as Element, 'click'));
    expect(selected).toBe(1);
  });
});
