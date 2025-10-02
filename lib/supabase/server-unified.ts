// lib/supabase/server-unified.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Retourne un client Supabase SSR avec gestion des cookies Next (Next 14/15 OK).
 * Nom clair et stable pour tout le code serveur.
 */
export async function createServerSupabase() {
  const jar = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(url, anon, {
    cookieEncoding: 'raw',
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(all) {
        all.forEach(({ name, value, options }) => {
          jar.set(name, value, options);
        });
      },
    },
  });
}

/** Aliases pour compat héritée (si du code existe déjà avec ces imports) */
export const createClient = createServerSupabase;
export const getServerSupabase = createServerSupabase;
