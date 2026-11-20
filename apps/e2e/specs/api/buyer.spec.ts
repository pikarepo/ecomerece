import type { UserResponseReadModel } from '@ecomerece/shared';
import { expectOk } from '../../api/envelope';
import { expect, test } from '../../fixtures';

test.beforeEach(async ({ canAuthenticateAs }) => {
  const authenticated = await canAuthenticateAs('buyer');
  test.skip(!authenticated, 'Buyer API token is not configured. Run with E2E_AUTH=refresh.');
});

test('buyer can read their own profile', async ({ api, apiRoutes }) => {
  const response = await api.get(`${apiRoutes.users}/my`);
  const me = await expectOk<UserResponseReadModel>(response);

  expect(me.id).toBeTruthy();
  expect(me.fullName).toBeTruthy();
  expect(['customer', 'vendor', 'admin']).toContain(me.role);
  expect(me.isDeleted).toBe(false);
});
