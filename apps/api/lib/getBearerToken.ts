export function getBearerToken(authHeader?: string) {
  if (!authHeader) return null;

  const [type, token] = authHeader.split(' ');

  if (type?.toLowerCase() !== 'bearer') return null;

  return token ?? null;
}
