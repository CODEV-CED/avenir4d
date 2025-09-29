import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const jar = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieEncoding: 'raw',
      cookies: {
        getAll() {
          return jar.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            jar.set(name, value, options);
          });
        },
      },
    },
  );

  try {
    const { event, session } = await req.json();
    if (event === 'SIGNED_IN' && session) {
      // Persist session cookies server-side
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      return NextResponse.json({ ok: true });
    }
    if (event === 'SIGNED_OUT') {
      await supabase.auth.signOut();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'bad request' }, { status: 400 });
  }
}
