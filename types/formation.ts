export interface ViabiliteData {
  taux_acces: number; // 0..1
  cout: 'gratuit' | 'modere' | 'eleve' | 'inconnu';
}

export interface FormationStatic {
  id: string;
  nom: string;
  type: 'BUT' | 'BTS' | 'CPGE' | 'LICENCE' | 'ECOLE_COM' | 'ECOLE_ING' | 'SANTE' | 'ARTS';
  duree: number;
  etablissement: string;
  ville?: string;
  code_postal?: string;
  coordinates?: { type: 'Point'; coordinates: [number, number] };
  attendus?: string[];
  plaisir_tags: string[];
  competence_tags: string[];
  utilite_tags: string[];
  viabilite_data: ViabiliteData;
  confidence: number;
  debouches?: string[];
  specialites_recommandees?: string[];
  image_url?: string;
}
