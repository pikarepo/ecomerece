import z from 'zod';

export const SupabaseIdStringSchema = z.string().uuid('Invalid Supabase UUID');

export const SupabaseIdV4Schema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    'Invalid Supabase UUID v4',
  );

export type SupabaseIdType = z.infer<typeof SupabaseIdStringSchema>;
export type SupabaseIdV4Type = z.infer<typeof SupabaseIdV4Schema>;

// Supabase IDs are already strings, so no conversion needed
export const toSupabaseId = (id: string): string => id;
