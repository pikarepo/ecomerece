/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { useState } from 'react';
import { PromoCode } from '../components/data/PromoCode';
import { StockIndicator } from '../components/data/StockIndicator';
import { CartDrawer, type CartLine } from '../components/overlay/CartDrawer';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

const lines: CartLine[] = [
  { id: 'sku-1', name: 'Aero Tee', meta: 'Size M · Black', price: '$32.00', qty: 1 },
  { id: 'sku-2', name: 'Trail Cap', price: '$24.00', qty: 2, maxQty: 3 },
];

describe('batch 18 ecommerce quick wins', () => {
  it('CartDrawer renders lines, updates qty and removes', () => {
    function Harness() {
      const [items, setItems] = useState(lines);
      return (
        <CartDrawer
          open
          onClose={() => {}}
          items={items}
          subtotal="$80.00"
          onQtyChange={(id, qty) =>
            setItems((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)))
          }
          onRemove={(id) => setItems((prev) => prev.filter((l) => l.id !== id))}
          onCheckout={() => {}}
        />
      );
    }
    render(<Harness />);
    const dialog = document.body.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('Aero Tee');
    expect(dialog.textContent).toContain('$80.00');

    const inc = document.body.querySelector(
      '[aria-label="Increase quantity of Trail Cap"]',
    ) as HTMLButtonElement;
    act(() => fire(inc, 'click'));
    expect(document.body.textContent).toContain('3');

    const remove = document.body.querySelector(
      '[aria-label="Remove Aero Tee"]',
    ) as HTMLButtonElement;
    act(() => fire(remove, 'click'));
    expect(document.body.textContent).not.toContain('Aero Tee');
  });

  it('CartDrawer shows the empty state', () => {
    render(<CartDrawer open onClose={() => {}} items={[]} subtotal="$0.00" />);
    expect(document.body.textContent).toContain('Your cart is empty.');
  });

  it('PromoCode applies and removes', () => {
    let applied = 0;
    let removed = 0;
    const { container, rerender } = render(
      <PromoCode code="SAVE10" onApply={() => (applied += 1)} />,
    );
    const apply = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(apply, 'click'));
    expect(applied).toBe(1);

    rerender(<PromoCode code="SAVE10" state="applied" onRemove={() => (removed += 1)} />);
    const remove = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(remove, 'click'));
    expect(removed).toBe(1);
  });

  it('StockIndicator renders label and count', () => {
    const { container } = render(<StockIndicator level="low-stock" count={3} />);
    expect(container.textContent).toContain('Low stock');
    expect(container.textContent).toContain('3 left');
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });
});
