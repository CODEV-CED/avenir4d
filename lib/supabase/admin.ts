// lib/supabase/admin.ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Client Supabase avec Service Role Key (bypass RLS)
 * ⚠️ JAMAIS exposer côté client - UNIQUEMENT en API routes
 */
export const createAdminClient = () => {
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Export legacy pour rétrocompatibilité si utilisé ailleurs
export const supabaseAdmin = createAdminClient();
