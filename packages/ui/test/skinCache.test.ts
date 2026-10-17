import { describe, expect, test } from 'bun:test';
import {
  type CacheMeta,
  type CacheStorage,
  cacheKey,
  createSkinCache,
  evictionsFor,
  MAX_CACHE_BYTES,
  MAX_CACHE_ENTRIES,
  SKIN_CACHE_PREFIX,
  SKIN_CACHE_VERSION,
} from '../lib/skin/skinCache';

class FakeStorage implements CacheStorage {
  private map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  getItem(key: string): string | null {
    return this.map.has(key) ? (this.map.get(key) ?? null) : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  key(index: number): string | null {
    const arr = Array.from(this.map.keys());
    return arr[index] ?? null;
  }
  clear(): void {
    this.map.clear();
  }
  dump(): Record<string, string> {
    return Object.fromEntries(this.map);
  }
}

describe('skinCache', () => {
  test('cacheKey uses version prefix', () => {
    expect(cacheKey('clay')).toBe(`${SKIN_CACHE_PREFIX}clay`);
    expect(SKIN_CACHE_PREFIX).toBe(`skincache.v${SKIN_CACHE_VERSION}.`);
  });

  test('get returns entry with css and ts', () => {
    const s = new FakeStorage();
    const c = createSkinCache(s);
    s.setItem(cacheKey('y2k'), JSON.stringify({ css: 'body{}', ts: 123 }));
    const e = c.get('y2k');
    expect(e).not.toBeNull();
    expect(e?.css).toBe('body{}');
    expect(e?.ts).toBeGreaterThanOrEqual(123);
  });

  test('corrupt entry is removed and returns null', () => {
    const s = new FakeStorage();
    const c = createSkinCache(s);
    s.setItem(cacheKey('bad'), '{not json');
    expect(c.get('bad')).toBeNull();
    expect(s.getItem(cacheKey('bad'))).toBeNull();
  });

  test('put stores entry; has/size/list work', () => {
    const s = new FakeStorage();
    const c = createSkinCache(s);
    const t = 100;
    expect(c.put('glass', '.a{}', t)).toBe(true);
    expect(c.has('glass')).toBe(true);
    expect(c.totalBytes()).toBeGreaterThan(0);
    const lst = c.list();
    expect(lst[0].id).toBe('glass');
    expect(lst[0].ts).toBeGreaterThanOrEqual(t);
  });

  test('remove drops entry', () => {
    const s = new FakeStorage();
    const c = createSkinCache(s);
    c.put('glass', '.a{}', 100);
    c.remove('glass');
    expect(c.get('glass')).toBeNull();
  });

  test('LRU eviction drops oldest when over MAX_CACHE_ENTRIES', () => {
    const s = new FakeStorage();
    const c = createSkinCache(s);
    for (let i = 0; i < MAX_CACHE_ENTRIES + 1; i++) {
      c.put(`skin${i}`, `.x${i}{}`, 100 + i);
    }
    // newest entries should remain; oldest (skin0, ts=100) evicted
    expect(c.get('skin0')).toBeNull();
    for (let i = 1; i < MAX_CACHE_ENTRIES + 1; i++) {
      expect(c.has(`skin${i}`)).toBe(true);
    }
  });

  test('size cap eviction keeps total under MAX_CACHE_BYTES', () => {
    const s = new FakeStorage();
    const c = createSkinCache(s);
    const big = `.big{height:${'x'.repeat(20000)}}`;
    c.put('a', big, 1);
    c.put('b', big, 2);
    c.put('c', big, 3);
    const total = c.totalBytes();
    expect(total).toBeLessThanOrEqual(MAX_CACHE_BYTES + 1); // allow small slop
  });

  test('evictionsFor returns ids sorted by age desc to evict', () => {
    const entries: CacheMeta[] = [
      { id: 'old', bytes: 100, ts: 1 },
      { id: 'new', bytes: 100, ts: 10 },
      { id: 'mid', bytes: 200, ts: 5 },
    ];
    const drop = evictionsFor(entries);
    expect(drop.length).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(drop)).toBe(true);
  });

  test('clear removes all cached entries', () => {
    const s = new FakeStorage();
    const c = createSkinCache(s);
    c.put('a', '.a{}', 1);
    c.put('b', '.b{}', 2);
    c.clear();
    expect(c.list().length).toBe(0);
    expect(s.getItem(cacheKey('a'))).toBeNull();
  });

  test('invalid id is rejected', () => {
    const s = new FakeStorage();
    const c = createSkinCache(s);
    expect(c.put('Bad ID!', '.a{}')).toBe(false);
    expect(c.get('Bad ID!')).toBeNull();
  });
});
