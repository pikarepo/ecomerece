import { authAdapter } from '@ecomerece/frontend/auth';
//frontend
import { HttpError } from './http-error';

// Default to the same-origin `/api` prefix: the Next.js web app rewrites
// `/api/*` → the Hono backend (see apps/web/next.config.ts), so the browser
// only ever talks to the host it loaded the page from. This works on
// localhost AND on LAN/public origins (192.168.x.x, VPS IPs, etc.), and
// avoids CORS + "localhost on the client machine" failures. Set
// NEXT_PUBLIC_API_URL to an absolute URL only for deployments that call the
// API directly (e.g. React Native/standalone clients).
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  await authAdapter.ensureReady();
  const token = await authAdapter.getToken();

  // 1. Include 'Content-Type' ONLY when a body is actually present
  const headers: Record<string, string> = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new HttpError(
      0,
      'NETWORK_ERROR',
      err instanceof Error ? err.message : 'Network request failed',
    );
  }

  // 2. Handle 204 No Content (matches c.noContent())
  if (response.status === 204 || response.status === 205) {
    return null as T;
  }

  // 3. Read response safely as text to handle empty bodies without throwing EOF errors
  const text = await response.text();
  if (!text.trim()) {
    if (!response.ok) {
      throw new HttpError(response.status, 'SERVER_ERROR', `HTTP Error ${response.status}`);
    }
    return null as T;
  }

  let payload: any;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new HttpError(response.status, 'INVALID_JSON', 'Server returned an unparseable response');
  }

  // 4. Map Hono registerErrorHandler structure: { success: false, error: { code, message, issues } }
  if (!response.ok || payload.success === false) {
    const errObj = payload.error || {};
    throw new HttpError(
      response.status,
      errObj.code || 'INTERNAL_ERROR',
      errObj.message || 'An unexpected error occurred',
      errObj.issues,
    );
  }

  // 5. Handle paginated vs standard payloads
  if (payload.meta !== undefined) {
    return { data: payload.data, meta: payload.meta } as T;
  }

  return (payload.data !== undefined ? payload.data : payload) as T;
}

function serializeBody(body: unknown): string | undefined {
  return body !== undefined ? JSON.stringify(body) : undefined;
}

export const http = {
  get: <T>(url: string, headers?: HeadersInit) => request<T>(url, { method: 'GET', headers }),

  post: <T>(url: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(url, { method: 'POST', body: serializeBody(body), headers }),

  patch: <T>(url: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(url, { method: 'PATCH', body: serializeBody(body), headers }),

  put: <T>(url: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(url, { method: 'PUT', body: serializeBody(body), headers }),

  delete: <T>(url: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(url, { method: 'DELETE', body: serializeBody(body), headers }),
};
