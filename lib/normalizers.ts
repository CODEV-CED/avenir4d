// lib/normalizers.ts
// B3: Normalisation "tolérante en entrée" → "stricte en sortie" (compatible Zod)

import {
  FORMATIONS,
  FormationKey,
  FORMATION_HUMAN_TO_KEY,
  ATTENDUS,
  AttenduKey,
} from '@/data/controlled-vocab';

// =========================
// Types internes (entrée libre)
// =========================

export type DifficultyLevelLoose =
  | 'accessible'
  | 'modere'
  | 'ambitieux'
  | 'facile'
  | 'moyen'
  | 'avancé'
  | 'intermédiaire'
  | 'simple'
  | 'difficile'
  | 'complexe'
  | 'expert';

export type DurationLoose =
  | '1 semaine'
  | '2 semaines'
  | '3 semaines'
  | '4 semaines'
  | '5 semaines'
  | '6 semaines'
  | '1 mois'
  | '1.5 mois'
  | '2 mois'
  | '3 mois'
  | '6 mois'
  | 'trimestre'
  | 'semestre'
  | 'Année scolaire'
  | 'année'
  | 'annuel'
  | string;

// =========================
// Normalisation FORMATIONS
// =========================

// Variantes souples → libellé humain "officiel" → clé enum
const FORMATION_VARIATIONS: Record<string, FormationKey> = {
  // BUT
  'but info': 'BUT_INFO',
  'but informatique': 'BUT_INFO',
  'dut informatique': 'BUT_INFO',
  'but gea': 'BUT_GEA',
  'but gestion': 'BUT_GEA',
  'but mmi': 'BUT_MMI',
  multimédia: 'BUT_MMI',
  'but tc': 'BUT_TC',
  commerce: 'BUT_TC',
  'but geii': 'BUT_GEII',
  elec: 'BUT_GEII',
  'but gmp': 'BUT_GMP',
  'but chimie': 'BUT_CHIMIE',
  'carrières juridiques': 'BUT_CJ',

  // Licences
  'licence sciences pour l’ingénieur': 'LICENCE_SI',
  "licence sciences pour l'ingénieur": 'LICENCE_SI',
  'licence si': 'LICENCE_SI',
  'licence info com': 'LICENCE_INFO_COM',
  'licence communication': 'LICENCE_INFO_COM',
  'licence économie gestion': 'LICENCE_ECO_GEST',
  'licence droit': 'LICENCE_DROIT',
  'licence psycho': 'LICENCE_PSYCHO',
  'licence chimie': 'LICENCE_CHIMIE',
  'licence arts': 'LICENCE_ARTS',
  'licence staps': 'LICENCE_STAPS',

  // BTS
  'bts sio': 'BTS_SIO',
  'bts communication': 'BTS_COM',
  'bts com': 'BTS_COM',
  'bts mco': 'BTS_MCO',
  'bts électrotechnique': 'BTS_ELECTROTECH',
  'bts electro': 'BTS_ELECTROTECH',
  'bts design produit': 'BTS_DESIGN_PRODUITS',

  // CPGE
  mpsi: 'CPGE_MPSI',
  mp: 'CPGE_MPSI',
  pcsi: 'CPGE_PCSI',
  ecg: 'CPGE_ECG',

  // Bachelors / Écoles
  'bachelor design graphique': 'BACHELOR_DESIGN_GRAPH',
  'bachelor marketing digital': 'BACHELOR_MARKETING_DIGITAL',
  'bachelor design produit': 'BACHELOR_DESIGN_PRODUIT',
  'école d’ingénieurs': 'ECOLE_INGENIEUR_POSTBAC',
  'ecole ingenieur': 'ECOLE_INGENIEUR_POSTBAC',
  dnmade: 'DNMADE',
  'master droit du numérique': 'MASTER_DROIT_NUM',
  pass: 'PASS',
};

export function toFormationKeys(humanFormations: string[]): FormationKey[] {
  const keys = humanFormations
    .map((raw) => {
      const s = raw.toLowerCase().trim();

      // 1) variations directes
      for (const [variation, key] of Object.entries(FORMATION_VARIATIONS)) {
        if (s.includes(variation)) return key;
      }

      // 2) mapping humain officiel → clé (pont contrôlé)
      const fromHuman = FORMATION_HUMAN_TO_KEY[raw as keyof typeof FORMATION_HUMAN_TO_KEY];
      if (fromHuman) return fromHuman;

      // 3) fallback: match "contains" sur les clés humaines connues
      for (const [human, key] of Object.entries(FORMATION_HUMAN_TO_KEY)) {
        if (human.toLowerCase().includes(s) || s.includes(human.toLowerCase())) {
          return key;
        }
      }

      return undefined;
    })
    .filter(Boolean) as FormationKey[];

  // dédoublonner en conservant l’ordre d’apparition et vérifier qu’elles existent bien dans l’enum
  return Array.from(new Set(keys)).filter((k) => (FORMATIONS as readonly string[]).includes(k));
}

// =========================
// Normalisation ATTENDUS
// =========================

const ATTENDU_VARIATIONS: Record<string, AttenduKey> = {
  // Académiques
  'expression écrite': 'expression_ecrite',
  rédaction: 'expression_ecrite',
  écriture: 'expression_ecrite',
  oral: 'expression_orale',
  'parler en public': 'expression_orale',
  analyse: 'capacite_analyse',
  analytique: 'capacite_analyse',
  méthode: 'rigueur',
  méthodique: 'rigueur',
  précision: 'rigueur',
  abstraction: 'abstraction',
  'curiosité scientifique': 'curiosite_scientifique',

  // Personnelles
  créatif: 'creativite',
  créative: 'creativite',
  innovation: 'creativite',
  autonome: 'autonomie',
  indépendant: 'autonomie',
  organisé: 'organisation',
  planification: 'organisation',
  persévérance: 'perseverance',
  'esprit critique': 'esprit_critique',
  'vision spatiale': 'vision_spatiale',

  // Sociales
  équipe: 'travail_equipe',
  collaboration: 'travail_equipe',
  collectif: 'travail_equipe',
  relationnel: 'sens_relationnel',
  communication: 'sens_relationnel',
  leader: 'leadership',
  meneur: 'leadership',
  'ouverture culturelle': 'ouverture_culturelle',

  // Valeurs
  écologie: 'sensibilite_environnementale',
  environnement: 'sensibilite_environnementale',
  durable: 'sensibilite_environnementale',
  éthique: 'ethique',
  entrepreneur: 'esprit_entrepreneurial',
  entreprendre: 'esprit_entrepreneurial',
  business: 'esprit_entrepreneurial',
  esthétique: 'sens_esthetique',
  manuel: 'travail_manuel',
  pratique: 'esprit_pratique',
};

export function toAttenduKeys(humanAttendus: string[]): AttenduKey[] {
  const keys = humanAttendus
    .map((raw) => {
      const s = raw.toLowerCase().trim();

      // 1) variations directes
      for (const [variation, key] of Object.entries(ATTENDU_VARIATIONS)) {
        if (s.includes(variation)) return key;
      }

      // 2) match exact sur l’enum
      const direct = (ATTENDUS as readonly string[]).find((a) => a.toLowerCase() === s);
      if (direct) return direct as AttenduKey;

      // 3) match partiel (remplace _ par espace)
      const found = (ATTENDUS as readonly string[]).find((a) => {
        const label = a.replace(/_/g, ' ').toLowerCase();
        return label === s || label.includes(s) || s.includes(label);
      });
      if (found) return found as AttenduKey;

      return undefined;
    })
    .filter(Boolean) as AttenduKey[];

  return Array.from(new Set(keys));
}

// =========================
// Difficulté (entrée libre → schéma)
// =========================

/**
 * Sortie strictement compatible schema:
 * 'facile' | 'medium' | 'ambitieux'
 */
export function normalizeDifficultyToSchema(raw: string): 'facile' | 'medium' | 'ambitieux' {
  const s = raw.toLowerCase().trim();

  if (s.includes('facile') || s.includes('simple') || s.includes('accessible')) {
    return 'facile';
  }
  if (s.includes('moyen') || s.includes('modéré') || s.includes('intermédiaire')) {
    return 'medium';
  }
  if (
    s.includes('difficile') ||
    s.includes('avancé') ||
    s.includes('complexe') ||
    s.includes('expert') ||
    s.includes('ambitieux')
  ) {
    return 'ambitieux';
  }
  return 'medium';
}

// =========================
// Durée (entrée libre → schéma)
// =========================

/**
 * Sortie strictement compatible schema:
 * '2 semaines' | '3 semaines' | '4 semaines' | '1 mois'
 * + méta: realDuration (affichage) & longRun (badge)
 */
export function normalizeDurationToSchema(raw: string): {
  duration: '2 semaines' | '3 semaines' | '4 semaines' | '1 mois';
  realDuration: string;
  longRun?: boolean;
} {
  const s = raw.toLowerCase().trim();

  // Courtes
  if (s.includes('1 semaine')) return { duration: '2 semaines', realDuration: '1 semaine' };
  if (s.includes('2 semaine')) return { duration: '2 semaines', realDuration: '2 semaines' };
  if (s.includes('3 semaine')) return { duration: '3 semaines', realDuration: '3 semaines' };
  if (s.includes('4 semaine')) return { duration: '4 semaines', realDuration: '4 semaines' };

  // 5–6 semaines → 1 mois (proche)
  if (s.includes('5 semaine') || s.includes('6 semaine') || s.includes('1.5 mois')) {
    return { duration: '1 mois', realDuration: '6 semaines' };
  }

  // ≥ 2 mois → 1 mois + badge longRun
  if (s.includes('1 mois')) return { duration: '1 mois', realDuration: '1 mois' };
  if (s.includes('2 mois') || s.includes('deux mois') || s.includes('8 semaine')) {
    return { duration: '1 mois', realDuration: '2 mois', longRun: true };
  }
  if (s.includes('3 mois') || s.includes('trimestre')) {
    return { duration: '1 mois', realDuration: '3 mois', longRun: true };
  }
  if (s.includes('6 mois') || s.includes('semestre')) {
    return { duration: '1 mois', realDuration: '6 mois', longRun: true };
  }
  if (s.includes('année') || s.includes('annuel') || s.includes('an ')) {
    return { duration: '1 mois', realDuration: 'Année scolaire', longRun: true };
  }

  // Défaut
  return { duration: '3 semaines', realDuration: '3 semaines' };
}

// =========================
// Titres & clés projet
// =========================

export function sanitizeProjectTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\sÀ-ÿ'’-]/g, '')
    .slice(0, 80);
}

/**
 * Clé déterministe courte (client-safe)
 * NB: on reste sans crypto côté browser; convient pour cache local
 */
export function generateProjectKey(
  title: string,
  formations: FormationKey[],
  difficulty: 'facile' | 'medium' | 'ambitieux',
): string {
  const normalized = [
    sanitizeProjectTitle(title).toLowerCase(),
    ...Array.from(new Set(formations)).sort(),
    difficulty,
  ].join('_');

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  return `proj_${Math.abs(hash).toString(36)}`;
}

// =========================
// Validation rapide Parcoursup
// =========================

export function validateProjectForParcoursup(project: {
  suggestedFormations: FormationKey[];
  attendusLycee: AttenduKey[];
  miniProject: {
    difficulty: string;
    duration: string;
  };
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Formations: 2..5
  if (!project.suggestedFormations || project.suggestedFormations.length < 2) {
    errors.push('Au moins 2 formations Parcoursup requises');
  }
  if (project.suggestedFormations.length > 5) {
    errors.push('Maximum 5 formations recommandées');
  }

  // Attendus: 2..6 (note: notre Zod autorise 2..6)
  if (!project.attendusLycee || project.attendusLycee.length < 2) {
    errors.push('Au moins 2 attendus requis');
  }
  if (project.attendusLycee.length > 6) {
    errors.push('Maximum 6 attendus conseillés');
  }

  // Difficulté (normalisée)
  const diff = normalizeDifficultyToSchema(project.miniProject.difficulty);
  if (!['facile', 'medium', 'ambitieux'].includes(diff)) {
    errors.push('Niveau de difficulté invalide');
  }

  // Durée (normalisée)
  const dur = normalizeDurationToSchema(project.miniProject.duration);
  if (!['2 semaines', '3 semaines', '4 semaines', '1 mois'].includes(dur.duration)) {
    errors.push('Durée invalide');
  }

  return { isValid: errors.length === 0, errors };
}
