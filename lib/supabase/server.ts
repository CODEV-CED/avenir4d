// lib/supabase/server.ts
import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabaseServerClient() {
  const store = await cookies(); // par requête
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return store.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptionsWithName) {
          store.set({ name, value, ...options });
        },
        remove(name: string, options?: CookieOptionsWithName) {
          store.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );
}
