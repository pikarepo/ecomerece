import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { FileUpload } from '../components/form/FileUpload';
import { act, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

function makeFile(name: string, size: number) {
  return new File(['x'.repeat(size)], name, { type: 'text/plain' });
}

describe('FileUpload', () => {
  test('renders drop zone with label', () => {
    const { container, unmount } = render(
      createElement(FileUpload, { onFilesChange: () => {}, label: 'Drop here' }),
    );
    expect(container.textContent).toContain('Drop here');
    expect(container.querySelector('input[type="file"]')).not.toBeNull();
    unmount();
  });

  test('adds a file to the list and calls onFilesChange', () => {
    const calls: File[][] = [];
    const { container, unmount } = render(
      createElement(FileUpload, { onFilesChange: (f) => calls.push(f) }),
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeFile('report.pdf', 1024);
    // Simulate file selection via onChange on the hidden input
    Object.defineProperty(input, 'files', {
      value: { 0: file, length: 1, item: () => file },
      configurable: true,
    });
    act(() => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(calls.length).toBeGreaterThan(0);
    unmount();
  });

  test('shows an error for files exceeding maxSize', () => {
    const { container, unmount } = render(
      createElement(FileUpload, {
        onFilesChange: () => {},
        maxSize: 500,
        label: 'Upload',
      }),
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const bigFile = makeFile('huge.bin', 1000);
    Object.defineProperty(input, 'files', {
      value: { 0: bigFile, length: 1, item: () => bigFile },
      configurable: true,
    });
    act(() => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(container.textContent).toContain('exceeds');
    unmount();
  });

  test('disabled state sets the input as disabled', () => {
    const { container, unmount } = render(
      createElement(FileUpload, { onFilesChange: () => {}, disabled: true }),
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    unmount();
  });
});
