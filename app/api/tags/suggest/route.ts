import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const supabase = await getSupabaseServerClient();
  const { searchParams } = new URL(req.url);
  const q = String(searchParams.get('q') ?? '').trim();
  const limit = Number(searchParams.get('limit') ?? 10);

  let query = supabase.from('tags').select('id, slug, label').limit(limit);

  if (q) {
    // startswith prioritaire, fallback trigram
    query = query.or(`label.ilike.${q}%,slug.ilike.${q}%`).order('label', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tags: data ?? [] });
}
