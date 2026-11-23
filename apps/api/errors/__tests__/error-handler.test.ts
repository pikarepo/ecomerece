import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { requestGuards } from '../../middleware/requestguard.middleware';
import { registerErrorHandler } from '../error-handler';

type ErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
    stack?: string;
  };
};

const buildApp = (): Hono => {
  const app = new Hono();
  app.use(
    '*',
    ...requestGuards({
      maxUrlLength: 200,
      maxQueryLength: 200,
      maxParamLength: 50,
      maxBodyBytes: 7_000_000,
      maxJsonDepth: 5,
      maxJsonNodes: 50,
    }),
  );
  app.post('/probe', (c) => c.json({ success: true }));
  app.post('/parse', async (c) => {
    await c.req.json();
    return c.json({ success: true });
  });
  registerErrorHandler(app);
  return app;
};

const readError = async (response: Response): Promise<ErrorEnvelope> =>
  (await response.json()) as ErrorEnvelope;

describe('registerErrorHandler with request guards', () => {
  it('preserves the 414 URI_TOO_LONG response', async () => {
    const response = await buildApp().request(`/probe?pad=${'a'.repeat(300)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
    });
    const payload = await readError(response);

    expect(response.status).toBe(414);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('URI_TOO_LONG');
    expect(payload.error.stack).toBeUndefined();
  });

  it('maps malformed JSON bodies to 400 VALIDATION_ERROR', async () => {
    const response = await buildApp().request('/parse', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"role":"admin"',
    });
    const payload = await readError(response);

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('VALIDATION_ERROR');
    expect(payload.error.stack).toBeUndefined();
  });

  it('preserves the 413 JSON_TOO_DEEP response', async () => {
    const response = await buildApp().request('/probe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ a: { b: { c: { d: { e: { f: 'too deep' } } } } } }),
    });
    const payload = await readError(response);

    expect(response.status).toBe(413);
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('JSON_TOO_DEEP');
    expect(payload.error.stack).toBeUndefined();
  });
});
