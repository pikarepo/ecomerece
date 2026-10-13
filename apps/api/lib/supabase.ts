import { createClient } from '@supabase/supabase-js';
import { NotFoundError } from '../errors/app-error';

// Initialize the Supabase admin client using the Service Role Key
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!, // Never expose this on the client!
  { auth: { persistSession: false } },
);

// Fetch user by their unique ID
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    throw new NotFoundError('User not found.');
  }

  return data.user;
}
