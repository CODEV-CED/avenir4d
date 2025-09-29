import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server-next15';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await getServerSupabase();

  try {
    const { event, session } = await req.json().catch(() => ({}) as any);

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      await supabase.auth.setSession({
        access_token: session?.access_token,
        refresh_token: session?.refresh_token,
      });
    } else if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut();
    }

    // Force une lecture pour Ã©mettre les Set-Cookie via Next
    const {
      data: { session: s },
    } = await supabase.auth.getSession();
    return NextResponse.json({ ok: true, hasSession: Boolean(s) });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'callback failed' },
      { status: 500 },
    );
  }
}

