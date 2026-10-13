/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { registerDom, render } from './_dom';

registerDom();

describe('batch 12 stat components', () => {
  it('StatTile renders label and value', () => {
    const { StatTile } = require('../components/data');
    const { container } = render(<StatTile label="Revenue" value="$1,200" />);
    expect(container.textContent).toContain('Revenue');
    expect(container.textContent).toContain('$1,200');
  });

  it('SLAIndicator renders status', () => {
    const { SLAIndicator } = require('../components/data');
    const { container } = render(<SLAIndicator status="ok" />);
    expect(container.textContent).toContain('OK');
  });
});
