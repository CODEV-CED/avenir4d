import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server-next15';

export const runtime = 'nodejs';

type Params = { id: string };

export async function GET(_req: Request, { params: paramsPromise }: { params: Promise<Params> }) {
  const params = await paramsPromise;
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('formation_tags')
    .select('tag:tags(id, slug, label)')
    .eq('formation_id', params.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const tags = data?.map((row: any) => row.tag) ?? [];
  return NextResponse.json({ tags });
}

export async function POST(req: Request, { params: paramsPromise }: { params: Promise<Params> }) {
  const params = await paramsPromise;
  const supabase = await getServerSupabase();
  const { label } = (await req.json()) as { label: string };
  if (!label) return NextResponse.json({ error: 'label requis' }, { status: 400 });

  // 1) Upsert du tag
  const { data: upserted, error: fxError } = await supabase.rpc('upsert_tag', { _label: label });
  if (fxError) return NextResponse.json({ error: fxError.message }, { status: 500 });
  const tagId = upserted as unknown as string;

  // 2) Lier à la formation (dedupe via PK)
  const { error: linkErr } = await supabase
    .from('formation_tags')
    .upsert({ formation_id: params.id, tag_id: tagId }, { onConflict: 'formation_id,tag_id' });

  if (linkErr) return NextResponse.json({ error: linkErr.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params: paramsPromise }: { params: Promise<Params> }) {
  const params = await paramsPromise;
  const supabase = await getServerSupabase();
  const { tagId } = (await req.json()) as { tagId: string };
  if (!tagId) return NextResponse.json({ error: 'tagId requis' }, { status: 400 });

  const { error } = await supabase
    .from('formation_tags')
    .delete()
    .match({ formation_id: params.id, tag_id: tagId });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
