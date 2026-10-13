// src/core/database/unit-of-work.ts
import mongoose, { type ClientSession } from 'mongoose';
import { withRetry } from '../../utils/retry';
import { transactionContext } from './transaction-context';

export class UnitOfWork {
  async transaction<T>(callback: () => Promise<T>, retries = 3): Promise<T> {
    const existingSession = transactionContext.getStore()?.session;

    if (existingSession) {
      return callback();
    }

    return withRetry(
      async () => {
        const session = await mongoose.startSession();
        try {
          session.startTransaction();
          const result = await transactionContext.run({ session }, async () => callback());
          await session.commitTransaction();
          return result;
        } catch (error) {
          await session.abortTransaction();
          throw error;
        } finally {
          await session.endSession();
        }
      },
      {
        retries,

        shouldRetry: (error: unknown) =>
          typeof error === 'object' &&
          error !== null &&
          'errorLabels' in error &&
          Array.isArray((error as any).errorLabels) &&
          (error as any).errorLabels.includes('TransientTransactionError'),

        backoff: (attempt: number) => Math.min(100 * 2 ** (attempt - 1), 5000),
      },
    );
  }

  getSession(): ClientSession {
    const session = transactionContext.getStore()?.session;
    if (!session) {
      throw new Error('No active transaction');
    }
    return session;
  }

  isInTransaction(): boolean {
    return !!transactionContext.getStore();
  }
}
