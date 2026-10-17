/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import {
  InfiniteScrollLoader,
  Progress,
  RouteProgressBar,
  Spinner,
  SplashScreen,
} from '../components/data';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('Spinner variants (batch 97)', () => {
  it('baseline ring keeps the original look, label and semantics', () => {
    const { container, unmount } = render(<Spinner />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('role')).toBe('status');
    expect(root.getAttribute('data-variant')).toBe('ring');
    expect(root.getAttribute('aria-label')).toBe('Loading');
    expect(root.querySelector('svg.animate-spin')).not.toBeNull();
    expect(root.textContent).toContain('Loading'); // sr-only
    unmount();
  });

  it('dots renders three staggered pulses (no svg)', () => {
    const { container, unmount } = render(<Spinner variant="dots" label="Hang tight" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('dots');
    expect(root.getAttribute('aria-label')).toBe('Hang tight');
    const dots = Array.from(root.querySelectorAll('span.animate-pulse'));
    expect(dots.length).toBe(3);
    expect(root.querySelector('svg')).toBeNull();
    expect(dots[2]?.getAttribute('style')).toContain('300ms');
    expect(dots[0]?.parentElement?.getAttribute('aria-hidden')).toBe('true');
    unmount();
  });

  it('bars renders four staggered columns', () => {
    const { container, unmount } = render(<Spinner variant="bars" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('bars');
    const bars = Array.from(root.querySelectorAll('span.animate-pulse'));
    expect(bars.length).toBe(4);
    expect(bars[3]?.getAttribute('style')).toContain('360ms');
    unmount();
  });

  it('pulse renders a single breathing dot', () => {
    const { container, unmount } = render(<Spinner variant="pulse" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('pulse');
    expect(root.querySelectorAll('span.animate-pulse').length).toBe(1);
    expect(root.querySelector('svg')).toBeNull();
    unmount();
  });

  it('orbit spins a container with an offset dot', () => {
    const { container, unmount } = render(<Spinner variant="orbit" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-variant')).toBe('orbit');
    const orbit = root.querySelector('span.animate-spin');
    expect(orbit).not.toBeNull();
    expect(orbit?.querySelector('span.rounded-full')).not.toBeNull();
    expect(root.textContent).toContain('Loading');
    unmount();
  });
});

describe('Progress variants (batch 97)', () => {
  it('baseline linear keeps semantics, tone and clamped width', () => {
    const { container, unmount } = render(<Progress value={40} tone="danger" />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.getAttribute('data-variant')).toBe('linear');
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.className).toContain('bg-danger');
    expect(fill.getAttribute('style')).toContain('width: 40%');

    const over = render(<Progress value={150} />);
    const overFill = (over.container.firstElementChild as HTMLElement)
      .firstElementChild as HTMLElement;
    expect(overFill.getAttribute('style')).toContain('width: 100%');
    over.unmount();
    unmount();
  });

  it('circular renders an svg ring with a centre readout (and can hide it)', () => {
    const { container, unmount } = render(<Progress variant="circular" value={50} />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.getAttribute('data-variant')).toBe('circular');
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
    expect(bar.querySelector('svg')).not.toBeNull();
    expect(bar.querySelectorAll('circle').length).toBe(2);
    expect(bar.textContent).toContain('50%');
    unmount();

    const noLabel = render(<Progress variant="circular" value={10} showValue={false} />);
    expect(noLabel.container.textContent).not.toContain('%');
    noLabel.unmount();
  });

  it('stepped reports filled steps of total in aria and DOM', () => {
    const { container, unmount } = render(<Progress variant="stepped" steps={6} value={70} />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.getAttribute('data-variant')).toBe('stepped');
    expect(bar.getAttribute('aria-valuenow')).toBe('4'); // round(0.7*6)
    expect(bar.getAttribute('aria-valuemax')).toBe('6');
    expect(bar.querySelectorAll('.bg-accent').length).toBe(4);
    expect(bar.querySelectorAll('.bg-line\\/15').length).toBe(2);
    unmount();

    const empty = render(<Progress variant="stepped" steps={4} value={0} />);
    const emptyBar = empty.container.firstElementChild as HTMLElement;
    expect(emptyBar.querySelectorAll('.bg-accent').length).toBe(0);
    expect(emptyBar.querySelectorAll('.bg-line\\/15').length).toBe(4);
    empty.unmount();
  });

  it('indeterminate has no aria-valuenow and sweeps via fx-indeterminate', () => {
    const { container, unmount } = render(<Progress variant="indeterminate" value={0} />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.getAttribute('data-variant')).toBe('indeterminate');
    expect(bar.getAttribute('aria-valuenow')).toBeNull();
    expect(bar.getAttribute('aria-label')).toBe('Progress');
    expect(bar.querySelector('.fx-indeterminate')).not.toBeNull();
    expect(bar.className).toContain('overflow-hidden');
    unmount();
  });

  it('buffer draws a soft loaded fill behind the solid value fill', () => {
    const { container, unmount } = render(<Progress variant="buffer" value={40} buffer={75} />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.getAttribute('data-variant')).toBe('buffer');
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    const soft = Array.from(bar.children).find((el) =>
      (el as HTMLElement).getAttribute('style')?.includes('width: 75%'),
    ) as HTMLElement;
    const solid = Array.from(bar.children).find((el) =>
      (el as HTMLElement).getAttribute('style')?.includes('width: 40%'),
    ) as HTMLElement;
    expect(soft).toBeTruthy();
    expect(soft.className).toContain('bg-accent/30');
    expect(solid).toBeTruthy();
    expect(solid.className).toContain('bg-accent');
    expect(solid.className).not.toContain('/30');
    unmount();
  });
});

describe('InfiniteScrollLoader (batch 97)', () => {
  it('shows the dots spinner while loading', () => {
    const { container, unmount } = render(<InfiniteScrollLoader loading />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-state')).toBe('loading');
    expect(root.querySelector('[role="status"][data-variant="dots"]')).not.toBeNull();
    expect(root.textContent).toContain('Loading more…');
    unmount();
  });

  it('manual mode renders Load more and fires onLoadMore', () => {
    let calls = 0;
    const { container, unmount } = render(
      <InfiniteScrollLoader trigger="button" onLoadMore={() => calls++} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-state')).toBe('idle');
    const btn = root.querySelector('button') as HTMLButtonElement;
    expect(btn.textContent).toBe('Load more');
    act(() => btn.click());
    expect(calls).toBe(1);
    unmount();
  });

  it('renders the end state once hasMore is false', () => {
    const { container, unmount } = render(
      <InfiniteScrollLoader hasMore={false} endLabel="No more items" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-state')).toBe('end');
    expect(root.textContent).toContain('No more items');
    expect(root.querySelector('button')).toBeNull();
    expect(root.querySelector('svg')).not.toBeNull(); // check mark
    unmount();
  });

  it('auto mode degrades to a button when IntersectionObserver is missing', () => {
    let calls = 0;
    const { container, unmount } = render(
      <InfiniteScrollLoader trigger="auto" onLoadMore={() => calls++} />,
    );
    const root = container.firstElementChild as HTMLElement;
    const state = root.getAttribute('data-state');
    if (typeof IntersectionObserver === 'undefined') {
      expect(state).toBe('idle');
      const btn = root.querySelector('button') as HTMLButtonElement;
      act(() => btn.click());
      expect(calls).toBe(1);
    } else {
      expect(state).toBe('sentinel');
      expect(calls).toBe(0);
    }
    unmount();
  });
});

describe('RouteProgressBar (batch 97)', () => {
  it('animates between active and inactive and hides from AT when idle', () => {
    const { container, unmount } = render(<RouteProgressBar active />);
    const bar = container.firstElementChild as HTMLElement;
    expect(bar.getAttribute('role')).toBe('progressbar');
    expect(bar.getAttribute('aria-label')).toBe('Loading');
    expect(bar.getAttribute('data-active')).toBe('true');
    expect(bar.getAttribute('aria-hidden')).toBe('false');
    expect(bar.className).toContain('scale-x-100');
    expect(bar.className).toContain('fixed left-0 top-0');

    const next = render(<RouteProgressBar active={false} label="Navigating" />);
    const idle = next.container.firstElementChild as HTMLElement;
    expect(idle.getAttribute('data-active')).toBe('false');
    expect(idle.getAttribute('aria-hidden')).toBe('true');
    expect(idle.className).toContain('scale-x-0');
    expect(idle.getAttribute('aria-label')).toBe('Navigating');
    next.unmount();
    unmount();
  });
});

describe('SplashScreen (batch 97)', () => {
  it('renders brand, copy, spinner and status; hidden while closed', () => {
    const { container, unmount } = render(
      <SplashScreen
        brand={<span>ACME</span>}
        title="Starting your session"
        description="Fetching your workspace"
        status="Warming up cache"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('data-splash')).toBe('');
    expect(root.className).toContain('fixed inset-0');
    expect(root.textContent).toContain('ACME');
    expect(root.textContent).toContain('Starting your session');
    expect(root.textContent).toContain('Fetching your workspace');
    expect(root.textContent).toContain('Warming up cache');
    expect(root.querySelector('[role="status"][data-variant="orbit"]')).not.toBeNull();
    unmount();

    const closed = render(<SplashScreen open={false} title="Hidden" />);
    expect(closed.container.textContent ?? '').toBe('');
    closed.unmount();
  });

  it('honours the spinner variant prop', () => {
    const { container, unmount } = render(<SplashScreen variant="bars" />);
    expect(container.firstElementChild?.querySelector('[data-variant="bars"]')).not.toBeNull();
    unmount();
  });
});
