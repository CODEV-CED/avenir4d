// lib/supabase/browser.ts
import { createBrowserClient as createClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase public credentials');
}

/**
 * Client Supabase pour composants côté navigateur
 * Utilise les cookies pour persister la session
 */
export const createBrowserClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey);
};
