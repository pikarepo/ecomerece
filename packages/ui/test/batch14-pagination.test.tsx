/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { registerDom, render } from './_dom';

registerDom();

describe('batch 14 pagination v2', () => {
  it('renders first/last + jump + page-size controls', () => {
    const { Pagination } = require('../components/data');
    const { container } = render(
      <Pagination
        page={3}
        pageCount={10}
        onPageChange={() => {}}
        showFirstLast
        showJump
        totalItems={240}
        pageSize={25}
        onPageSizeChange={() => {}}
      />,
    );
    expect(container.querySelector('[aria-label="First page"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Last page"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Jump to page"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="Rows per page"]')).toBeTruthy();
    expect(container.textContent).toContain('240 total');
    expect(container.querySelector('[aria-current="page"]')?.textContent).toContain('3');
  });

  it('disables prev on first page and next on last page', () => {
    const { Pagination } = require('../components/data');
    const { container } = render(<Pagination page={1} pageCount={3} onPageChange={() => {}} />);
    const prev = container.querySelector('[aria-label="Previous page"]') as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    const next = container.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
    expect(next.disabled).toBe(false);
  });
});
