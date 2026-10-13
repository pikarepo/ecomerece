import { z } from 'zod';

type Options = {
  maxItems?: number;
};

export const validateQueryArray = <T>(
  raw: unknown,
  key: string,
  schema: z.ZodType<T>,
  options: Options = {},
): T[] => {
  const max = options.maxItems ?? 50;

  const base = z.object({
    [key]: z.string().min(1),
  });

  const parsed = base.parse(raw);

  const arr = parsed[key].split(',').map((v: string) => v.trim());

  if (arr.length > max) {
    throw new Error(`Too many ${key} values (max ${max})`);
  }

  return arr.map((item) => schema.parse(item));
};
