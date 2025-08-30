// lib/matching.ts
import type { FormationStatic, ViabiliteData } from '@/types/formation';
import { perf } from '@/lib/telemetry';

// Si tu as déjà Profile4D ailleurs, importe-le plutôt que de le redéfinir ici.
export type Profile4D = {
  plaisir: number;
  competence: number;
  utilite: number;
  viabilite: number;
};

const now = () => globalThis.performance?.now?.() ?? Date.now();

export function calculateCompatibility(profile: Profile4D, f: FormationStatic): number {
  const plaisir = tagSimilarity(profile.plaisir, f.plaisir_tags);
  const competence = tagSimilarity(profile.competence, f.competence_tags);
  const utilite = tagSimilarity(profile.utilite, f.utilite_tags);
  const viabilite = viabilitySimilarity(profile.viabilite, f.viabilite_data);

  const total =
    (plaisir * 0.3 + competence * 0.25 + utilite * 0.25 + viabilite * 0.2) * f.confidence;

  return Math.max(0, Math.min(1, Math.round(total * 100) / 100));
}

export function sortFormations(profile: Profile4D, formations: FormationStatic[], limit = 12) {
  const t0 = now();

  const result = formations
    .map((f) => ({
      ...f,
      compatibilityScore: calculateCompatibility(profile, f),
      explanation: generateExplanation(profile, f),
    }))
    .sort((a, b) => (b.compatibilityScore ?? 0) - (a.compatibilityScore ?? 0))
    .slice(0, limit);

  const t1 = now();
  perf.sortingTime(t1 - t0); // ⬅️ envoi perf (cette fois il s'exécute)

  return result;
}

function tagSimilarity(dim: number, tags: string[] = []) {
  if (!tags.length) return dim * 0.5;
  const density = Math.min(tags.length / 5, 1);
  return Math.round(dim * (0.7 + 0.3 * density) * 100) / 100;
}

function viabilitySimilarity(dim: number, v?: ViabiliteData) {
  if (!v) return dim * 0.5;
  const access = v.taux_acces ?? 0.5;
  const cost =
    v.cout === 'gratuit' ? 1 : v.cout === 'modere' ? 0.7 : v.cout === 'eleve' ? 0.4 : 0.6;
  return Math.round(dim * (0.6 * access + 0.4 * cost) * 100) / 100;
}

function generateExplanation(profile: Profile4D, f: FormationStatic) {
  const plaisir = tagSimilarity(profile.plaisir, f.plaisir_tags);
  const competence = tagSimilarity(profile.competence, f.competence_tags);
  const utilite = tagSimilarity(profile.utilite, f.utilite_tags);
  const viabilite = viabilitySimilarity(profile.viabilite, f.viabilite_data);

  const breakdown = { plaisir, competence, utilite, viabilite };
  const main = (Object.entries(breakdown) as [keyof typeof breakdown, number][])
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([k]) => k);

  const evidences: string[] = [];
  if (plaisir > 0.7 && f.plaisir_tags?.length) {
    evidences.push(`Activités: ${f.plaisir_tags.slice(0, 2).join(', ')}`);
  }
  if (f.viabilite_data?.cout === 'gratuit') evidences.push('Formation gratuite');
  if ((f.viabilite_data?.taux_acces ?? 0) > 0.7) evidences.push("Bon taux d'accès");

  return { main_reasons: main, evidences: evidences.slice(0, 2) };
}
