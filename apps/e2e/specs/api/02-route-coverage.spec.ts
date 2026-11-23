import { expect, test } from '../../fixtures';
import { collectRegisteredEndpoints } from '../../api/route-coverage';
import { endpointKey, publicEndpoints } from '../../api/surface';
import { surfaceBaseline } from '../../api/surface-baseline';

/**
 * Guards the HTTP surface itself. A new route has to be acknowledged here (and
 * classified by the auth matrix) before it can ship, which is what makes the
 * whole e2e layer a gate rather than a report.
 */
test.describe('api route surface', () => {
  test('matches the committed surface baseline', async () => {
    const observed = (await collectRegisteredEndpoints())
      .map((endpoint) => endpointKey(endpoint.method, endpoint.path))
      .sort();
    const expected = [...surfaceBaseline].sort();

    const added = observed.filter((key) => !expected.includes(key));
    const removed = expected.filter((key) => !observed.includes(key));

    expect(
      { added, removed },
      `The HTTP surface changed. Review the routes, then run \`bun apps/e2e/tools/generate-surface-baseline.ts\`:\nadded: ${added.join(', ') || 'none'}\nremoved: ${removed.join(', ') || 'none'}`,
    ).toEqual({ added: [], removed: [] });
  });

  test('mounts every module prefix', async () => {
    const prefixes = new Set(
      (await collectRegisteredEndpoints()).map((endpoint) => endpoint.path.split('/')[1]),
    );
    const expected = [
      'product',
      'product-variant',
      'review',
      'product-inventory',
      'order',
      'payment',
      'payout',
      'cart',
      'order-items',
      'order-request',
      'category',
      'address',
      'users',
      'vendor',
      'home',
      'shipping',
      'return',
      'promotion',
      'notification',
      'stats',
    ];

    expect(
      expected.filter((prefix) => !prefixes.has(prefix)),
      'A module prefix disappeared from the mounted routes.',
    ).toEqual([]);
  });

  test('keeps the public allowlist honest', async () => {
    const observed = new Set(
      (await collectRegisteredEndpoints()).map((endpoint) => endpointKey(endpoint.method, endpoint.path)),
    );

    const stale = publicEndpoints.filter(
      (endpoint) => !observed.has(endpointKey(endpoint.method, endpoint.path)),
    );

    expect(
      stale.map((endpoint) => endpointKey(endpoint.method, endpoint.path)),
      'The public allowlist references routes that no longer exist.',
    ).toEqual([]);
  });

  test('never publishes a scope-only route', async () => {
    const suspicious = publicEndpoints.filter((endpoint) =>
      /\/(vendor|admin)\//.test(endpoint.path),
    );

    expect(
      suspicious.map((endpoint) => `${endpointKey(endpoint.method, endpoint.path)} (${endpoint.reason})`),
      'A vendor/admin scoped route is declared public. That is a security decision, not a test fix.',
    ).toEqual([]);
  });
});
