// lib/supabase/formations-service.ts
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Facets, FormationRow, FormationsQuery, SortKey } from './formations-types';

// Si tu n'as pas encore les types générés Supabase,
// garde Database = any pour éviter les erreurs bloquantes.
type Database = any;

async function getClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              (
                cookieStore as unknown as {
                  set?: (name: string, value: string, options?: any) => void;
                }
              ).set?.(name, value, options);
            } catch {
              // In RSC context, cookies may be read-only; ignore failures.
            }
          });
        },
      },
    },
  );
}

const SELECT_COLUMNS = [
  'id',
  'nom',
  'type',
  'duree',
  'etablissement',
  'ville',
  'code_postal',
  'plaisir_tags',
  'competence_tags',
  'utilite_tags',
  'viabilite_data',
  'confidence',
  'image_url',
  'website',
  'ranking',
  'metiers',
].join(', ');

function applySort(qb: any, sort: SortKey | undefined) {
  switch (sort) {
    case 'name':
      return qb.order('nom', { ascending: true, nullsFirst: false });
    case 'duration':
      return qb.order('duree', { ascending: true, nullsFirst: true });
    case 'city':
      return qb.order('ville', { ascending: true, nullsFirst: false });
    case 'score':
    default:
      return qb.order('confidence', { ascending: false, nullsFirst: true });
  }
}

/**
 * Récupère la liste des formations avec filtres/tri/limite.
 * S’exécute côté serveur (Server Component).
 */
export async function fetchFormations(params: FormationsQuery): Promise<FormationRow[]> {
  const { types, city, durationMax, sort = 'score', limit = 24, offset = 0 } = params;

  const supabase = await getClient();

  let qb = supabase.from('formations').select(SELECT_COLUMNS);

  if (types && types.length) {
    qb = qb.in('type', types);
  }
  if (city) {
    qb = qb.eq('ville', city);
  }
  if (durationMax && Number.isFinite(durationMax)) {
    qb = qb.lte('duree', durationMax);
  }

  qb = applySort(qb, sort);

  // pagination
  const from = Math.max(0, offset);
  const to = Math.max(from, from + Math.max(1, limit) - 1);
  qb = qb.range(from, to);

  const { data, error } = await qb;

  if (error || !Array.isArray(data)) {
    console.error('[fetchFormations] supabase error:', error);
    return [];
  }

  // Cast sûr via unknown pour éviter l’erreur TS2352
  return data as unknown as FormationRow[];
}

/**
 * Facettes pour menus (types, villes) – uniques & triées.
 */
export async function fetchFacets(): Promise<Facets> {
  const supabase = await getClient();

  const { data, error } = await supabase.from('formations').select('type, ville');

  if (error || !Array.isArray(data)) {
    console.error('[fetchFacets] supabase error:', error);
    return { types: [], cities: [] };
  }

  const typesSet = new Set<string>();
  const citiesSet = new Set<string>();

  for (const row of data) {
    if (row.type) typesSet.add(String(row.type));
    if (row.ville) citiesSet.add(String(row.ville));
  }

  const types = Array.from(typesSet) as Facets['types'];
  const cities = Array.from(citiesSet).sort((a, b) => a.localeCompare(b, 'fr'));

  return { types, cities };
}
