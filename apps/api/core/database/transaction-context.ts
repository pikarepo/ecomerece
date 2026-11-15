import { AsyncLocalStorage } from 'node:async_hooks';
import type { ClientSession } from 'mongoose';

export type TransactionStore = {
  session: ClientSession;
  afterCommit: (() => Promise<void> | void)[];
};

export const transactionContext = new AsyncLocalStorage<TransactionStore>();

export function getCurrentSession() {
  return transactionContext.getStore()?.session;
}
