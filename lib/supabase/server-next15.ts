import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getServerSupabase() {
  const jar = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anon, {
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
  });
}
