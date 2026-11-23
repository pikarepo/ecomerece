import { expect, test, type APIResponse } from '@playwright/test';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type Finding = {
  id: string;
  severity: Severity;
  title: string;
  evidence: string;
};

/**
 * Attaches exploit evidence to the Playwright report so a red run shows what
 * was reached, not only which assertion failed.
 */
export const noteFinding = (finding: Finding): void => {
  test.info().annotations.push({
    type: `finding:${finding.severity}`,
    description: `${finding.id} ${finding.title} — ${finding.evidence}`,
  });
};

/**
 * Marks a test whose failure is the *current* state of the code. Playwright
 * turns it red once the behaviour is fixed, which is the reminder to delete the
 * marker and keep the assertion strict.
 */
export const knownOpen = (finding: Finding): void => {
  noteFinding(finding);
  test.fail(true, `${finding.id} is known open: ${finding.title}`);
};

export const readBodyText = async (response: APIResponse): Promise<string> => {
  try {
    return await response.text();
  } catch {
    return '';
  }
};

/**
 * A rejected attack must fail closed: no 2xx, and no server error either — a
 * 500 means the guard ran after the write attempt.
 */
export const expectRejected = async (response: APIResponse, label: string): Promise<string> => {
  const text = await readBodyText(response);
  const detail = `${label} returned ${response.status()} ${text.slice(0, 300)}`;
  expect(response.ok(), `${label} must not succeed. ${detail}`).toBe(false);
  expect(response.status(), `${label} must be a client rejection, not a server error. ${detail}`).toBeLessThan(
    500,
  );
  return text;
};

export const expectAuthRejected = async (response: APIResponse, label: string): Promise<void> => {
  await expectRejected(response, label);
  expect(
    [401, 403],
    `${label} must be rejected by authentication or authorization, received ${response.status()}.`,
  ).toContain(response.status());
};

/** Proves an error path does not echo protected values back to the caller. */
export const expectNoLeak = async (
  response: APIResponse,
  secrets: readonly string[],
  label: string,
): Promise<void> => {
  const text = await readBodyText(response);
  for (const secret of secrets) {
    expect(text, `${label} leaked ${secret} in its response body.`).not.toContain(secret);
  }
};

export const expectNoServerError = (responses: readonly APIResponse[], label: string): void => {
  const failed = responses.filter((response) => response.status() >= 500);
  expect(
    failed.map((response) => response.status()),
    `${label} produced server errors; a 5xx during an attack is an unhandled failure path.`,
  ).toEqual([]);
};

/**
 * Fires the same operation `count` times without awaiting in between, which is
 * how a double-spend or duplicate-allocation race is actually exploited.
 */
export const fireConcurrent = async <T>(
  count: number,
  fire: (index: number) => Promise<T>,
): Promise<T[]> => await Promise.all(Array.from({ length: count }, (_, index) => fire(index)));

export const statusesOf = (responses: readonly APIResponse[]): number[] =>
  responses.map((response) => response.status());

/**
 * The limiter buckets on `cf-connecting-ip` / `x-forwarded-for`, so each probe
 * gets its own client identity. Without this a 288-endpoint sweep exhausts the
 * 100 req/min bucket and every later assertion sees 429 instead of the real
 * status. The header trust weakness itself is asserted in the exploit suite.
 */
export const clientHeaders = (seed: number | string = Math.random()): Record<string, string> => {
  const value = String(seed).replaceAll(/\D/g, '').slice(-6) || '1';
  return { 'cf-connecting-ip': `10.${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4, 6)}` };
};

/** Bounded concurrency so a 288-endpoint sweep neither serialises nor floods. */
export const mapLimit = async <T, R>(
  items: readonly T[],
  limit: number,
  run: (item: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      const item = items[index] as T;
      results[index] = await run(item, index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};
