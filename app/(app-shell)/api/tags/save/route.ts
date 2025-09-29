import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { tags } = await req.json();
  if (!Array.isArray(tags)) {
    return NextResponse.json({ error: 'tags[] requis' }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const rows = tags.map((tag: string) => ({ user_id: user.id, tag }));
  const { error } = await supabase.from('user_tags').insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
