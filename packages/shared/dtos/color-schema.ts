import { z } from 'zod';

export const colorSchema = z
  .string()
  .regex(
    /^#([A-Fa-f0-9]{8}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    'Must be a valid hex color (e.g., #FFF, #123abc, or #RRGGBBAA)',
  );

export type colorType = z.infer<typeof colorSchema>;
