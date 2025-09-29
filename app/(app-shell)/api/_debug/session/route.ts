import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const jar = await cookies();
  const supa = createServerClient(
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
  const {
    data: { user },
  } = await supa.auth.getUser();
  return NextResponse.json({ user });
}
