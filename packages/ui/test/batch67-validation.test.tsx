/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  AsyncValidationIndicator,
  DirtyIndicator,
  focusFirstInvalid,
  UnsavedChangesBar,
  ValidationSummary,
} from '../components/form/Validation';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

function Form() {
  return (
    <form>
      <input aria-label="ok" />
      <input aria-label="bad" aria-invalid="true" />
    </form>
  );
}

describe('batch 67 validation parts', () => {
  it('AsyncValidationIndicator reflects each status', () => {
    const idle = render(<AsyncValidationIndicator status="idle" />);
    expect(idle.container.textContent).toBe('');
    idle.unmount();

    const checking = render(<AsyncValidationIndicator status="validating" />);
    expect(checking.container.textContent).toContain('Checking');
    checking.unmount();

    const bad = render(<AsyncValidationIndicator status="invalid" message="Taken" />);
    expect(bad.container.textContent).toContain('Taken');
    bad.unmount();
  });

  it('DirtyIndicator hides when clean and shows state', () => {
    const clean = render(<DirtyIndicator />);
    expect(clean.container.textContent).toBe('');
    clean.unmount();

    const dirty = render(<DirtyIndicator dirty touched />);
    expect(dirty.container.textContent).toContain('Unsaved changes');
    dirty.unmount();
  });

  it('ValidationSummary lists issues and reports clicks', () => {
    const clicked: string[] = [];
    const { container, unmount } = render(
      <ValidationSummary
        issues={[
          { field: 'email', message: 'Email is required' },
          { field: 'name', message: 'Name is too short' },
        ]}
        onIssueClick={(f) => clicked.push(f)}
      />,
    );
    expect(container.querySelectorAll('li').length).toBe(2);
    act(() => (container.querySelector('button') as HTMLButtonElement).click());
    expect(clicked).toEqual(['email']);
    unmount();
  });

  it('focusFirstInvalid focuses and returns the first invalid field', () => {
    const { container, unmount } = render(<Form />);
    const found = focusFirstInvalid(container);
    expect(found?.getAttribute('aria-label')).toBe('bad');
    expect(document.activeElement).toBe(found);
    unmount();
  });

  it('UnsavedChangesBar fires save/discard and warns on unload', () => {
    const calls: string[] = [];
    const { container, unmount } = render(
      <UnsavedChangesBar
        when
        onSave={() => calls.push('save')}
        onDiscard={() => calls.push('discard')}
      />,
    );
    act(() =>
      Array.from(container.querySelectorAll('button'))
        .find((b) => b.textContent?.includes('Save'))
        ?.click(),
    );
    act(() =>
      Array.from(container.querySelectorAll('button'))
        .find((b) => b.textContent?.includes('Discard'))
        ?.click(),
    );
    expect(calls).toEqual(['save', 'discard']);

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    unmount();
  });
});
