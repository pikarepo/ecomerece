import { mkdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const lockPath = join(tmpdir(), 'hono-e2e-vendor-ledger.lock');
const staleAfterMs = 180_000;
const waitTimeoutMs = 120_000;

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const isStale = async (): Promise<boolean> => {
  try {
    const info = await stat(lockPath);
    return Date.now() - info.mtimeMs > staleAfterMs;
  } catch {
    return false;
  }
};

export const acquireVendorLedgerLock = async (): Promise<void> => {
  const deadline = Date.now() + waitTimeoutMs;

  for (;;) {
    try {
      await mkdir(lockPath);
      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      if (await isStale()) {
        await rm(lockPath, { recursive: true, force: true });
        continue;
      }
      if (Date.now() >= deadline) throw new Error('Timed out waiting for the vendor ledger lock.');
      await sleep(50);
    }
  }
};

export const releaseVendorLedgerLock = async (): Promise<void> => {
  await rm(lockPath, { recursive: true, force: true });
};

export const withVendorLedgerLock = async <T>(work: () => Promise<T>): Promise<T> => {
  await acquireVendorLedgerLock();
  try {
    return await work();
  } finally {
    await releaseVendorLedgerLock();
  }
};
