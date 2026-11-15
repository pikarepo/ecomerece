import { beforeAll, describe, expect, it } from 'bun:test';

const data = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => {
    data.set(key, value);
  },
  removeItem: (key: string) => {
    data.delete(key);
  },
  clear: () => data.clear(),
  key: (index: number) => [...data.keys()][index] ?? null,
  get length() {
    return data.size;
  },
};

const { storageAdapter } = await import('../storage-adapter.web');

describe('web storage adapter without a window', () => {
  it('fails the readiness probe and keeps item operations as no-ops', async () => {
    await expect(storageAdapter.ensureReady()).rejects.toThrow(
      'localStorage is not available in this environment',
    );
    expect(await storageAdapter.getItem('missing')).toBeNull();
    await storageAdapter.setItem('key', 'value');
    expect(await storageAdapter.getItem('key')).toBeNull();
    await storageAdapter.removeItem('key');
    await storageAdapter.clear();
  });
});

describe('web storage adapter with localStorage', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: localStorageMock },
      configurable: true,
    });
  });

  it('probes and cleans up its probe key on success', async () => {
    data.clear();

    await storageAdapter.ensureReady();

    expect(data.has('__storage_probe__')).toBe(false);
  });

  it('round-trips JSON values and removes them', async () => {
    await storageAdapter.setItem('profile', { name: 'Jane', roles: ['customer'] });

    expect(await storageAdapter.getItem('profile')).toEqual({
      name: 'Jane',
      roles: ['customer'],
    });

    await storageAdapter.removeItem('profile');
    expect(await storageAdapter.getItem('profile')).toBeNull();
  });

  it('returns null for a corrupt stored value', async () => {
    data.set('broken', '{not json}');

    expect(await storageAdapter.getItem('broken')).toBeNull();
  });

  it('stores primitive and boolean values as JSON', async () => {
    await storageAdapter.setItem('theme', true);

    expect(data.get('theme')).toBe('true');
    expect(await storageAdapter.getItem<boolean>('theme')).toBe(true);
  });

  it('clears everything', async () => {
    await storageAdapter.setItem('a', 1);
    await storageAdapter.setItem('b', 2);

    await storageAdapter.clear();

    expect(data.size).toBe(0);
  });
});
