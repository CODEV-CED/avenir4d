// app/api/formations/by-ids/route.ts
import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server-next15'; // Next 15-safe helper

export const runtime = 'nodejs';
type Payload = { ids: string[] };

export const dynamic = 'force-dynamic'; // lecture cookies => route dynamique (optionnel)

export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();

    const { ids } = (await req.json()) as Payload;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Paramètre "ids" requis (string[])' }, { status: 400 });
    }

    const { data, error } = await supabase.from('formations').select('*').in('id', ids);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erreur serveur' }, { status: 500 });
  }
}
