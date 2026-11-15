import { describe, expect, it } from 'bun:test';
import { queryClient } from '../query-client';
import { HttpError } from '../http-error';

describe('HttpError', () => {
  it('keeps the status, code, message and issues', () => {
    const issues = [{ field: 'title', message: 'Too short' }];
    const error = new HttpError(422, 'VALIDATION_ERROR', 'Invalid payload', issues);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('HttpError');
    expect(error.status).toBe(422);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.message).toBe('Invalid payload');
    expect(error.issues).toEqual(issues);
  });

  it('reports a validation error only with at least one issue', () => {
    expect(new HttpError(422, 'VALIDATION_ERROR', 'x', [])).toMatchObject({
      isValidationError: false,
    });
    expect(
      new HttpError(422, 'VALIDATION_ERROR', 'x', [{ field: 'a', message: 'bad' }]),
    ).toMatchObject({ isValidationError: true });
    expect(new HttpError(500, 'INTERNAL_ERROR', 'x')).toMatchObject({
      isValidationError: false,
    });
  });

  it('reports network errors by code', () => {
    expect(new HttpError(0, 'NETWORK_ERROR', 'offline').isNetworkError).toBe(true);
    expect(new HttpError(500, 'INTERNAL_ERROR', 'boom').isNetworkError).toBe(false);
  });
});

describe('query client defaults', () => {
  const retry = queryClient.getDefaultOptions().queries?.retry as (
    failureCount: number,
    error: unknown,
  ) => boolean;

  it('retries network failures and 5xx at most twice', () => {
    expect(retry(0, new HttpError(0, 'NETWORK_ERROR', 'offline'))).toBe(true);
    expect(retry(0, new HttpError(500, 'INTERNAL_ERROR', 'boom'))).toBe(true);
    expect(retry(2, new HttpError(500, 'INTERNAL_ERROR', 'boom'))).toBe(false);
  });

  it('never retries client errors', () => {
    expect(retry(0, new HttpError(400, 'VALIDATION_ERROR', 'bad'))).toBe(false);
    expect(retry(0, new HttpError(404, 'NOT_FOUND', 'missing'))).toBe(false);
  });

  it('retries unknown errors like server errors', () => {
    expect(retry(0, new Error('socket hangup'))).toBe(true);
    expect(retry(2, new Error('socket hangup'))).toBe(false);
  });

  it('keeps a 30s stale time', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(30_000);
  });
});
