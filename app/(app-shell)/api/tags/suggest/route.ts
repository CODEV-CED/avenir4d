import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const zQuery = z.object({
  q: z.string().trim().min(0).max(64).optional(),
  limit: z.coerce.number().min(1).max(20).default(8),
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = zQuery.parse({
      q: url.searchParams.get('q') ?? '',
      limit: url.searchParams.get('limit') ?? '8',
    });

    const q = parsed.q;
    if (!supabaseAdmin) {
      return NextResponse.json({ ok: true, tags: [] });
    }

    const builder = supabaseAdmin
      .from('tags')
      .select('label, popularity')
      .order('popularity', { ascending: false, nullsFirst: false })
      .limit(parsed.limit);

    const { data, error } = q ? await builder.ilike('label', `%${q}%`) : await builder;

    if (error) {
      console.error('tags.suggest error:', error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const tags = (data ?? []).map((r: any) => String(r.label)).filter(Boolean);
    return NextResponse.json({ ok: true, tags });
  } catch (e: any) {
    if (e?.issues) {
      return NextResponse.json(
        { ok: false, error: 'Bad query', details: e.issues },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}
