import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RawProfile = {
  id: string;
  created_at: string;
  survey_version: string | null;
  profile4d: Record<string, unknown> | null;
  keywords: Record<string, unknown> | null;
  qual: Record<string, unknown> | null;
  raw_choices: unknown;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Parametre id manquant' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('sweetspot_profiles')
    .select('id, created_at, profile4d, keywords, qual, survey_version, raw_choices')
    .eq('id', id)
    .maybeSingle<RawProfile>();

  if (error) {
    console.error('[sjt.profile] select error', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { ok: false, error: 'Introuvable ou acces interdit' },
      { status: 404 },
    );
  }

  const profile = {
    id: data.id,
    createdAt: data.created_at,
    surveyVersion: data.survey_version ?? 'sjt_v2',
    profile4d: data.profile4d ?? {},
    keywords: data.keywords ?? { passions: [], talents: [], utilite: [], viabilite: [] },
    qual: data.qual ?? {},
    rawChoices: data.raw_choices ?? null,
  };

  return NextResponse.json({ ok: true, profile });
}
