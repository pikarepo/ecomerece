import { createClient } from '@supabase/supabase-js';
import { NotFoundError } from '../errors/app-error';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY.');
}

// Initialize the Supabase admin client using the Service Role Key
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false },
});

// Fetch user by their unique ID
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    throw new NotFoundError('User not found.');
  }

  return data.user;
}
