//frontend
// packages/store/lib/http-error.ts
//
// The one error type that ever leaves http-client.ts. Mirrors AppError's
// shape (code, message, issues) so a Hook or Component can branch on
// error.code exactly the way a backend caller would branch on AppError
// subclasses — without ever seeing the raw envelope.

import type { ApiIssue } from '@ecomerece/shared';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly issues?: ApiIssue[],
  ) {
    super(message);
    this.name = 'HttpError';
  }

  /** True for the Zod/Mongoose validation shape — safe to render per-field. */
  get isValidationError(): boolean {
    return this.code === 'VALIDATION_ERROR' && !!this.issues?.length;
  }

  /** True for network failures where the request never reached the server. */
  get isNetworkError(): boolean {
    return this.code === 'NETWORK_ERROR';
  }
}
