// lib/supabase/formations-types.ts

export type FormationType =
  | 'BUT'
  | 'BTS'
  | 'CPGE'
  | 'LICENCE'
  | 'ECOLE_COM'
  | 'ECOLE_ING'
  | 'SANTE'
  | 'ARTS';

export interface FormationRow {
  id: string;
  nom: string;
  type: FormationType;
  duree: number;
  etablissement: string;
  ville: string;

  code_postal?: string | null;
  coordinates?: { type: 'Point'; coordinates: [number, number] } | null;

  attendus?: string[] | null;

  plaisir_tags?: string[] | null;
  competence_tags?: string[] | null;
  utilite_tags?: string[] | null;

  viabilite_data?: { taux_acces?: number; cout?: 'gratuit' | 'modere' | 'eleve' | string } | null;

  confidence?: number | null;

  debouches?: string[] | null;
  specialites_recommandees?: string[] | null;

  image_url?: string | null;
  website?: string | null;

  ranking?: { source?: string; position?: number; score?: number; year?: number } | null;
  metiers?: string[] | null;
}

export type SortKey = 'score' | 'name' | 'duration' | 'city';

export type FormationsQuery = {
  types?: FormationType[];
  city?: string | undefined;
  durationMax?: number | null;
  sort?: SortKey;
  limit?: number;
  offset?: number;
};

export type Facets = {
  types: FormationType[];
  cities: string[];
};
