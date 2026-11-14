import type { ImageKey } from '../../../value-objects/image-key.vo';
import type { ImageStorageError } from '../errors/image-storage-errors';

export interface BatchItemResult<T> {
  /** The input key (or generated key) this entry refers to. */
  key: ImageKey;
  /** Result data when the operation succeeded. */
  data?: T;
  /** Provider-independent error when the operation failed. */
  error?: ImageStorageError;
  /** True if the failure is safe to retry later. */
  retryable?: boolean;
}

/**
 * Outcome of a multi-object operation. Individual failures are collected
 * instead of forcing the caller to re-issue one request per key, so
 * application code can build a per-id retry queue.
 */
export interface BatchResult<T> {
  succeeded: BatchItemResult<T>[];
  failed: BatchItemResult<T>[];
}
