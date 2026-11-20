import type { UserResponseReadModel } from '@ecomerece/shared';
import { expectPaginated } from '../../api/envelope';
import { expect, test } from '../../fixtures';

test.beforeEach(async ({ canAuthenticateAs }) => {
  const authenticated = await canAuthenticateAs('admin');
  test.skip(
    !authenticated,
    'Admin API token is not configured. Set E2E_SUPABASE_REFRESH_TOKEN_ADMIN.',
  );
});

test('admin can list users', async ({ apiAs, apiRoutes }) => {
  const api = await apiAs('admin');
  const response = await api.get(`${apiRoutes.users}/admin/all?limit=10`);
  const { data, meta } = await expectPaginated<UserResponseReadModel>(response);

  expect(data.length).toBeLessThanOrEqual(10);
  expect(typeof meta.hasMore).toBe('boolean');
  if (meta.hasMore) {
    expect(meta.nextCursor).toBeTruthy();
  }
  for (const user of data) {
    expect(user.id).toBeTruthy();
  }
});
