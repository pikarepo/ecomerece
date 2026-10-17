/** @jsxImportSource react */

import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import {
  fmtTime,
  LyricsView,
  NowPlayingBar,
  PlaylistRow,
  PodcastRow,
  PosterCard,
  QueuePanel,
  ThumbnailGrid,
} from '../components/data/MediaDisplay';
import { act, fire, registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('fmtTime', () => {
  test('formats seconds as m:ss', () => {
    expect(fmtTime(0)).toBe('0:00');
    expect(fmtTime(125)).toBe('2:05');
    expect(fmtTime(605)).toBe('10:05');
    expect(fmtTime(-3)).toBe('0:00');
  });
});

describe('ThumbnailGrid', () => {
  test('renders tiles with durations, selection and select callback', () => {
    let picked = '';
    const { container, unmount } = render(
      createElement(ThumbnailGrid, {
        items: [
          { id: 'a', label: 'Intro clip', duration: '0:42', playing: true },
          { id: 'b', label: 'Demo reel', src: '/thumbs/b.jpg' },
        ],
        selectedId: 'a',
        onSelect: (id: string) => {
          picked = id;
        },
      }),
    );
    const tiles = container.querySelectorAll('button');
    expect(tiles.length).toBe(2);
    expect(container.textContent).toContain('Intro clip');
    expect(container.textContent).toContain('0:42');
    expect(container.textContent).toContain('Now playing');
    expect(tiles[0].getAttribute('aria-pressed')).toBe('true');
    expect(tiles[1].getAttribute('aria-pressed')).toBe('false');
    const img = container.querySelector('img');
    expect(img?.getAttribute('alt')).toBe('Demo reel');
    act(() => fire(tiles[1], 'click'));
    expect(picked).toBe('b');
    unmount();
  });
});

describe('PosterCard', () => {
  test('shows title, meta and badge and fires the play button', () => {
    let played = 0;
    const { container, unmount } = render(
      createElement(PosterCard, {
        title: 'Night Falls',
        meta: '2026 · Drama',
        alt: 'Night Falls poster',
        badge: 'NEW',
        onPlay: () => {
          played += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Night Falls');
    expect(text).toContain('2026 · Drama');
    expect(text).toContain('NEW');
    const play = container.querySelector('button') as HTMLButtonElement;
    expect(play.getAttribute('aria-label')).toBe('Play Night Falls');
    act(() => fire(play, 'click'));
    expect(played).toBe(1);
    unmount();
  });

  test('omits the play button without onPlay', () => {
    const { container, unmount } = render(
      createElement(PosterCard, { title: 'Silent Film', alt: 'poster' }),
    );
    expect(container.querySelector('button')).toBeNull();
    unmount();
  });
});

describe('PlaylistRow', () => {
  test('shows track meta and toggles play and like controls', () => {
    let plays = 0;
    let likes = 0;
    const { container, unmount } = render(
      createElement(PlaylistRow, {
        title: 'Starlight',
        artist: 'Muse',
        duration: '4:17',
        playing: true,
        liked: true,
        onPlay: () => {
          plays += 1;
        },
        onLike: () => {
          likes += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Starlight');
    expect(text).toContain('Muse');
    expect(text).toContain('4:17');
    const playBtn = container.querySelector('[aria-label="Pause Starlight"]') as HTMLButtonElement;
    const likeBtn = container.querySelector('[aria-label="Like Starlight"]') as HTMLButtonElement;
    expect(likeBtn.getAttribute('aria-pressed')).toBe('true');
    act(() => fire(playBtn, 'click'));
    act(() => fire(likeBtn, 'click'));
    expect(plays).toBe(1);
    expect(likes).toBe(1);
    unmount();
  });

  test('paused row offers Play and an unpressed like', () => {
    const { container, unmount } = render(
      createElement(PlaylistRow, { title: 'Calypso', liked: false, onPlay: () => {} }),
    );
    expect(container.querySelector('[aria-label="Play Calypso"]')).not.toBeNull();
    unmount();
  });
});

describe('PodcastRow', () => {
  test('renders show meta, listen progress and download/play actions', () => {
    let downloads = 0;
    let plays = 0;
    const { container, unmount } = render(
      createElement(PodcastRow, {
        title: 'Ep. 42 — Systems',
        show: 'Ship It',
        date: 'Oct 14',
        duration: '48 min',
        progress: 0.35,
        onDownload: () => {
          downloads += 1;
        },
        onPlay: () => {
          plays += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Ep. 42 — Systems');
    expect(text).toContain('Ship It · Oct 14');
    expect(text).toContain('48 min');
    expect(text).toContain('35%');
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-valuenow')).toBe('35');
    const dl = container.querySelector('[aria-label="Download Ep. 42 — Systems"]');
    const playBtn = container.querySelector('[aria-label="Play Ep. 42 — Systems"]');
    act(() => fire(dl as HTMLElement, 'click'));
    act(() => fire(playBtn as HTMLElement, 'click'));
    expect(downloads).toBe(1);
    expect(plays).toBe(1);
    unmount();
  });
});

describe('NowPlayingBar', () => {
  test('exposes a labelled seek slider with times and transport', () => {
    let seeked = -1;
    const { container, unmount } = render(
      createElement(NowPlayingBar, {
        title: 'Weightless',
        artist: 'Marconi Union',
        playing: false,
        elapsed: 72,
        duration: 200,
        onSeek: (s: number) => {
          seeked = s;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Weightless');
    expect(text).toContain('Marconi Union');
    expect(text).toContain('1:12');
    expect(text).toContain('3:20');
    expect(container.querySelector('[aria-label="Now playing controls"]')).not.toBeNull();
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    expect(slider.getAttribute('aria-label')).toBe('Seek');
    expect(slider.getAttribute('aria-valuenow')).toBe('72');
    expect(slider.getAttribute('aria-valuetext')).toBe('1:12 of 3:20');
    act(() => fire(slider, 'keydown', { key: 'ArrowRight' }));
    expect(seeked).toBe(77);
    act(() => fire(slider, 'keydown', { key: 'ArrowLeft' }));
    expect(seeked).toBe(67);
    act(() => fire(slider, 'keydown', { key: 'End' }));
    expect(seeked).toBe(200);
    act(() => fire(slider, 'keydown', { key: 'Home' }));
    expect(seeked).toBe(0);
    unmount();
  });

  test('toggles playback through the reused transport', () => {
    let toggled = 0;
    const { container, unmount } = render(
      createElement(NowPlayingBar, {
        title: 'Ada',
        playing: false,
        elapsed: 0,
        duration: 60,
        onPlayPause: () => {
          toggled += 1;
        },
      }),
    );
    const play = container.querySelector('[aria-label="Play"]') as HTMLButtonElement;
    act(() => fire(play, 'click'));
    expect(toggled).toBe(1);
    unmount();
  });
});

describe('LyricsView', () => {
  const lines = [
    { id: 'l1', text: 'Row the boat ashore', timeMs: 12_000 },
    { id: 'l2', text: 'Stars are out tonight' },
    { id: 'l3', text: 'And we drift along' },
  ];

  test('marks the active line with aria-current and an accent rail', () => {
    const { container, unmount } = render(createElement(LyricsView, { lines, activeId: 'l2' }));
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(3);
    expect(items[1].getAttribute('aria-current')).toBe('true');
    expect(items[0].getAttribute('aria-current')).toBeNull();
    const activeSpan = items[1].querySelector('span') as HTMLElement;
    expect(activeSpan.className).toContain('border-accent');
    expect(activeSpan.className).toContain('font-medium');
    const idleSpan = items[0].querySelector('span') as HTMLElement;
    expect(idleSpan.className).toContain('border-transparent');
    unmount();
  });

  test('reports line clicks when handlers are wired', () => {
    let picked = '';
    const { container, unmount } = render(
      createElement(LyricsView, {
        lines,
        activeId: 'l1',
        onLineClick: (id: string) => {
          picked = id;
        },
      }),
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(3);
    act(() => fire(buttons[2], 'click'));
    expect(picked).toBe('l3');
    unmount();
  });
});

describe('QueuePanel', () => {
  const items = [
    { id: 'q1', title: 'First', artist: 'A', duration: '3:01' },
    { id: 'q2', title: 'Second', artist: 'B' },
    { id: 'q3', title: 'Third', artist: 'C' },
  ];

  test('lists the queue, marks the current track and wires controls', () => {
    let selected = '';
    let moved = '';
    let removed = '';
    let cleared = 0;
    const { container, unmount } = render(
      createElement(QueuePanel, {
        items,
        currentId: 'q2',
        onSelect: (id: string) => {
          selected = id;
        },
        onMove: (from: number, to: number) => {
          moved = `${from}->${to}`;
        },
        onRemove: (id: string) => {
          removed = id;
        },
        onClear: () => {
          cleared += 1;
        },
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('3 tracks');
    expect(text).toContain('First');
    expect(text).toContain('3:01');
    const rows = container.querySelectorAll('li');
    expect(rows[1].getAttribute('aria-current')).toBe('true');
    expect(rows[0].getAttribute('aria-current')).toBeNull();

    const upFirst = container.querySelector('[aria-label="Move First up"]') as HTMLButtonElement;
    expect(upFirst.disabled).toBe(true);

    const downFirst = container.querySelector('[aria-label="Move First down"]');
    act(() => fire(downFirst as HTMLElement, 'click'));
    expect(moved).toBe('0->1');

    const removeSecond = container.querySelector('[aria-label="Remove Second"]');
    act(() => fire(removeSecond as HTMLElement, 'click'));
    expect(removed).toBe('q2');

    const titleBtns = container.querySelectorAll('ol button');
    act(() => fire(titleBtns[0], 'click'));
    expect(selected).toBe('q1');

    const clear = container.querySelector('header button') as HTMLButtonElement;
    act(() => fire(clear, 'click'));
    expect(cleared).toBe(1);
    unmount();
  });

  test('shows an empty state and omits reorder controls without handlers', () => {
    const { container, unmount } = render(createElement(QueuePanel, { items: [] }));
    expect(container.textContent).toContain('Queue is empty');
    expect(container.querySelector('[aria-label^="Move"]')).toBeNull();
    expect(container.querySelector('[aria-label^="Remove"]')).toBeNull();
    unmount();
  });
});
