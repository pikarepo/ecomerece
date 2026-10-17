/** @jsxImportSource react */
import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import {
  BalanceCard,
  BudgetBar,
  DepthChart,
  formatMoney,
  InvoiceReceipt,
  OrderBook,
  PortfolioBreakdown,
  PriceChangeBadge,
  PriceTicker,
  TickerTape,
  TransactionList,
} from '../components/data/Financial';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('formatMoney', () => {
  test('formats unsigned, signed and custom-currency amounts', () => {
    expect(formatMoney(1234.5)).toBe('$1,234.50');
    expect(formatMoney(-5)).toBe('-$5.00');
    expect(formatMoney(9.9, '€')).toBe('€9.90');
    expect(formatMoney(0)).toBe('$0.00');
  });
});

describe('PriceChangeBadge', () => {
  test('tones gains green and losses red', () => {
    const up = render(createElement(PriceChangeBadge, { change: 1.2, changePercent: 2.4 }));
    const upRoot = up.container.firstElementChild as HTMLElement;
    expect(upRoot.className).toContain('text-success');
    expect(up.container.textContent).toContain('+2.4%');
    up.unmount();

    const down = render(createElement(PriceChangeBadge, { change: -1.2, changePercent: -2.4 }));
    const downRoot = down.container.firstElementChild as HTMLElement;
    expect(downRoot.className).toContain('text-danger');
    down.unmount();

    const flat = render(createElement(PriceChangeBadge, { change: 0, changePercent: 0 }));
    expect((flat.container.firstElementChild as HTMLElement).className).toContain('text-ink-3');
    flat.unmount();
  });
});

describe('PriceTicker', () => {
  test('shows the symbol, name, price and change', () => {
    const { container, unmount } = render(
      createElement(PriceTicker, {
        quote: {
          symbol: 'ACME',
          name: 'Acme Corp',
          price: 128.4,
          change: 3.1,
          changePercent: 2.47,
          spark: [1, 2, 3, 2, 4],
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('ACME');
    expect(text).toContain('Acme Corp');
    expect(text).toContain('$128.40');
    expect(text).toContain('+2.47%');
    expect(container.querySelector('svg')).not.toBeNull();
    unmount();
  });
});

describe('TickerTape', () => {
  test('renders a labelled list of quotes', () => {
    const { container, unmount } = render(
      createElement(TickerTape, {
        quotes: [
          { symbol: 'AAA', price: 10, change: 0.5, changePercent: 5 },
          { symbol: 'BBB', price: 20, change: -0.5, changePercent: -2 },
        ],
      }),
    );
    expect(container.querySelector('ul')?.getAttribute('aria-label')).toBe('Market ticker');
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(2);
    expect(container.textContent).toContain('AAA');
    expect(container.textContent).toContain('-2%');
    unmount();
  });
});

describe('OrderBook', () => {
  test('renders bids and asks with depth bars', () => {
    const { container, unmount } = render(
      createElement(OrderBook, {
        bids: [
          { price: 99, size: 10 },
          { price: 98, size: 5 },
        ],
        asks: [
          { price: 101, size: 8 },
          { price: 102, size: 4 },
        ],
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('$99.00');
    expect(text).toContain('$102.00');
    expect(text).toContain('Bids');
    expect(text).toContain('Asks');
    const bars = container.querySelectorAll('[style]');
    expect(bars.length).toBe(4);
    expect((bars[0] as HTMLElement).style.width).toBe('100%');
    unmount();
  });
});

describe('DepthChart', () => {
  test('draws cumulative bid and ask areas', () => {
    const { container, unmount } = render(
      createElement(DepthChart, {
        label: 'BTC depth',
        bids: [
          { price: 98, size: 2 },
          { price: 99, size: 3 },
        ],
        asks: [
          { price: 101, size: 1 },
          { price: 102, size: 4 },
        ],
      }),
    );
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('BTC depth');
    expect(container.querySelectorAll('polygon').length).toBe(2);
    expect(container.querySelectorAll('polyline').length).toBe(2);
    unmount();
  });
});

describe('PortfolioBreakdown', () => {
  test('computes allocation percentages from values', () => {
    const { container, unmount } = render(
      createElement(PortfolioBreakdown, {
        holdings: [
          { id: 'a', label: 'Equities', value: 600, tone: 'accent' },
          { id: 'b', label: 'Bonds', value: 300, tone: 'info' },
          { id: 'c', label: 'Cash', value: 100, tone: 'success' },
        ],
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Equities');
    expect(text).toContain('60%');
    expect(text).toContain('30%');
    expect(text).toContain('10%');
    expect(text).toContain('$600.00');
    expect(container.querySelectorAll('li').length).toBe(3);
    unmount();
  });
});

describe('TransactionList', () => {
  test('signs amounts and flags pending rows', () => {
    const { container, unmount } = render(
      createElement(TransactionList, {
        transactions: [
          { id: 't1', description: 'Payroll', date: 'Mon', amount: 2000 },
          {
            id: 't2',
            description: 'Rent',
            date: 'Tue',
            amount: -900,
            pending: true,
            category: 'Home',
          },
        ],
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Payroll');
    expect(text).toContain('+$2,000.00');
    expect(text).toContain('-$900.00');
    expect(text).toContain('Pending');
    expect(text).toContain('Home');
    unmount();
  });
});

describe('BalanceCard', () => {
  test('shows balance, breakdown and fires the action', () => {
    let acted = 0;
    const { container, unmount } = render(
      createElement(BalanceCard, {
        label: 'Checking',
        amount: 5400.25,
        available: 5200,
        pending: 200.25,
        actionLabel: 'Add funds',
        onAction: () => {
          acted += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('$5,400.25');
    expect(text).toContain('Available');
    expect(text).toContain('$5,200.00');
    expect(text).toContain('Pending');
    const button = container.querySelector('button') as HTMLButtonElement;
    act(() => fire(button, 'click'));
    expect(acted).toBe(1);
    unmount();
  });
});

describe('InvoiceReceipt', () => {
  test('totals line items with tax', () => {
    const { container, unmount } = render(
      createElement(InvoiceReceipt, {
        number: 'INV-001',
        date: '2026-10-16',
        items: [
          { id: 'l1', description: 'Design', amount: 100, quantity: 2 },
          { id: 'l2', description: 'Hosting', amount: 50 },
        ],
        taxRate: 0.1,
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('INV-001');
    expect(text).toContain('Design');
    expect(text).toContain('× 2');
    expect(text).toContain('$100.00');
    expect(text).toContain('$50.00');
    expect(text).toContain('Subtotal');
    expect(text).toContain('$150.00');
    expect(text).toContain('Tax (10%)');
    expect(text).toContain('$15.00');
    expect(text).toContain('$165.00');
    unmount();
  });
});

describe('BudgetBar', () => {
  test('reports spend against budget', () => {
    const { container, unmount } = render(
      createElement(BudgetBar, { label: 'Marketing', spent: 50, budget: 100 }),
    );
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-valuenow')).toBe('50');
    expect(container.textContent).toContain('$50.00 / $100.00');
    expect(container.textContent).toContain('$50.00 left');
    unmount();
  });

  test('warns when over budget', () => {
    const { container, unmount } = render(
      createElement(BudgetBar, { label: 'Travel', spent: 120, budget: 100 }),
    );
    expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')).toBe(
      '100',
    );
    expect(container.textContent).toContain('Over budget by $20.00');
    unmount();
  });
});
