import { AsyncLocalStorage } from 'node:async_hooks';
import type { ClientSession } from 'mongoose';

export const transactionContext = new AsyncLocalStorage<{
  session: ClientSession;
}>();

export function getCurrentSession() {
  return transactionContext.getStore()?.session;
}
