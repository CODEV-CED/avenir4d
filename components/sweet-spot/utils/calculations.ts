// components/sweet-spot/utils/calculations.ts
import type { SliderValues, FilterMode } from '@sweet-spot/types';
import type { UIConvergence } from '@sweet-spot/types/convergences';
import { SWEETSPOT_CONFIG } from '@sweet-spot/constants';

export const calculateSweetSpotScore = (sliderValues: SliderValues, mode: FilterMode): number => {
  const values = Object.values(sliderValues) as number[];

  if (mode === 'intersection') {
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const balance = 1 - (maxValue - minValue);
    return minValue * balance;
  }

  return values.reduce((a, b) => a + b, 0) / values.length;
};

export const isEurekaScore = (score: number): boolean =>
  score >= SWEETSPOT_CONFIG.THRESHOLDS.EUREKA_SCORE;

/** Petit score “badge” (0..100) pour la carte */
export const calculateConvergenceScore = (
  convergence: UIConvergence,
  baseScorePct: number,
): number => Math.round(85 + (baseScorePct - 50) * 0.3);

/** Safe mapping d’un tableau quelconque vers des UIConvergence (fallback) */
export const processConvergences = (
  convergences: unknown[],
  defaultConvergences: UIConvergence[],
): UIConvergence[] => {
  if (!Array.isArray(convergences) || convergences.length === 0) return defaultConvergences;

  return convergences.map(
    (c: any, i: number): UIConvergence => ({
      id: String(c?.id ?? i),
      formula: Array.isArray(c?.matchedDimensions)
        ? c.matchedDimensions.map((d: string) => (d ? d[0].toUpperCase() + d.slice(1) : d))
        : Array.isArray(c?.formula)
          ? c.formula
          : [],
      result: String(c?.keyword ?? c?.result ?? 'Proposition'),
      description:
        typeof c?.description === 'string'
          ? c.description
          : `Mot-clé fort détecté${Array.isArray(c?.matchedDimensions) ? ` : ${(c.matchedDimensions as string[]).join(', ')}` : ''}`,
      example:
        typeof c?.example === 'string'
          ? c.example
          : c?.keyword
            ? `Teste « ${c.keyword} » dans un mini-projet perso.`
            : 'Teste cette piste dans un mini-projet perso.',
      score: typeof c?.score === 'number' ? c.score : undefined,
    }),
  );
};

// Utilitaires
export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));
export const percentToDecimal = (percent: number): number => clamp01(percent / 100);
export const decimalToPercent = (decimal: number): number => Math.round(clamp01(decimal) * 100);
