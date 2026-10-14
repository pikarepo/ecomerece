/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { TextField } from '../components/form/TextField';
import { fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 43 input variants', () => {
  it('applies the variant class for each mode', () => {
    const { container, unmount } = render(
      <div>
        <TextField variant="filled" defaultValue="a" />
        <TextField variant="underlined" defaultValue="b" />
        <TextField variant="inset" defaultValue="c" />
      </div>,
    );
    expect(container.querySelectorAll('input').length).toBe(3);
    expect(container.querySelector('.shadow-inner')).not.toBeNull();
    unmount();
  });

  it('renders leading, badge and trailing slots', () => {
    const { container, unmount } = render(
      <TextField
        leading={<span>@</span>}
        badge=".com"
        trailing={<span>✓</span>}
        defaultValue="ada"
      />,
    );
    expect(container.textContent).toContain('@');
    expect(container.textContent).toContain('.com');
    expect(container.textContent).toContain('✓');
    unmount();
  });

  it('shows a character counter and updates on input', () => {
    const { container, unmount } = render(
      <TextField maxLength={10} showCount defaultValue="abc" />,
    );
    expect(container.textContent).toContain('3/10');
    const input = container.querySelector('input') as HTMLInputElement;
    fire(input, 'input');
    unmount();
  });

  it('renders error with role=alert and links via aria-describedby', () => {
    const { container, unmount } = render(<TextField id="email" error="Required" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('Required');
    expect(input.getAttribute('aria-describedby')).toContain('email-error');
    unmount();
  });
});
