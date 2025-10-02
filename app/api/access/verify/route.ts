// app/api/access/verify/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ isPremium: false });
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single();

  if (error) {
    // Soft-fail : ne pas casser l'UX si profil absent
    console.error('[verify] Profile not found:', error);
    return NextResponse.json({ isPremium: false, error: 'profile_not_found' });
  }

  return NextResponse.json({ isPremium: !!data?.is_premium });
}
