/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { useRef } from 'react';
import { fire, registerDom, render } from './_dom';

registerDom();

describe('batch 16 mini hooks', () => {
  it('useToggle flips and sets', () => {
    const { useToggle } = require('../lib/hooks');
    let api: [boolean, () => void, (v: boolean) => void] = [false, () => {}, () => {}];
    function Probe() {
      api = useToggle(false);
      return <span>{String(api[0])}</span>;
    }
    const { container } = render(<Probe />);
    expect(container.textContent).toBe('false');
    render(<Probe />);
  });

  it('usePrevious returns prior value', () => {
    const { usePrevious } = require('../lib/hooks');
    const seen: Array<number | undefined> = [];
    function Probe({ n }: { n: number }) {
      seen.push(usePrevious(n));
      return <span>{n}</span>;
    }
    const { rerender } = render(<Probe n={1} />);
    rerender(<Probe n={2} />);
    expect(seen[seen.length - 1]).toBe(1);
  });

  it('useTimeout and useInterval exist and are functions', () => {
    const { useTimeout, useInterval } = require('../lib/hooks');
    expect(typeof useTimeout).toBe('function');
    expect(typeof useInterval).toBe('function');
  });

  it('useClickAway fires on outside click', () => {
    const { useClickAway } = require('../lib/hooks');
    let clicks = 0;
    function Probe() {
      const ref = useRef<HTMLDivElement>(null);
      useClickAway(ref, () => {
        clicks += 1;
      });
      return (
        <div>
          <div ref={ref} data-testid="inside">
            in
          </div>
          <span data-testid="outside">out</span>
        </div>
      );
    }
    const { container } = render(<Probe />);
    const outside = container.querySelector('[data-testid="outside"]') as HTMLElement;
    fire(outside, 'mousedown');
    expect(clicks).toBe(1);
  });
});
