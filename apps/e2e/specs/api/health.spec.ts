import { expect, test } from '../../fixtures';

test('health endpoint reports service availability', async ({ api, apiRoutes }) => {
  const response = await api.get(apiRoutes.health);

  expect(
    response.ok(),
    `Expected /health to be reachable, received ${response.status()}.`,
  ).toBeTruthy();
  const payload: unknown = await response.json();
  expect(payload).toEqual({ success: true, message: 'OK' });
});
