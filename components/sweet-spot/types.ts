// components/sweet-spot/types.ts
// B3: Contrat de types unifié UI ⇄ Worker (sans casser vos exports actuels)

import type { DimKey, SliderValues, UserKeywords, FilterMode } from './types/dimensions';

// ⚠️ On continue d’exposer vos types existants
export * from './types/index';

// ==============================
// UI State (existant)
// ==============================
export interface UIState {
  sliderValues: SliderValues;
  userKeywords: UserKeywords;
  selectedTags: string[];
  sweetSpotScore: number;
  filterMode: FilterMode;
}

export const initialUIState: UIState = {
  sliderValues: { passions: 0.25, talents: 0.25, utilite: 0.25, viabilite: 0.25 },
  userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
  selectedTags: [],
  sweetSpotScore: 0,
  filterMode: 'union',
};

// ==============================
// B3 — Types partagés Worker ⇄ UI
// ==============================

// Convergences calculées par le worker
export type Convergence = {
  id: string;
  formula: string[]; // ex: ['NSI', 'écologie']
  result: string; // ex: 'NSI × écologie'
  description: string; // pitch court
  example: string; // mini-projet/exemple
  score: number; // 0..1
  confidence: number; // 0..1
  viability: 'high' | 'medium' | 'low';
};

// Résultat complet du PRECOMPUTE
export type WorkerResult = {
  sweetSpotScore: number; // 0..1
  isEureka: boolean; // true si sweetSpotScore >= 0.7 (règle actuelle)
  analysis: {
    strongestDimension: DimKey;
    weakestDimension: DimKey;
    balance: number; // équilibre des sliders 0..1
    maturity: number; // densité mots-clés 0..1
    coherence: number; // stabilité globale 0..1
  };
  insights: {
    nextSteps: string[];
    recommendations: string[];
    warnings?: string[];
  };
  convergences: Convergence[];
};

// Payload attendu par le worker pour PRECOMPUTE
export type ComputePayload = {
  sliders: SliderValues;
  keywords: UserKeywords;
  tags: string[];
  mode: FilterMode; // 'union' | 'intersection'
};

// Messages in/out du worker
export type InMsg = { type: 'PING' } | { type: 'PRECOMPUTE'; payload: ComputePayload };

export type OutMsg = { type: 'PONG' } | { type: 'PRECOMPUTE_RESULT'; payload: WorkerResult };
