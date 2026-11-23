import { expect, test } from '../../fixtures';

/**
 * The first thing every other suite assumes: the API answers, its envelope is
 * intact, and an unauthenticated caller is stopped at the door.
 */
test.describe('api health', () => {
  test('reports healthy', async ({ anonymous, apiRoutes }) => {
    const response = await anonymous.get(apiRoutes.health);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ success: true, message: 'OK' });
  });

  test('rejects an anonymous call to a protected route', async ({ anonymous }) => {
    const response = await anonymous.get('/users/my');

    expect(response.status()).toBe(401);
    expect((await response.json()).success).toBe(false);
  });

  test('rejects a forged bearer token', async ({ anonymous }) => {
    const response = await anonymous.get('/users/my', {
      headers: { Authorization: 'Bearer e2e-forged-token' },
    });

    expect(response.status()).toBe(401);
    expect((await response.json()).success).toBe(false);
  });

  test('returns a structured error envelope for unknown routes', async ({ anonymous }) => {
    const response = await anonymous.get('/e2e-route-that-does-not-exist');

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(typeof body.error.code).toBe('string');
  });
});
