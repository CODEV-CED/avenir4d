import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';

export const supabaseBrowser = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

export type SweetSpotProfileRow = Database['public']['Tables']['sweetspot_profiles']['Row'];
export type SweetSpotProfileInsert = Database['public']['Tables']['sweetspot_profiles']['Insert'];
export type SweetSpotProfileUpdate = Database['public']['Tables']['sweetspot_profiles']['Update'];

export type SweetSpotErrorRow = Database['public']['Tables']['sweetspot_errors']['Row'];
export type SweetSpotErrorInsert = Database['public']['Tables']['sweetspot_errors']['Insert'];
