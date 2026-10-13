/** @jsxImportSource react */
import { describe, expect, it } from 'bun:test';
import { Abbr, Code, Definition, InlineBadge } from '../components/surface/Inline';
import { registerDom, render } from './_dom';

registerDom();

const first = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe('batch 35 inline', () => {
  it('InlineBadge renders a pill with the tone classes', () => {
    const { container } = render(<InlineBadge tone="success">Active</InlineBadge>);
    const el = first(container);
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el.className).toContain('rounded-chip');
    expect(el.className).toContain('bg-success/12');
    expect(el.textContent).toBe('Active');
  });

  it('InlineBadge defaults to the neutral tone', () => {
    const { container } = render(<InlineBadge>Draft</InlineBadge>);
    expect(first(container).className).toContain('bg-surface-3');
  });

  it('Abbr renders an abbr with a help cursor and passes title', () => {
    const { container } = render(<Abbr title="HyperText Markup Language">HTML</Abbr>);
    const el = first(container);
    expect(el.tagName.toLowerCase()).toBe('abbr');
    expect(el.getAttribute('title')).toBe('HyperText Markup Language');
    expect(el.className).toContain('cursor-help');
    expect(el.textContent).toBe('HTML');
  });

  it('Definition wraps a focusable dfn button plus a tooltip that reveals on hover/focus', () => {
    const { container } = render(<Definition term="token" definition="A named design value" />);
    const wrap = first(container);
    expect(wrap.className).toContain('group');
    const trigger = wrap.querySelector('button');
    expect(trigger?.getAttribute('type')).toBe('button');
    expect(trigger?.querySelector('dfn')?.textContent).toBe('token');
    const tip = wrap.querySelector('[role="tooltip"]');
    expect(tip?.textContent).toBe('A named design value');
    expect(tip?.className).toContain('opacity-0');
    expect(tip?.className).toContain('group-hover:opacity-100');
    expect(tip?.className).toContain('group-focus-within:opacity-100');
    // tooltip is linked for screen readers
    expect(trigger?.getAttribute('aria-describedby')).toBe(tip?.id);
    expect(tip?.id).toBeTruthy();
  });

  it('Code renders an inline monospace span', () => {
    const { container } = render(<Code>border-radius</Code>);
    const el = first(container);
    expect(el.tagName.toLowerCase()).toBe('code');
    expect(el.className).toContain('font-mono');
    expect(el.textContent).toBe('border-radius');
  });
});
