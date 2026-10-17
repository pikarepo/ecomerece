/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import { PermalinkCopier, ShareLink } from '../components/navigation';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

/** Install a fake `navigator.clipboard.writeText`; returns the recorded writes. */
function stubClipboard(impl: (text: string) => Promise<void> = () => Promise.resolve()) {
  const calls: string[] = [];
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: (text: string) => {
        calls.push(text);
        return impl(text);
      },
    },
    configurable: true,
  });
  return calls;
}

/** Install a fake `navigator.share`; returns the recorded share payloads. */
function stubShare(impl: (data: ShareData) => Promise<void> = () => Promise.resolve()) {
  const calls: ShareData[] = [];
  Object.defineProperty(navigator, 'share', {
    value: (data: ShareData) => {
      calls.push(data);
      return impl(data);
    },
    configurable: true,
  });
  return calls;
}

function removeShare() {
  Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
}

async function click(el: Element) {
  await act(async () => {
    fire(el, 'click');
  });
}

function button(container: HTMLElement): HTMLButtonElement {
  return container.querySelector('button') as HTMLButtonElement;
}

describe('batch 78 permalink copier', () => {
  it('copies url + anchor and flips to the copied label', async () => {
    const writes = stubClipboard();
    const copied: string[] = [];
    const { container, unmount } = render(
      <PermalinkCopier
        url="https://shop.test/products/42"
        anchor="reviews"
        onCopied={(t) => copied.push(t)}
      />,
    );
    expect(button(container).textContent).toContain('Copy link');

    await click(button(container));

    expect(writes).toEqual(['https://shop.test/products/42#reviews']);
    expect(copied).toEqual(['https://shop.test/products/42#reviews']);
    expect(button(container).textContent).toContain('Copied');
    unmount();
  });

  it('lets `value` override url and anchor', async () => {
    const writes = stubClipboard();
    const { container, unmount } = render(
      <PermalinkCopier url="https://shop.test/a" anchor="x" value="https://shop.test/raw" />,
    );

    await click(button(container));

    expect(writes).toEqual(['https://shop.test/raw']);
    unmount();
  });

  it('strips an existing hash before appending the anchor', async () => {
    const writes = stubClipboard();
    const { container, unmount } = render(
      <PermalinkCopier url="https://shop.test/p/1#old" anchor="new" />,
    );

    await click(button(container));

    expect(writes).toEqual(['https://shop.test/p/1#new']);
    unmount();
  });

  it('stays unchanged when the clipboard write fails', async () => {
    stubClipboard(() => Promise.reject(new Error('denied')));
    const copied: string[] = [];
    const { container, unmount } = render(
      <PermalinkCopier url="https://shop.test/p" onCopied={(t) => copied.push(t)} />,
    );

    await click(button(container));

    expect(button(container).textContent).toContain('Copy link');
    expect(copied).toEqual([]);
    unmount();
  });
});

describe('batch 78 share link', () => {
  it('uses the platform share sheet when available', async () => {
    const shares = stubShare();
    const results: string[] = [];
    const { container, unmount } = render(
      <ShareLink
        url="https://shop.test/p/9"
        title="Nine"
        text="check it"
        onShare={(r) => results.push(r.method)}
      />,
    );

    await click(button(container));

    expect(shares).toEqual([{ title: 'Nine', text: 'check it', url: 'https://shop.test/p/9' }]);
    expect(results).toEqual(['share']);
    expect(button(container).textContent).toContain('Share');
    unmount();
  });

  it('falls back to the clipboard when share is unavailable', async () => {
    removeShare();
    const writes = stubClipboard();
    const results: string[] = [];
    const { container, unmount } = render(
      <ShareLink url="https://shop.test/p/9" onShare={(r) => results.push(r.method)} />,
    );

    await click(button(container));

    expect(writes).toEqual(['https://shop.test/p/9']);
    expect(results).toEqual(['clipboard']);
    expect(button(container).textContent).toContain('Link copied');
    unmount();
  });

  it('copyOnly skips the share sheet even when share exists', async () => {
    const shares = stubShare();
    const writes = stubClipboard();
    const { container, unmount } = render(<ShareLink url="https://shop.test/p/9" copyOnly />);

    await click(button(container));

    expect(shares).toEqual([]);
    expect(writes).toEqual(['https://shop.test/p/9']);
    unmount();
  });

  it('does not copy behind a dismissed share sheet', async () => {
    const abort = Object.assign(new Error('aborted'), { name: 'AbortError' });
    stubShare(() => Promise.reject(abort));
    const writes = stubClipboard();
    const results: string[] = [];
    const { container, unmount } = render(
      <ShareLink url="https://shop.test/p/9" onShare={(r) => results.push(r.method)} />,
    );

    await click(button(container));

    expect(writes).toEqual([]);
    expect(results).toEqual([]);
    unmount();
  });

  it('reports unavailable when both share and clipboard fail', async () => {
    removeShare();
    stubClipboard(() => Promise.reject(new Error('denied')));
    const results: string[] = [];
    const { container, unmount } = render(
      <ShareLink url="https://shop.test/p/9" onShare={(r) => results.push(r.method)} />,
    );

    await click(button(container));

    expect(results).toEqual(['unavailable']);
    expect(button(container).textContent).toContain('Share');
    unmount();
  });
});
