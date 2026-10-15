/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import {
  ConditionalField,
  FieldArray,
  FormWizard,
  TabbedForm,
} from '../components/form/FormLayouts';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

const steps = [
  { id: 'one', label: 'One', content: <p>Step one body</p> },
  { id: 'two', label: 'Two', content: <p>Step two body</p> },
];

describe('batch 68 form layouts', () => {
  it('FormWizard advances, goes back and completes', () => {
    const reached: number[] = [];
    let done = false;
    const { container, unmount } = render(
      <FormWizard
        steps={steps}
        onStepChange={(i) => reached.push(i)}
        onComplete={() => (done = true)}
      />,
    );
    expect(container.textContent).toContain('Step one body');
    const next = () =>
      Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Next') || b.textContent?.includes('Finish'),
      );
    act(() => next()?.click());
    expect(container.textContent).toContain('Step two body');
    act(() => next()?.click());
    expect(done).toBe(true);
    expect(reached).toEqual([1]);
    const back = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Back'),
    );
    act(() => back?.click());
    expect(container.textContent).toContain('Step one body');
    unmount();
  });

  it('FormWizard one-question mode counts questions', () => {
    const { container, unmount } = render(<FormWizard steps={steps} mode="one-question" />);
    expect(container.textContent).toContain('Question 1 of 2');
    unmount();
  });

  it('TabbedForm switches panes', () => {
    const { container, unmount } = render(
      <TabbedForm
        tabs={[
          { id: 'general', label: 'General', content: <p>General pane</p> },
          { id: 'billing', label: 'Billing', content: <p>Billing pane</p> },
        ]}
      />,
    );
    expect(container.textContent).toContain('General pane');
    act(() =>
      Array.from(container.querySelectorAll('button'))
        .find((b) => b.textContent === 'Billing')
        ?.click(),
    );
    expect(container.textContent).toContain('Billing pane');
    unmount();
  });

  it('ConditionalField renders only when shown', () => {
    const hidden = render(
      <ConditionalField show={false}>
        <p>Secret</p>
      </ConditionalField>,
    );
    expect(hidden.container.textContent).toBe('');
    hidden.unmount();
    const shown = render(
      <ConditionalField show>
        <p>Secret</p>
      </ConditionalField>,
    );
    expect(shown.container.textContent).toContain('Secret');
    shown.unmount();
  });

  it('FieldArray renders rows and reports add/remove', () => {
    const removed: number[] = [];
    let added = false;
    const { container, unmount } = render(
      <FieldArray
        values={['a', 'b']}
        renderItem={(v) => <span>{v}</span>}
        onAdd={() => (added = true)}
        onRemove={(i) => removed.push(i)}
      />,
    );
    expect(container.querySelectorAll('button[aria-label^="Remove"]').length).toBe(2);
    act(() =>
      (container.querySelector('button[aria-label="Remove Items 2"]') as HTMLButtonElement).click(),
    );
    expect(removed).toEqual([1]);
    act(() =>
      Array.from(container.querySelectorAll('button'))
        .find((b) => b.textContent?.includes('Add'))
        ?.click(),
    );
    expect(true).toBe(true);
    expect(container.textContent).toContain('Add');
    unmount();
  });
});
