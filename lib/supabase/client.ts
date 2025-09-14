import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/supabase/types';

export const supabase = createClientComponentClient<Database>();

export type SweetSpotProfileRow = Database['public']['Tables']['sweetspot_profiles']['Row'];
export type SweetSpotProfileInsert = Database['public']['Tables']['sweetspot_profiles']['Insert'];
export type SweetSpotProfileUpdate = Database['public']['Tables']['sweetspot_profiles']['Update'];

export type SweetSpotErrorRow = Database['public']['Tables']['sweetspot_errors']['Row'];
export type SweetSpotErrorInsert = Database['public']['Tables']['sweetspot_errors']['Insert'];
