/**
 * Extract a bearer token from an `Authorization` header.
 *
 * Tolerates malformed headers: a missing `Bearer` prefix is accepted, and
 * repeated/duplicated `Bearer` segments (`Bearer Bearer <token>`) are collapsed.
 *
 * @example
 * getBearerToken('Bearer abc'); // 'abc'
 * getBearerToken('Bearer  Bearer abc'); // 'abc'
 * getBearerToken('abc'); // 'abc'
 */
export function getBearerToken(authHeader?: string) {
  if (!authHeader) return null;

  const parts = authHeader
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0 && part.toLowerCase() !== 'bearer');

  if (parts.length === 0) return null;

  return parts.join(' ');
}
