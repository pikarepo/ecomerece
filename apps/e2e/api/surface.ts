/**
 * Routes that are intentionally reachable without a session. Everything else
 * must answer 401/403 when called anonymously; that is what the auth-matrix
 * spec enforces for every registered endpoint.
 *
 * Adding an endpoint to this list is a security decision, which is why each
 * entry has to state why it is public.
 */
export type PublicEndpoint = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  path: string;
  reason: string;
};

export const publicEndpoints: readonly PublicEndpoint[] = [
  { method: 'GET', path: '/product', reason: 'public catalog listing' },
  { method: 'GET', path: '/product/:id', reason: 'public product detail' },
  { method: 'GET', path: '/product-variant/product/:id', reason: 'public variant listing' },
  { method: 'GET', path: '/product-variant/:id', reason: 'public variant detail' },
  { method: 'GET', path: '/review', reason: 'public review listing' },
  { method: 'GET', path: '/review/product/:id', reason: 'public reviews for a product' },
  { method: 'GET', path: '/review/:id', reason: 'public review detail' },
  { method: 'GET', path: '/product-inventory/variant/:id', reason: 'public availability' },
  { method: 'GET', path: '/category', reason: 'public category listing' },
  { method: 'GET', path: '/category/:id', reason: 'public category detail' },
  { method: 'GET', path: '/home', reason: 'public storefront home' },
  { method: 'GET', path: '/vendor', reason: 'public vendor listing' },
  { method: 'GET', path: '/vendor/:id', reason: 'public vendor profile' },
  { method: 'GET', path: '/shipping/track/:trackingNumber', reason: 'tracking number is the credential' },
  { method: 'GET', path: '/stats/_health', reason: 'stats subsystem health probe' },
  { method: 'POST', path: '/stats/public/products/:productId/view', reason: 'tracking beacon' },
  { method: 'POST', path: '/stats/public/products/:productId/click', reason: 'tracking beacon' },
  { method: 'POST', path: '/stats/public/categories/:categoryId/view', reason: 'tracking beacon' },
  { method: 'POST', path: '/stats/public/pages/:pageKey/view', reason: 'tracking beacon' },
  {
    method: 'POST',
    path: '/payment/webhook/:provider',
    reason: 'provider callback; authenticity is the provider signature, not a session',
  },
];

export const isPublicEndpoint = (method: string, path: string): boolean =>
  publicEndpoints.some(
    (endpoint) =>
      endpoint.method === method.toUpperCase() && endpoint.path === path.replace(/\/$/, ''),
  );

/** Replaces path params with harmless values so a probe reaches the handler. */
export const resolveProbePath = (path: string): string =>
  path
    .split('/')
    .map((segment) => {
      if (!segment.startsWith(':')) return segment;
      if (segment === ':provider') return 'manual';
      if (segment === ':entityType') return 'product';
      if (segment === ':pageKey') return 'home';
      return '0190f2c2-0000-7000-8000-000000000000';
    })
    .join('/');

export const endpointKey = (method: string, path: string): string =>
  `${method.toUpperCase()} ${path}`;
