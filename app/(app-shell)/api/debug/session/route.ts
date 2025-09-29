import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase/server-next15';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }
  const jar = await cookies();
  const cookieNames = jar.getAll().map((c) => c.name);

  const supabase = await getServerSupabase();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  return NextResponse.json({
    ok: true,
    cookieNames,
    hasCookies: cookieNames.some((n) => n.includes('sb-') && n.includes('auth-token')),
    hasSession: Boolean(session),
    user,
    error: error?.message ?? null,
  });
}
