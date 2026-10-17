/** @jsxImportSource react */

import { afterAll, describe, expect, it } from 'bun:test';
import { Box, Clock, Star } from 'lucide-react';
import { useState } from 'react';
import { SiteSearch, type SiteSearchItem, type SiteSearchSection } from '../components/navigation';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(restoreDom);

function queryInput(): HTMLInputElement {
  return document.body.querySelector('input[role="combobox"]') as HTMLInputElement;
}

function optionEls(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll('[role="option"]')) as HTMLElement[];
}

function optionText(): string[] {
  return optionEls().map((el) => el.textContent ?? '');
}

async function typeQuery(text: string) {
  await act(async () => {
    const el = queryInput();
    el.value = text;
    fire(el, 'input');
  });
}

function trendingSections(): SiteSearchSection[] {
  return [
    {
      id: 'trending',
      label: 'Trending',
      items: [
        { id: 'tr-1', label: 'Trail Runner', hint: 'Products', icon: Star },
        { id: 'tr-2', label: 'Wool Socks', hint: 'Accessories', icon: Box },
      ],
    },
    {
      id: 'recent',
      label: 'Recent',
      items: [{ id: 'rc-1', label: 'Rain Shell', hint: 'Last search', icon: Clock }],
    },
  ];
}

function resultSections(): SiteSearchSection[] {
  return [
    {
      id: 'products',
      label: 'Products',
      items: [
        { id: 'p-1', label: 'Trail Runner', keywords: ['shoes'] },
        { id: 'p-2', label: 'Trail Socks', keywords: ['wool'] },
        { id: 'p-3', label: 'Mountain Jacket', keywords: ['rain'] },
      ],
    },
    {
      id: 'docs',
      label: 'Docs',
      items: [
        { id: 'd-1', label: 'Shipping policy', keywords: ['delivery'] },
        { id: 'd-2', label: 'Returns', keywords: ['refund'], disabled: true },
      ],
    },
  ];
}

function dialogEl(): HTMLElement | null {
  return document.body.querySelector('[role="dialog"]');
}

class FakeRecognition {
  static instances: FakeRecognition[] = [];
  lang = '';
  continuous = false;
  interimResults = false;
  started = 0;
  stopped = 0;
  onresult: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onend: (() => void) | null = null;

  constructor() {
    FakeRecognition.instances.push(this);
  }

  start() {
    this.started += 1;
  }

  stop() {
    this.stopped += 1;
  }

  abort() {}
}

describe('batch 79 site search', () => {
  it('renders nothing while closed', () => {
    const { unmount } = render(
      <SiteSearch
        open={false}
        onClose={() => {}}
        trending={trendingSections()}
        sections={resultSections()}
      />,
    );
    expect(dialogEl()).toBeNull();
    unmount();
  });

  it('renders the overlay when open', () => {
    const { unmount } = render(
      <SiteSearch
        open
        onClose={() => {}}
        trending={trendingSections()}
        sections={resultSections()}
      />,
    );
    expect(dialogEl()).not.toBeNull();
    expect(queryInput()).not.toBeNull();
    unmount();
  });

  it('shows trending sections while the query is empty', () => {
    const { unmount } = render(
      <SiteSearch
        open
        onClose={() => {}}
        trending={trendingSections()}
        sections={resultSections()}
      />,
    );
    expect(optionText()).toEqual([
      'Trail RunnerProducts',
      'Wool SocksAccessories',
      'Rain ShellLast search',
    ]);
    unmount();
  });

  it('filters sections by label and keywords when typing', async () => {
    const { unmount } = render(
      <SiteSearch
        open
        onClose={() => {}}
        trending={trendingSections()}
        sections={resultSections()}
      />,
    );
    await typeQuery('trail');
    expect(optionText()).toEqual(['Trail Runner', 'Trail Socks']);
    await typeQuery('rain');
    expect(optionText()).toEqual(['Mountain Jacket']);
    unmount();
  });

  it('shows an empty state when nothing matches', async () => {
    const { unmount } = render(
      <SiteSearch
        open
        onClose={() => {}}
        trending={trendingSections()}
        sections={resultSections()}
      />,
    );
    await typeQuery('unicorns');
    const empty = document.body.querySelector('[role="listbox"] p');
    expect(empty?.textContent).toContain('No results');
    expect(optionEls()).toHaveLength(0);
    unmount();
  });

  it('cycles active row with ArrowDown and ArrowUp', async () => {
    const { unmount } = render(
      <SiteSearch
        open
        onClose={() => {}}
        trending={trendingSections()}
        sections={resultSections()}
      />,
    );
    const input = queryInput();
    await act(async () => {
      fire(input, 'keydown', { key: 'ArrowDown' });
    });
    expect(optionEls()[1].getAttribute('aria-selected')).toBe('true');
    await act(async () => {
      fire(input, 'keydown', { key: 'ArrowDown' });
      fire(input, 'keydown', { key: 'ArrowDown' });
    });
    // three trending rows → 1 → 2 → 0 (wraps)
    expect(optionEls()[0].getAttribute('aria-selected')).toBe('true');
    await act(async () => {
      fire(input, 'keydown', { key: 'ArrowUp' });
    });
    expect(optionEls()[2].getAttribute('aria-selected')).toBe('true');
    unmount();
  });

  it('calls onSelect for the active item and closes', async () => {
    const selected: string[] = [];
    let closed = 0;
    const sections: SiteSearchSection[] = [
      {
        id: 'products',
        label: 'Products',
        items: [
          { id: 'p-1', label: 'Trail Runner', onSelect: () => selected.push('p-1') },
          { id: 'p-2', label: 'Wool Socks', onSelect: () => selected.push('p-2') },
        ] as SiteSearchItem[],
      },
    ];
    const { unmount } = render(
      <SiteSearch open onClose={() => closed++} trending={[]} sections={sections} />,
    );
    const input = queryInput();
    // separate acts: React batches updates inside one act, so a queued keydown
    // still sees the pre-`active` render.
    await act(async () => {
      fire(input, 'keydown', { key: 'ArrowDown' });
    });
    await act(async () => {
      fire(input, 'keydown', { key: 'Enter' });
    });
    expect(selected).toEqual(['p-2']);
    expect(closed).toBe(1);
    unmount();
  });

  it('submits the trimmed query on Enter when no row matches', async () => {
    const submitted: string[] = [];
    let closed = 0;
    const { unmount } = render(
      <SiteSearch
        open
        onClose={() => closed++}
        trending={[]}
        sections={resultSections()}
        onSubmit={(q) => submitted.push(q)}
      />,
    );
    await typeQuery('  new order  ');
    const input = queryInput();
    await act(async () => {
      fire(input, 'keydown', { key: 'Enter' });
    });
    expect(submitted).toEqual(['new order']);
    expect(closed).toBe(1);
    unmount();
  });

  it('supports controlled value/onValueChange', async () => {
    const Ctl = () => {
      const [v, setV] = useState('ra');
      return (
        <SiteSearch
          open
          onClose={() => {}}
          value={v}
          onValueChange={setV}
          trending={[]}
          sections={resultSections()}
        />
      );
    };
    const { unmount } = render(<Ctl />);
    expect(queryInput().value).toBe('ra');
    await typeQuery('rain');
    expect(queryInput().value).toBe('rain');
    unmount();
  });

  it('closes when the scrim is clicked', async () => {
    let closed = 0;
    const { unmount } = render(
      <SiteSearch
        open
        onClose={() => closed++}
        trending={trendingSections()}
        sections={resultSections()}
      />,
    );
    const scrim = document.body.querySelector('[role="presentation"]') as HTMLElement | null;
    await act(async () => {
      if (scrim) fire(scrim, 'click');
    });
    expect(closed).toBe(1);
    unmount();
  });

  it('exposes a voice button inside the field', async () => {
    const { unmount } = render(
      <SiteSearch open onClose={() => {}} trending={[]} sections={resultSections()} />,
    );
    const voice = document.body.querySelector('button[aria-label*="voice" i]') as HTMLButtonElement;
    expect(voice).not.toBeNull();
    expect(voice.getAttribute('aria-label')).toBe('Voice search unavailable');
    unmount();
  });

  it('submits on final voice transcript when submitOnVoice is true', async () => {
    FakeRecognition.instances = [];
    (window as any).SpeechRecognition = FakeRecognition;
    const submitted: string[] = [];
    let closed = 0;
    const { unmount } = render(
      <SiteSearch
        open
        onClose={() => closed++}
        trending={[]}
        sections={[]}
        submitOnVoice
        onSubmit={(q) => submitted.push(q)}
      />,
    );
    const voice = document.body.querySelector(
      'button[aria-label="Search by voice"]',
    ) as HTMLButtonElement;
    expect(voice.disabled).toBe(false);
    await act(async () => {
      fire(voice, 'click');
    });
    const inst = FakeRecognition.instances[0];
    await act(async () => {
      inst.onresult?.({
        resultIndex: 0,
        results: [{ isFinal: true, length: 1, 0: { transcript: 'red shoes' } }],
      });
    });
    expect(submitted).toEqual(['red shoes']);
    expect(closed).toBe(1);
    delete (window as any).SpeechRecognition;
    unmount();
  });
});
