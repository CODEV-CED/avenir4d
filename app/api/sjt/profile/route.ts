// app/api/sjt/profile/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Paramètre "id" requis' }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();

  // ⚠️ Adapter les colonnes si ta table diffère
  const { data, error } = await supabase
    .from('sweetspot_profiles')
    .select('id, created_at, survey_version, profile4d, keywords, qual, raw_choices')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: 'Profil introuvable' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, profile: data });
}
