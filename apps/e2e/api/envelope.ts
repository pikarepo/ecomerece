import { expect, type APIResponse } from '@playwright/test';
import type { ApiEnvelope, ApiErrorResponse } from '@ecomerece/shared';

type CursorMeta = {
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
};

type CursorPaginatedEnvelope<T> =
  | { success: true; data: { data: T[]; meta: CursorMeta } }
  | ApiErrorResponse;

const readOkPayload = async <T>(response: APIResponse): Promise<T> => {
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Expected a successful response, received ${response.status()}: ${body}`);
  }
  const payload: unknown = await response.json();
  return payload as T;
};

export const expectOk = async <T>(response: APIResponse): Promise<T> => {
  const payload = await readOkPayload<ApiEnvelope<T>>(response);
  expect(payload.success, `Expected a success envelope, received ${JSON.stringify(payload)}.`).toBe(
    true,
  );
  if (!payload.success) {
    throw new Error(payload.error.message);
  }
  return payload.data;
};

export const expectRawOk = async <T>(response: APIResponse): Promise<T> => {
  if (!response.ok()) {
    const body = await response.text();
    throw new Error(`Expected a successful response, received ${response.status()}: ${body}`);
  }
  return (await response.json()) as T;
};

export const expectError = async (
  response: APIResponse,
  code: string,
): Promise<ApiErrorResponse> => {
  expect(response.ok(), `Expected an error response, received ${response.status()}.`).toBeFalsy();
  const payload: unknown = await response.json();
  const envelope = payload as ApiEnvelope<unknown>;
  expect(envelope.success, `Expected an error envelope, received ${JSON.stringify(payload)}.`).toBe(
    false,
  );
  if (envelope.success) {
    throw new Error('Expected an error envelope.');
  }
  expect(envelope.error.code).toBe(code);
  return envelope;
};

export const expectPaginated = async <T>(
  response: APIResponse,
): Promise<{ data: T[]; meta: CursorMeta }> => {
  const payload = await readOkPayload<CursorPaginatedEnvelope<T>>(response);
  expect(payload.success, `Expected a success envelope, received ${JSON.stringify(payload)}.`).toBe(
    true,
  );
  if (!payload.success) {
    throw new Error(payload.error.message);
  }
  expect(Array.isArray(payload.data.data), 'Expected paginated data to be an array.').toBeTruthy();
  expect(typeof payload.data.meta.hasMore, 'Expected paginated meta to include hasMore.').toBe(
    'boolean',
  );
  return payload.data;
};
