/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { Cover, Imposter, Reel, SidebarLayout } from '../components/surface/Primitives';
import { registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 20 layout patterns', () => {
  it('Reel is a horizontal, non-wrapping rail', () => {
    const { container } = render(
      <Reel snap>
        <div>1</div>
        <div>2</div>
      </Reel>,
    );
    const el = first(container);
    expect(el.className).toContain('overflow-x-auto');
    expect(el.className).toContain('[&>*]:shrink-0');
    expect(el.className).toContain('snap-x');
    expect(el.className).toContain('[&>*]:snap-start');
    expect(el.textContent).toBe('12');

    const plain = render(<Reel />);
    expect(first(plain.container).className).not.toContain('snap-x');
  });

  it('Sidebar keeps 16rem and lets content take the rest', () => {
    const { container } = render(
      <SidebarLayout>
        <nav>nav</nav>
        <main>main</main>
      </SidebarLayout>,
    );
    const el = first(container);
    expect(el.className).toContain('[&>*:first-child]:basis-64');
    expect(el.className).toContain('[&>*:last-child]:grow-[999]');

    const right = render(
      <SidebarLayout side="right">
        <main>main</main>
        <nav>nav</nav>
      </SidebarLayout>,
    );
    expect(first(right.container).className).toContain('[&>*:last-child]:basis-64');
  });

  it('Imposter centers content and can pin to the viewport', () => {
    const { container } = render(<Imposter fixed />);
    const el = first(container);
    expect(el.className).toContain('grid');
    expect(el.className).toContain('place-items-center');
    expect(el.className).toContain('fixed');
    expect(el.className).toContain('inset-0');
  });

  it('Cover fills its block-size and centers the middle child', () => {
    const { container } = render(
      <Cover minHeight="60vh">
        <header>top</header>
        <main>middle</main>
        <footer>bottom</footer>
      </Cover>,
    );
    const el = first(container);
    expect(el.className).toContain('flex-col');
    expect(el.className).toContain('[&>*:not(:first-child):not(:last-child)]:my-auto');
    expect(el.style.getPropertyValue('min-height')).toBe('60vh');
    expect(el.textContent).toBe('topmiddlebottom');
  });
});
