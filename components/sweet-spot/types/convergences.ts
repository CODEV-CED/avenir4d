// components/sweet-spot/types/convergences.ts
import type { DimKey } from './dimensions';

/** Convergence côté UI (ex: SAMPLE_CONVERGENCES) */
export type UIConvergence = {
  id: string;
  formula: string[];
  result: string;
  description: string;
  example?: string;
  score?: number;
  matchedDimensions?: string[];
};

/** Convergence côté moteur IA (utilisée par ia-service) */
export type EngineConvergence = {
  id: string;
  dimensions: [DimKey, DimKey] | DimKey[];
  keywords: [string, string] | string[];
  strength: number; // 0..1
  description: string;
};

/** Adaptateur sûr Engine -> UI */
export const toUIConvergence = (e: EngineConvergence): UIConvergence => {
  const kwds = Array.isArray(e.keywords) ? e.keywords : [];
  const title =
    kwds.length >= 2 ? `${kwds[0]} × ${kwds[1]}` : kwds.length === 1 ? kwds[0] : 'Proposition';

  return {
    id: e.id,
    formula: kwds.map(String),
    result: title,
    description: e.description ?? '',
    example: '',
    score: typeof e.strength === 'number' ? e.strength : undefined,
    matchedDimensions: Array.isArray(e.dimensions) ? e.dimensions : undefined,
  };
};
/** Helper de masse */
export const toUIConvergences = (arr: EngineConvergence[]): UIConvergence[] =>
  (arr || []).map(toUIConvergence);

// Convergence “canonique” exportée (alias pratique)
export type Convergence = EngineConvergence;
