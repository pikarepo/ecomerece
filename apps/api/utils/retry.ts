// src/utils/retry.ts

export interface RetryOptions {
  retries?: number;
  shouldRetry?: (error: unknown) => boolean;
  backoff?: (attempt: number) => number;
}

/**
 * Executes an asynchronous operation with retry logic.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    retries = 3,
    shouldRetry = (error: unknown) =>
      typeof error === 'object' &&
      error !== null &&
      'errorLabels' in error &&
      Array.isArray((error as any).errorLabels) &&
      (error as any).errorLabels.includes('TransientTransactionError'),
    backoff = (attempt: number) => Math.min(100 * 2 ** (attempt - 1), 5000),
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error) || attempt === retries) {
        throw error;
      }

      if (backoff) {
        await new Promise((resolve) => setTimeout(resolve, backoff(attempt)));
      }
    }
  }

  throw lastError;
}
