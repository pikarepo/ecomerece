/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { registerDom, render } from './_dom';

registerDom();

const items = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Shoes', href: '/shop/shoes' },
  { label: 'Running', href: '/shop/shoes/running' },
  { label: 'Item' },
];

describe('batch 15 breadcrumb variants', () => {
  it('renders all crumbs when under maxVisible', () => {
    const { Breadcrumb } = require('../components/navigation');
    const { container } = render(<Breadcrumb items={items} />);
    expect(container.textContent).toContain('Home');
    expect(container.textContent).toContain('Item');
    expect(container.querySelector('[aria-current="page"]')?.textContent).toContain('Item');
  });

  it('collapses middle crumbs into a dropdown', () => {
    const { Breadcrumb } = require('../components/navigation');
    const { container } = render(<Breadcrumb items={items} maxVisible={3} />);
    expect(container.querySelector('details')).toBeTruthy();
    expect(container.querySelector('summary')?.textContent).toContain('…');
    expect(container.textContent).toContain('Home');
    expect(container.textContent).toContain('Running');
    expect(container.textContent).toContain('Item');
  });

  it('renders item icons', () => {
    const { Breadcrumb } = require('../components/navigation');
    const { container } = render(
      <Breadcrumb
        items={[{ label: 'Cart', icon: <span data-testid="ic">*</span> }, { label: 'Checkout' }]}
      />,
    );
    expect(container.querySelector('[data-testid="ic"]')).toBeTruthy();
  });
});
