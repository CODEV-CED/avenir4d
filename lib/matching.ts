// /lib/matching.ts
import type { FormationStatic, ViabiliteData, Ranking } from '../types/formation';
function rankingBoost(r?: { position?: number }): number {
  if (!r?.position) return 0;
  const best = r.position;
  // Ex: #1 -> +0.03 ; #10 -> +0.01 ; #50 -> ~+0.006 ; plafonné à +0.03 (3 pts)
  const bonus = Math.max(0, 0.03 * (1 / Math.log2(best + 1)));
  return Math.min(0.03, bonus);
}
import type { Profile4D } from '../types/sjt';
import { perf } from './telemetry';

export type Weights = { plaisir: number; competence: number; utilite: number; viabilite: number };
export const DEFAULT_WEIGHTS: Weights = {
  plaisir: 0.3,
  competence: 0.25,
  utilite: 0.25,
  viabilite: 0.2,
};

export type Explanation = {
  main_reasons?: Array<'plaisir' | 'competence' | 'utilite' | 'viabilite'>;
  breakdown?: { plaisir: number; competence: number; utilite: number; viabilite: number };
  evidences?: string[];
};

const now = () => globalThis.performance?.now?.() ?? Date.now();

export function calculateCompatibility(
  profile: Profile4D,
  f: FormationStatic,
  weights: Weights = DEFAULT_WEIGHTS,
): number {
  const plaisir = tagSimilarity(profile.plaisir, f.plaisir_tags);
  const competence = tagSimilarity(profile.competence, f.competence_tags);
  const utilite = tagSimilarity(profile.utilite, f.utilite_tags);
  const viabilite = viabilitySimilarity(profile.viabilite, f.viabilite_data);

  const base =
    (plaisir * weights.plaisir +
      competence * weights.competence +
      utilite * weights.utilite +
      viabilite * weights.viabilite) *
    f.confidence;
  const total = base + rankingBoost(f.ranking);
  return Math.max(0, Math.min(1, Math.round(total * 100) / 100));
}

export function sortFormations(
  profile: Profile4D,
  formations: FormationStatic[],
  limit = 12,
  weights: Weights = DEFAULT_WEIGHTS,
) {
  const t0 = now();
  const result = formations
    .map((f) => ({
      ...f,
      compatibilityScore: calculateCompatibility(profile, f, weights),
      explanation: generateExplanation(profile, f),
    }))
    .sort((a, b) => (b.compatibilityScore ?? 0) - (a.compatibilityScore ?? 0))
    .slice(0, limit);
  const t1 = now();
  perf.sortingTime(t1 - t0);
  return result;
}

export function diversifyResults<T extends { type: string }>(sorted: T[], maxPerType = 3): T[] {
  const counts: Record<string, number> = {};
  const out: T[] = [];
  for (const f of sorted) {
    const n = counts[f.type] || 0;
    if (n < maxPerType) {
      out.push(f);
      counts[f.type] = n + 1;
    }
  }
  return out;
}

export function applyIkigaiConstraints<T extends { compatibilityScore?: number; warning?: string }>(
  items: T[],
  profile: Profile4D,
) {
  return items
    .filter((f) => (f.compatibilityScore ?? 0) >= 0.15)
    .map((f) => {
      const dims = [profile.plaisir, profile.competence, profile.utilite, profile.viabilite];
      const ecart = Math.max(...dims) - Math.min(...dims);
      if (ecart > 0.4) f.warning = 'Profil déséquilibré - ajustez votre Ikigaï';
      return f;
    });
}

function tagSimilarity(dim: number, tags: string[] = []) {
  if (!tags.length) return Math.round(dim * 0.5 * 100) / 100;
  const density = Math.min(tags.length / 5, 1); // plus il y a de tags, légère bonification
  return Math.round(dim * (0.7 + 0.3 * density) * 100) / 100;
}

function viabilitySimilarity(dim: number, v?: ViabiliteData) {
  if (!v) return Math.round(dim * 0.5 * 100) / 100;
  const access = v.taux_acces ?? 0.5;
  const cost =
    v.cout === 'gratuit' ? 1 : v.cout === 'modere' ? 0.7 : v.cout === 'eleve' ? 0.4 : 0.6;
  return Math.round(dim * (0.6 * access + 0.4 * cost) * 100) / 100;
}

function generateExplanation(profile: Profile4D, f: FormationStatic): Explanation {
  const breakdown = {
    plaisir: tagSimilarity(profile.plaisir, f.plaisir_tags),
    competence: tagSimilarity(profile.competence, f.competence_tags),
    utilite: tagSimilarity(profile.utilite, f.utilite_tags),
    viabilite: viabilitySimilarity(profile.viabilite, f.viabilite_data),
  };
  const main = (Object.entries(breakdown) as [keyof typeof breakdown, number][]).sort((a, b) => {
    const sa = a[1] ?? 0;
    const sb = b[1] ?? 0;
    return sb - sa;
  });

  const evidences: string[] = [];
  if (breakdown.plaisir > 0.7 && f.plaisir_tags?.length)
    evidences.push(`Activités: ${f.plaisir_tags.slice(0, 2).join(', ')}`);
  if (f.viabilite_data?.cout === 'gratuit') evidences.push('Formation gratuite');
  if ((f.viabilite_data?.taux_acces ?? 0) > 0.7) evidences.push("Bon taux d'accès");

  return { main_reasons: main.map(([k]) => k), breakdown, evidences: evidences.slice(0, 2) };
}
