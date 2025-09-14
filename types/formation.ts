// /types/formation.ts
export interface ViabiliteData {
  taux_acces?: number; // 0..1
  cout?: 'gratuit' | 'modere' | 'eleve' | 'inconnu' | string;
}

export type FormationType =
  | 'BUT'
  | 'BTS'
  | 'CPGE'
  | 'LICENCE'
  | 'ECOLE_COM'
  | 'ECOLE_ING'
  | 'SANTE'
  | 'ARTS';

export type Ranking = {
  source: string; // ex: "L'Étudiant"
  year: number; // ex: 2024
  position: number; // ex: 12 (classement national)
  domain?: string; // ex: "BUT Informatique" ou "Écoles d'ingénieurs"
  url?: string; // lien vers la source
};

export interface FormationStatic {
  id: string;
  nom: string;
  type: FormationType;
  duree: number;
  etablissement: string;
  ville: string;
  code_postal?: string;
  coordinates?: { type: 'Point'; coordinates: [number, number] };

  attendus?: string[];

  plaisir_tags?: string[];
  competence_tags?: string[];
  utilite_tags?: string[];

  viabilite_data?: {
    taux_acces?: number; // 0..1
    cout?: 'gratuit' | 'modere' | 'eleve' | string;
  };

  confidence: number; // 0..1

  debouches?: string[];
  specialites_recommandees?: string[];
  image_url?: string;

  /** URL officielle de la formation/établissement (si dispo dans le dataset) */
  website?: string;

  /** Classement éventuel – totalement optionnel */
  ranking?: { source?: string; position?: number; score?: number; year?: number };

  /** Débouchés / métiers au format tags */
  metiers?: string[];
}
