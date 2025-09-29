// Payload SJT pour POST API
export interface SJTSubmitPayload {
  choices: SJTChoice[];
  qual: QualInputs;
  profile4d: Profile4D;
  keywords?: Partial<Record<Dimension, string[]>>;
  surveyVersion?: 'sjt_v2';
  idempotencyKey?: string;
}
// lib/sweetspot/types.ts
export const DIMS = ['plaisir', 'competence', 'utilite', 'viabilite'] as const;
export type Dimension = (typeof DIMS)[number];
// alias compat si ailleurs tu utilises Dim
export type Dim = Dimension;

/** Scores 0..1 ; confidence_avg 1..5 (moyenne "brute" côté UI) */
export interface Profile4D {
  plaisir: number; // 0..1
  competence: number; // 0..1
  utilite: number; // 0..1
  viabilite: number; // 0..1
  confidence_avg: number; // 1..5
  version?: 1;
  source?: 'sjt_v2' | 'import' | 'manual';
}

/** Domaine minimal (utilisé côté UI) */
export interface SweetSpotProfile {
  base4d: Profile4D; // ← cohérent avec buildSweetSpotProfile(...)
  keywords: Partial<Record<Dimension, string[]>>;
  // extensions futures
  // convergences?: string[];
  // sweetSpotScore?: number;
}

/** Payload qualitatif (UI/API) */
export interface QualInputs {
  dimancheMatin: string;
  algoPersonnel: string;
  talentReconnu: string;
  indignationMax: string;
}

/** Enregistrement persisté (DB 💾) - camel en TS, snake en DB via mapping */
export interface SweetSpotRecord {
  id: string;
  profile4d: Profile4D;
  keywords: Partial<Record<Dimension, string[]>>;
  qual: QualInputs;
  metadata: {
    createdAt: string; // ISO
    updatedAt: string; // ISO
    surveyVersion: 'sjt_v2';
    userAgent?: string;
    completionTimeMs?: number;
  };
}

/** Dataset SJT (aligné avec ton QCM existant) */
export interface SJTScenario {
  id: string;
  scenario: string; // ex "Tu découvres un nouveau domaine..."
  dimensions: Dimension[]; // tags d'affichage
  options: SJTOption[];
}

export interface SJTOption {
  id: string;
  text: string;
  scores: Record<Dimension, number>; // 0..1
  confidence?: 1 | 2 | 3 | 4 | 5; // facultatif dans le dataset
}

/** Choix utilisateur (payload POST) */
export interface SJTChoice {
  questionId: string;
  optionId: string;
  confidence?: 1 | 2 | 3 | 4 | 5;
}

/** Contraintes business */
export interface BusinessConstraints {
  minViabilite: number; // ex 0.15
  maxEcart: number; // ex 0.40
  /** Seuil sur confidence_avg (1..5). Si tu vises la version pondérée 0..1, renomme-le. */
  minConfidenceAvg: number; // ex 3.0
}

export const DEFAULT_CONSTRAINTS: BusinessConstraints = {
  minViabilite: 0.15,
  maxEcart: 0.4,
  minConfidenceAvg: 3.0,
};

// ---- Sweet Spot Engine: shared result types ----
export type ResultMeta = {
  counts: { passions: number; talents: number; utilite: number; viabilite: number };
  overlaps: { x2: number; x3: number; x4: number };
  balanceFactor: number; // 0..1
  viabilityFactor: number; // 0..1
  baseline: number; // 0..1
  usedBaseline: boolean;
};

export type Convergence = {
  keyword: string;
  strength: number; // 0..1
  dims: Array<'passions' | 'talents' | 'utilite' | 'viabilite'>; // calcul interne
  matchedDimensions: Array<'passions' | 'talents' | 'utilite' | 'viabilite'>; // exposé au front
  boosted?: boolean;
  boostedBy?: string[];
};
