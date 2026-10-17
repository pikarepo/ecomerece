import { afterAll, describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import {
  AlbumCard,
  ArticleCard,
  BlogCard,
  MovieCard,
  MusicCard,
  NewsCard,
  PodcastCard,
  RecipeCard,
  VideoCard,
} from '../components/data/ContentCards';
import { registerDom, render, restoreDom } from './_dom';

registerDom();
afterAll(() => restoreDom());

describe('ArticleCard', () => {
  test('renders as an article and shows title, excerpt, category and meta', () => {
    const { container, unmount } = render(
      createElement(ArticleCard, {
        title: 'The long read',
        excerpt: 'A summary of the piece.',
        category: 'Culture',
        author: 'Alex Chen',
        date: 'Mar 3',
        readTime: '5 min read',
      }),
    );
    expect(container.firstElementChild?.tagName).toBe('ARTICLE');
    const text = container.textContent ?? '';
    expect(text).toContain('The long read');
    expect(text).toContain('A summary of the piece.');
    expect(text).toContain('Culture');
    expect(text).toContain('Alex Chen');
    expect(text).toContain('5 min read');
    unmount();
  });

  test('renders a link root when href is given', () => {
    const { container, unmount } = render(
      createElement(ArticleCard, { title: 'Linked', href: '/a/linked' }),
    );
    const root = container.firstElementChild as HTMLAnchorElement;
    expect(root.tagName).toBe('A');
    expect(root.getAttribute('href')).toBe('/a/linked');
    unmount();
  });
});

describe('BlogCard', () => {
  test('shows the author, tags and read time', () => {
    const { container, unmount } = render(
      createElement(BlogCard, {
        title: 'Post',
        author: { name: 'Mia Okafor' },
        tags: ['react', 'ui'],
        readTime: '8 min read',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Mia Okafor');
    expect(text).toContain('react');
    expect(text).toContain('ui');
    expect(text).toContain('8 min read');
    unmount();
  });
});

describe('NewsCard', () => {
  test('shows the section kicker, headline and source', () => {
    const { container, unmount } = render(
      createElement(NewsCard, {
        headline: 'Markets rally',
        section: 'Business',
        summary: 'Stocks climbed today.',
        source: 'Reuters',
        date: '1h ago',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Business');
    expect(text).toContain('Markets rally');
    expect(text).toContain('Reuters');
    expect(text).toContain('1h ago');
    unmount();
  });
});

describe('VideoCard', () => {
  test('renders a duration badge and a real play button when onPlay is set', () => {
    const { container, unmount } = render(
      createElement(VideoCard, {
        title: 'Watch this',
        duration: '12:04',
        channel: 'Channel',
        views: '1.2M views',
        onPlay: () => {},
      }),
    );
    expect(container.textContent).toContain('12:04');
    const button = container.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Play');
    unmount();
  });

  test('renders a decorative play overlay (no button) when linked', () => {
    const { container, unmount } = render(
      createElement(VideoCard, { title: 'Linked clip', href: '/v/1', duration: '3:00' }),
    );
    expect(container.querySelector('button')).toBeNull();
    expect(container.firstElementChild?.tagName).toBe('A');
    unmount();
  });
});

describe('AlbumCard / MusicCard', () => {
  test('shows artist, year and track count', () => {
    const { container, unmount } = render(
      createElement(AlbumCard, { title: 'Neon', artist: 'Rivers', year: 2024, tracks: 11 }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Neon');
    expect(text).toContain('Rivers');
    expect(text).toContain('2024');
    expect(text).toContain('11 tracks');
    unmount();
  });

  test('MusicCard is the same component as AlbumCard', () => {
    expect(MusicCard).toBe(AlbumCard);
  });
});

describe('PodcastCard', () => {
  test('shows the show name, episode number and duration', () => {
    const { container, unmount } = render(
      createElement(PodcastCard, {
        title: 'On systems',
        show: 'Deep Dive',
        episode: 42,
        duration: '48 min',
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Deep Dive');
    expect(text).toContain('Episode 42');
    expect(text).toContain('48 min');
    unmount();
  });
});

describe('MovieCard', () => {
  test('shows year, runtime, rating and genres', () => {
    const { container, unmount } = render(
      createElement(MovieCard, {
        title: 'Arrival',
        year: 2016,
        runtime: '116m',
        rating: 4,
        genres: ['Sci-Fi', 'Drama'],
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('Arrival');
    expect(text).toContain('2016');
    expect(text).toContain('116m');
    expect(text).toContain('Sci-Fi');
    const rating = container.querySelector('[role="img"][aria-label]') as HTMLElement;
    expect(rating.getAttribute('aria-label')).toBe('4 out of 5');
    unmount();
  });
});

describe('RecipeCard', () => {
  test('shows cook time, servings, difficulty and rating', () => {
    const { container, unmount } = render(
      createElement(RecipeCard, {
        title: 'Ramen',
        cookTime: '45 min',
        servings: 4,
        difficulty: 'medium',
        rating: 4.5,
      }),
    );
    const text = container.textContent ?? '';
    expect(text).toContain('45 min');
    expect(text).toContain('4');
    expect(text).toContain('medium');
    expect(text).toContain('4.5');
    unmount();
  });

  test('renders a placeholder when no image is supplied', () => {
    const { container, unmount } = render(createElement(RecipeCard, { title: 'No photo' }));
    expect(container.querySelector('img')).toBeNull();
    unmount();
  });
});
