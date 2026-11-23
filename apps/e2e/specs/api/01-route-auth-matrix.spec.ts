import { expect, test } from '../../fixtures';
import { clientHeaders, mapLimit } from '../../api/attack';
import { collectRegisteredEndpoints, type ApiEndpoint } from '../../api/route-coverage';
import { endpointKey, isPublicEndpoint, resolveProbePath } from '../../api/surface';

type ProbeResult = {
  key: string;
  isPublic: boolean;
  status: number;
  body: unknown;
};

const byModule = (endpoints: readonly ApiEndpoint[]): Map<string, ApiEndpoint[]> => {
  const groups = new Map<string, ApiEndpoint[]>();
  for (const endpoint of endpoints) {
    const moduleName = endpoint.path.split('/')[1] ?? 'root';
    groups.set(moduleName, [...(groups.get(moduleName) ?? []), endpoint]);
  }
  return groups;
};

/**
 * Every mounted route is probed anonymously. This is the guard that stops a new
 * endpoint from shipping without `authMiddleware`: the sweep is generated from
 * the route source, so a forgotten guard fails here without anyone updating a
 * test list.
 */
test.describe('api anonymous authz matrix', () => {
  test('every mounted route is reachable and auth-classified', async ({ anonymous }) => {
    expect(
      (await anonymous.get('/health')).status(),
      'The auth matrix needs the API to be running before it can classify routes.',
    ).toBe(200);

    const endpoints = await collectRegisteredEndpoints();
    expect(endpoints.length, 'Route discovery found no endpoints.').toBeGreaterThan(250);

    const results = await mapLimit(endpoints, 8,    async (endpoint, index): Promise<ProbeResult> => {
      const path = resolveProbePath(endpoint.path);
      const response = await anonymous.fetch(path, {
        method: endpoint.method,
        data: endpoint.method === 'GET' ? undefined : {},
        headers: clientHeaders(`${index}${Date.now()}`),
      });
      return {
        key: endpointKey(endpoint.method, endpoint.path),
        isPublic: isPublicEndpoint(endpoint.method, endpoint.path),
        status: response.status(),
        body: await response.json().catch(() => null),
      };
    });

    const problems: string[] = [];
    for (const result of results) {
      const label = `${result.key} -> ${result.status}`;
      if (result.status >= 500) {
        problems.push(`${label}: server error while unauthenticated`);
        continue;
      }
      if (result.isPublic) {
        if ([401, 403].includes(result.status)) {
          problems.push(`${label}: public route rejects anonymous callers`);
        }
        continue;
      }

      const body = result.body as { success?: boolean } | null;
      if (![401, 403].includes(result.status)) {
        problems.push(`${label}: protected route did not reject an anonymous caller`);
      } else if (body?.success !== false) {
        problems.push(`${label}: rejection was not an error envelope`);
      }
    }

    expect(
      problems,
      `Anonymous access control regressions:\n${problems.join('\n') || 'none'}`,
    ).toEqual([]);
  });

  test('vendor and admin scopes are refused to a signed-in buyer', async ({
    api,
    canAuthenticateAs,
  }) => {
    test.skip(!(await canAuthenticateAs('buyer')), 'Requires a buyer access token.');

    const endpoints = (await collectRegisteredEndpoints()).filter(
      (endpoint) =>
        /\/(vendor|admin)(\/|$)/.test(endpoint.path) &&
        !isPublicEndpoint(endpoint.method, endpoint.path),
    );

    const problems = await mapLimit(endpoints, 4, async (endpoint, index): Promise<string | null> => {
      const response = await api.fetch(resolveProbePath(endpoint.path), {
        method: endpoint.method,
        data: endpoint.method === 'GET' ? undefined : {},
        headers: clientHeaders(`${index}${Date.now()}`),
      });
      // Ownership checks may legitimately answer 400/404 for a buyer; what must
      // never happen is a buyer reaching a vendor/admin handler successfully.
      if (response.ok()) return `${endpointKey(endpoint.method, endpoint.path)} returned ${response.status()}`;
      if (response.status() >= 500) {
        return `${endpointKey(endpoint.method, endpoint.path)} raised ${response.status()}`;
      }
      return null;
    });

    const reached = problems.filter((problem): problem is string => problem !== null);
    expect(
      reached,
      `A buyer reached privileged handlers:\n${reached.join('\n') || 'none'}`,
    ).toEqual([]);
  });
});
