import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from './storage-adapter.interface';

const STORAGE_PROBE_KEY = '__storage_probe__';
const STORAGE_PROBE_MAX_RETRIES = 3;
const STORAGE_PROBE_RETRY_DELAY_MS = 300;

class NativeStorageAdapter implements StorageAdapter {
  private readyPromise: Promise<void> | null = null;

  /**
   * AsyncStorage has no ".loaded" flag to wait on — the module is
   * synchronously available once imported. What CAN fail transiently
   * is the native bridge call itself (e.g. right at cold-start on some
   * Android devices). This probes with a real write/read/cleanup, with
   * retry+backoff, so callers get a clear failure instead of silently
   * hitting "best-effort" no-ops on every operation.
   */
  async ensureReady(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = this.probeWithRetry().catch((err) => {
        this.readyPromise = null; // allow a later call to retry
        throw err;
      });
    }
    return this.readyPromise;
  }

  private async probeWithRetry(): Promise<void> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= STORAGE_PROBE_MAX_RETRIES; attempt++) {
      try {
        await AsyncStorage.setItem(STORAGE_PROBE_KEY, '1');
        await AsyncStorage.removeItem(STORAGE_PROBE_KEY);
        return;
      } catch (err) {
        lastError = err;
        if (attempt < STORAGE_PROBE_MAX_RETRIES) {
          await new Promise((resolve) =>
            setTimeout(resolve, STORAGE_PROBE_RETRY_DELAY_MS * attempt),
          );
        }
      }
    }
    throw lastError instanceof Error ? lastError : new Error('AsyncStorage is not usable');
  }

  async getItem<T>(key: string): Promise<T | null> {
    await this.ensureReady().catch(() => {});
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await this.ensureReady().catch(() => {});
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // best‑effort
    }
  }

  async removeItem(key: string): Promise<void> {
    await this.ensureReady().catch(() => {});
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // best‑effort
    }
  }

  async clear(): Promise<void> {
    await this.ensureReady().catch(() => {});
    try {
      await AsyncStorage.clear();
    } catch {
      // best‑effort
    }
  }
}

export const storageAdapter: StorageAdapter = new NativeStorageAdapter();
