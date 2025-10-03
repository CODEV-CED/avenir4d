// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // must be set in env

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: { 'x-application-name': 'avenir4d-webhook' },
    },
  });
}

// Backwards-compatible exports
// Some files in the codebase import `supabaseAdmin` or `createAdminClient`.
// Provide a singleton and an alias to avoid changing all callers.
export const supabaseAdmin = getSupabaseAdmin();
export const createAdminClient = getSupabaseAdmin;
