import { randomUUID } from 'node:crypto';
import { clientHeaders, expectNoServerError } from '../../api/attack';
import {
  exploitEvidence,
  hostileBody,
  loadExploitEndpoints,
  readPayload,
} from '../../api/exploit-support';
import { expect, test } from '../../fixtures';

const endpoints = loadExploitEndpoints();

const buildDeepBody = (depth: number): Record<string, unknown> => {
  let body: Record<string, unknown> = { leaf: true };
  for (let index = 0; index < depth; index += 1) body = { child: body };
  return body;
};

test.describe('api rate-limit, timeout, cache and recovery exploits', () => {
  test('a single client identity is rate limited and recovers with a new identity', async ({
    anonymous,
  }) => {
    const seed = randomUUID();
    const responses = await Promise.all(
      Array.from({ length: 80 }, () =>
        anonymous.get('/health', {
          headers: clientHeaders(seed),
          timeout: 10_000,
        }),
      ),
    );
    const statuses = responses.map((response) => response.status());
    expect(statuses, 'The limiter never returned 429 for 80 simultaneous requests.').toContain(429);
    expectNoServerError(responses, 'rate-limit sweep');

    const retry = await anonymous.get('/health', {
      headers: clientHeaders(`${seed}-retry`),
      timeout: 5_000,
    });
    expect(retry.status(), 'A fresh client identity could not retry after rate limiting.').toBe(
      200,
    );
    exploitEvidence('RATE-LIMIT', {
      statuses: statuses.reduce<Record<string, number>>((counts, status) => {
        counts[String(status)] = (counts[String(status)] ?? 0) + 1;
        return counts;
      }, {}),
      retry: retry.status(),
    });
  });

  test('rate-limit headers cannot be spoofed into bypassing the shared bucket', async ({
    anonymous,
  }) => {
    const seed = randomUUID();
    const responses = await Promise.all(
      Array.from({ length: 80 }, (_, index) =>
        anonymous.get('/health', {
          headers: {
            ...clientHeaders(seed),
            'x-forwarded-for': `203.0.113.${(index % 254) + 1}`,
          },
          timeout: 10_000,
        }),
      ),
    );
    const statuses = responses.map((response) => response.status());
    expect(statuses, 'Rotating x-forwarded-for bypassed the cf-connecting-ip bucket.').toContain(
      429,
    );
    exploitEvidence('RATE-SPOOF', {
      statuses: statuses.reduce<Record<string, number>>((counts, status) => {
        counts[String(status)] = (counts[String(status)] ?? 0) + 1;
        return counts;
      }, {}),
    });
  });

  test('malformed JSON is rejected without a server error or leaked internals', async ({
    anonymous,
  }) => {
    const writeEndpoints = endpoints.filter((endpoint) =>
      ['POST', 'PATCH', 'PUT', 'DELETE'].includes(endpoint.method),
    );
    expect(writeEndpoints.length).toBeGreaterThan(50);
    const responses = await Promise.all(
      writeEndpoints.slice(0, 40).map((endpoint) =>
        anonymous.fetch(endpoint.probePath, {
          method: endpoint.method,
          headers: {
            ...clientHeaders(`${endpoint.key}-malformed`),
            'content-type': 'application/json',
          },
          data: '{"broken":',
          timeout: 8_000,
        }),
      ),
    );
    expectNoServerError(responses, 'malformed JSON sweep');
    for (const response of responses) {
      const payload = await readPayload(response);
      expect(JSON.stringify(payload)).not.toMatch(/node_modules|stack\s*trace|MONGO_URI/i);
    }
    const recovery = await anonymous.get('/health', {
      headers: clientHeaders(`${randomUUID()}-malformed-recovery`),
    });
    expect(recovery.ok()).toBeTruthy();
    exploitEvidence('MALFORMED-JSON', {
      probed: responses.length,
      statuses: responses.map((response) => response.status()).slice(0, 20),
      recovery: recovery.status(),
    });
  });

  test('hostile bodies are rejected and the service stays retryable', async ({ anonymous }) => {
    const endpoint = endpoints.find((candidate) => candidate.key === 'POST /category/admin');
    expect(endpoint).toBeDefined();
    if (endpoint === undefined) return;
    const first = await anonymous.fetch(endpoint.probePath, {
      method: endpoint.method,
      headers: {
        ...clientHeaders(randomUUID()),
        'content-type': 'application/json',
      },
      data: JSON.stringify(hostileBody(randomUUID())),
      timeout: 8_000,
    });
    const second = await anonymous.get('/health', {
      headers: clientHeaders(randomUUID()),
      timeout: 5_000,
    });
    expect(first.ok()).toBeFalsy();
    expect(second.status()).toBe(200);
    exploitEvidence('RETRY-AFTER-REJECTION', {
      rejection: first.status(),
      retry: second.status(),
    });
  });

  test('request guards reject hostile URLs and deep JSON without server errors', async ({
    anonymous,
  }) => {
    const longUrl = await anonymous.get(`/product?pad=${'a'.repeat(10_000)}`, {
      headers: {
        ...clientHeaders(randomUUID()),
        'cf-connecting-ip': '203.0.113.201',
      },
      timeout: 8_000,
    });
    const deepJson = await anonymous.fetch('/category/admin', {
      method: 'POST',
      headers: {
        ...clientHeaders(randomUUID()),
        'cf-connecting-ip': '203.0.113.202',
        'content-type': 'application/json',
      },
      data: JSON.stringify(buildDeepBody(12)),
      timeout: 8_000,
    });
    const longPayload = await readPayload(longUrl);
    const deepPayload = await readPayload(deepJson);

    expect(longUrl.status(), 'A hostile URL returned a server error instead of 414.').toBe(414);
    expect(longPayload).toMatchObject({ success: false, error: { code: 'URI_TOO_LONG' } });
    expect(deepJson.status(), 'A hostile JSON body returned a server error instead of 413.').toBe(
      413,
    );
    expect(deepPayload).toMatchObject({ success: false, error: { code: 'JSON_TOO_DEEP' } });
    expect(`${JSON.stringify(longPayload)} ${JSON.stringify(deepPayload)}`).not.toMatch(
      /stack|node_modules|MONGO_URI/i,
    );
    exploitEvidence('GUARD-EXPLOIT', {
      longUrlStatus: longUrl.status(),
      deepJsonStatus: deepJson.status(),
    });
  });

  test('short timeouts do not leave the public surface unhealthy', async ({ anonymous }) => {
    const seed = randomUUID();
    let timedOut = false;
    let status = 0;
    try {
      const response = await anonymous.get('/product', {
        headers: clientHeaders(seed),
        timeout: 1,
      });
      status = response.status();
    } catch {
      timedOut = true;
    }
    const recovery = await anonymous.get('/health', {
      headers: clientHeaders(`${seed}-timeout-recovery`),
      timeout: 5_000,
    });
    expect(recovery.status(), 'A timed-out public request broke the service.').toBe(200);
    exploitEvidence('TIMEOUT', { timedOut, status, recovery: recovery.status() });
  });

  test('public responses are replay-stable and never carry private state', async ({
    admin,
    anonymous,
    canAuthenticateAs,
  }) => {
    const hasAdmin = await canAuthenticateAs('admin');
    const first = await anonymous.get('/product', { headers: clientHeaders(randomUUID()) });
    const second = await anonymous.get('/product', { headers: clientHeaders(randomUUID()) });
    expect(first.status()).toBe(second.status());
    expect(await second.text()).toBe(await first.text());
    expect(second.headers()['set-cookie']).toBeUndefined();
    expect(JSON.stringify(second.headers())).not.toMatch(/authorization|bearer/i);

    if (hasAdmin) {
      const authenticated = await admin.get('/order/admin/all', {
        headers: clientHeaders(randomUUID()),
      });
      expect(authenticated.headers()['set-cookie']).toBeUndefined();
      exploitEvidence('CACHE-AUTH', {
        publicStatus: second.status(),
        authenticatedStatus: authenticated.status(),
      });
    }
    exploitEvidence('CACHE-PUBLIC', {
      status: second.status(),
      cacheControl: second.headers()['cache-control'] ?? null,
    });
  });
});
