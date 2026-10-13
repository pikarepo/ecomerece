/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { registerDom, render } from './_dom';

registerDom();

describe('batch 13 overlay components', () => {
  it('HoverCard renders trigger and content', () => {
    const { HoverCard } = require('../components/overlay');
    const { container } = render(
      <HoverCard trigger={<button type="button">Hover me</button>} content={<span>Info</span>} />,
    );
    expect(container.textContent).toContain('Hover me');
    expect(container.textContent).toContain('Info');
  });
});
