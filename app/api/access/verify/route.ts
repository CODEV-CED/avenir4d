// app/api/access/verify/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // garde ce chemin cohérent avec ta repo

export async function GET() {
  const supabase = await createClient();

  // 1) Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // non connecté → on répond proprement sans "error"
    return NextResponse.json({ isPremium: false }, { status: 200 });
  }

  // 2) Lire le profil
  const { data: profile, error: readErr } = await supabase
    .from('user_profiles')
    .select('is_premium, premium_since')
    .eq('id', user.id)
    .single();

  // 3) Auto-création si manquant
  // PostgREST "row not found" = code 'PGRST116' ; certains SDK renvoient simplement null sans error
  if (readErr?.code === 'PGRST116' || (!profile && !readErr)) {
    const { error: insertErr } = await supabase
      .from('user_profiles')
      .insert([{ id: user.id, is_premium: false }]);

    // même si l’insert échoue (RLS etc.), on reste silencieux côté UI
    return NextResponse.json({ isPremium: false }, { status: 200 });
  }

  // 4) Profil trouvé
  return NextResponse.json({
    isPremium: !!profile?.is_premium,
    premiumSince: profile?.premium_since ?? null,
  });
}
