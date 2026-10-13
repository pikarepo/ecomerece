import { BadRequestError } from '../errors/app-error';

type AnyRecord = Record<string, any>;

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function sanitizeData<T extends AnyRecord>(
  disallowedFields: readonly string[],
  data: T,
): Partial<T> {
  if (!data || typeof data !== 'object') {
    throw new BadRequestError('The provided data is invalid.');
  }

  const disallowedSet = new Set(disallowedFields);

  const sanitized = Object.entries(data).reduce(
    (acc, [key, value]) => {
      if (DANGEROUS_KEYS.has(key)) return acc;

      if (disallowedSet.has(key)) return acc;

      if (value === undefined) return acc;

      acc[key as keyof T] = value;
      return acc;
    },
    {} as Partial<T>,
  );

  if (Object.keys(sanitized).length === 0) {
    throw new BadRequestError('No valid fields were provided for the update.');
  }

  return sanitized;
}
