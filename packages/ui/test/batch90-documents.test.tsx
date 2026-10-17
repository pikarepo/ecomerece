/** @jsxImportSource react */
import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import {
  AnnotationPins,
  DiffView,
  DocumentPreview,
  DocumentThumbnails,
  ReaderMode,
  TocPanel,
  VersionHistory,
} from '../components/data/Documents';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('DocumentPreview', () => {
  test('shows title, page counter and zoom, guarding the page bounds', () => {
    let next = 0;
    let prev = 0;
    let zin = 0;
    const { container, unmount } = render(
      createElement(DocumentPreview, {
        title: 'contract.pdf',
        page: 1,
        pageCount: 3,
        zoom: 100,
        onPrevPage: () => {
          prev += 1;
        },
        onNextPage: () => {
          next += 1;
        },
        onZoomIn: () => {
          zin += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('contract.pdf');
    expect(text).toContain('1 / 3');
    expect(text).toContain('100%');

    const prevBtn = container.querySelector('[aria-label="Previous page"]') as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);
    const nextBtn = container.querySelector('[aria-label="Next page"]') as HTMLButtonElement;
    expect(nextBtn.disabled).toBe(false);
    act(() => fire(nextBtn, 'click'));
    act(() =>
      fire(container.querySelector('[aria-label="Zoom in"]') as HTMLButtonElement, 'click'),
    );
    expect(next).toBe(1);
    expect(prev).toBe(0);
    expect(zin).toBe(1);
    unmount();
  });

  test('renders custom page content', () => {
    const { container, unmount } = render(
      <DocumentPreview title="x">
        <span>rendered page</span>
      </DocumentPreview>,
    );
    expect(container.textContent).toContain('rendered page');
    unmount();
  });
});

describe('DocumentThumbnails', () => {
  test('marks the active page and reports selection', () => {
    let selected = '';
    const { container, unmount } = render(
      createElement(DocumentThumbnails, {
        pages: [{ id: 'p1', label: 'Cover' }, { id: 'p2' }],
        activeId: 'p1',
        onSelect: (id: string) => {
          selected = id;
        },
      }),
    );
    const buttons = container.querySelectorAll('li button');
    expect(buttons.length).toBe(2);
    expect(container.textContent).toContain('Cover');
    expect(container.textContent).toContain('Page 2');
    expect(buttons[0]?.getAttribute('aria-current')).toBe('true');
    expect(buttons[1]?.getAttribute('aria-current')).toBeNull();
    act(() => fire(buttons[1] as HTMLButtonElement, 'click'));
    expect(selected).toBe('p2');
    unmount();
  });
});

describe('AnnotationPins', () => {
  test('renders numbered pins and a linked note list', () => {
    let selected = '';
    const { container, unmount } = render(
      createElement(AnnotationPins, {
        alt: 'Wireframe',
        pins: [
          { id: 'a1', x: 20, y: 30, label: 'Header', note: 'Needs more contrast' },
          { id: 'a2', x: 80, y: 60, label: 'CTA' },
        ],
        activeId: 'a1',
        onSelect: (id: string) => {
          selected = id;
        },
      }),
    );
    expect(container.querySelector('[aria-label="Annotation 1: Header"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Annotation 2: CTA"]')).not.toBeNull();
    const text = container.textContent ?? '';
    expect(text).toContain('Needs more contrast');
    const notes = container.querySelectorAll('ol[aria-label="Annotations"] > li');
    expect(notes.length).toBe(2);
    act(() =>
      fire(
        container.querySelector('[aria-label="Annotation 2: CTA"]') as HTMLButtonElement,
        'click',
      ),
    );
    expect(selected).toBe('a2');
    unmount();
  });
});

describe('VersionHistory', () => {
  test('lists versions with a current badge and fires restore/download', () => {
    let downloaded = '';
    let restored = '';
    const { container, unmount } = render(
      createElement(VersionHistory, {
        versions: [
          { id: 'v2', label: 'v2', author: 'Ada', date: 'Today', current: true, size: '12 KB' },
          { id: 'v1', label: 'v1', author: 'Alan', date: 'Yesterday' },
        ],
        onDownload: (id: string) => {
          downloaded = id;
        },
        onRestore: (id: string) => {
          restored = id;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Current');
    expect(text).toContain('12 KB');
    expect(text).toContain('Ada · Today');
    const restore = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Restore',
    ) as HTMLButtonElement;
    expect(restore).toBeDefined();
    act(() => fire(restore, 'click'));
    expect(restored).toBe('v1');
    const dl = container.querySelectorAll('button')[0] as HTMLButtonElement;
    act(() => fire(dl, 'click'));
    expect(downloaded).toBe('v2');
    unmount();
  });
});

describe('DiffView', () => {
  test('derives added / removed / changed / unchanged rows', () => {
    const { container, unmount } = render(
      createElement(DiffView, {
        lines: [
          { left: 'const a = 1;', right: 'const a = 1;' },
          { left: 'const b = 2;', right: 'const b = 3;' },
          { right: 'const c = 4;' },
          { left: 'removed();' },
        ],
      }),
    );
    const html = container.innerHTML;
    expect(html).toContain('bg-success/12');
    expect(html).toContain('bg-danger/12');
    expect(html).toContain('bg-warning/12');
    expect(container.textContent).toContain('const b = 3;');
    expect(container.textContent).toContain('removed();');
    unmount();
  });

  test('shows an empty message when there is nothing to compare', () => {
    const { container, unmount } = render(createElement(DiffView, { lines: [] }));
    expect(container.textContent).toContain('No differences');
    unmount();
  });
});

describe('ReaderMode', () => {
  test('renders progress, byline and gates the size controls', () => {
    let changed = 0;
    const { container, unmount } = render(
      <ReaderMode
        title="The Long Read"
        byline="By Ada"
        progress={40}
        defaultSize={2}
        onSizeChange={() => {
          changed += 1;
        }}
      >
        <p>Body text</p>
      </ReaderMode>,
    );
    const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    const text = container.textContent ?? '';
    expect(text).toContain('The Long Read');
    expect(text).toContain('By Ada');

    const body = container.querySelector('.leading-relaxed') as HTMLElement;
    expect(body.className).toContain('text-base');
    const bigger = container.querySelector(
      '[aria-label="Increase text size"]',
    ) as HTMLButtonElement;
    act(() => fire(bigger, 'click'));
    expect(body.className).toContain('text-lg');
    expect(changed).toBe(1);

    const smaller = container.querySelector(
      '[aria-label="Decrease text size"]',
    ) as HTMLButtonElement;
    act(() => fire(smaller, 'click'));
    expect(body.className).toContain('text-base');
    unmount();
  });
});

describe('TocPanel', () => {
  test('renders entries with active highlight and reports selection', () => {
    let selected = '';
    const { container, unmount } = render(
      createElement(TocPanel, {
        items: [
          { id: 'intro', label: 'Introduction' },
          { id: 'setup', label: 'Setup' },
        ],
        activeId: 'setup',
        onSelect: (id: string) => {
          selected = id;
        },
      }),
    );
    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[1]?.getAttribute('aria-current')).toBe('true');
    act(() => fire(links[0] as HTMLAnchorElement, 'click'));
    expect(selected).toBe('intro');
    unmount();
  });

  test('collapses when collapsible', () => {
    const { container, unmount } = render(
      createElement(TocPanel, {
        items: [{ id: 'a', label: 'Alpha' }],
        collapsible: true,
      }),
    );
    const toggle = container.querySelector('button') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    act(() => fire(toggle, 'click'));
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    unmount();
  });
});
