/** @jsxImportSource react */
import { afterAll, describe, expect, it } from 'bun:test';
import { CameraCapture, PasteImageZone, UploadQueue } from '../components/form/UploadExtras';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

describe('batch 66 upload extras', () => {
  it('UploadQueue lists files with progress and remove', () => {
    const removed: string[] = [];
    const { container, unmount } = render(
      <UploadQueue
        items={[
          { id: 'a', name: 'a.png', size: 2048, progress: 40, status: 'uploading' },
          { id: 'b', name: 'b.png', size: 4096, progress: 100, status: 'done' },
        ]}
        onRemove={(id) => removed.push(id)}
      />,
    );
    expect(container.querySelectorAll('li').length).toBe(2);
    expect(container.querySelectorAll('[role="progressbar"]').length).toBe(2);
    act(() =>
      (container.querySelector('button[aria-label="Remove a.png"]') as HTMLButtonElement).click(),
    );
    expect(removed).toEqual(['a']);
    unmount();
  });

  it('UploadQueue shows an error and a retry action', () => {
    const retried: string[] = [];
    const { container, unmount } = render(
      <UploadQueue
        items={[{ id: 'x', name: 'x.png', progress: 0, status: 'error', error: 'Network error' }]}
        onRetry={(id) => retried.push(id)}
      />,
    );
    expect(container.textContent).toContain('Network error');
    act(() =>
      (container.querySelector('button[aria-label="Retry x.png"]') as HTMLButtonElement).click(),
    );
    expect(retried).toEqual(['x']);
    unmount();
  });

  it('CameraCapture wires a capture input and emits a file', () => {
    const files: File[] = [];
    const { container, unmount } = render(<CameraCapture onCapture={(f) => files.push(f)} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.getAttribute('capture')).toBe('environment');
    const file = new File(['x'], 'shot.jpg', { type: 'image/jpeg' });
    Object.defineProperty(input, 'files', {
      value: { 0: file, length: 1, item: () => file },
      configurable: true,
    });
    act(() => input.dispatchEvent(new Event('change', { bubbles: true })));
    expect(files[0]?.name).toBe('shot.jpg');
    unmount();
  });

  it('PasteImageZone emits pasted image files and ignores text', () => {
    const seen: File[][] = [];
    const { container, unmount } = render(<PasteImageZone onFiles={(f) => seen.push(f)} />);
    const zone = container.firstElementChild as HTMLElement;
    act(() => fire(zone, 'focusin'));
    const image = new File(['x'], 'paste.png', { type: 'image/png' });
    const text = new File(['x'], 'note.txt', { type: 'text/plain' });
    const dataTransfer = {
      files: { 0: image, 1: text, length: 2, item: (i: number) => [image, text][i] },
    };
    act(() => {
      const event = new Event('drop', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
      zone.dispatchEvent(event);
    });
    expect(seen[0]?.map((f) => f.name)).toEqual(['paste.png']);
    unmount();
  });
});
