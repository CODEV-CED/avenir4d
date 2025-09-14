import type { Profile4D, Dim } from './types';
import { DIMS } from './types';
import type { SJTScenario, SJTOption } from '@/data/sjt-questions-advanced';

// Helpers utilitaires
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Calcule le profil 4D à partir des choix SJT
 * @param choices - Paires question/option choisies
 * @returns Profile4D avec scores pondérés et confidence_avg brute (1-5)
 */
export function compute4D(
  choices: ReadonlyArray<{ question: SJTScenario; option: SJTOption }>,
): Profile4D {
  let wSum = 0,
    P = 0,
    C = 0,
    U = 0,
    V = 0,
    confSumRaw = 0;

  for (const { option } of choices) {
    const rawConf = option.confidence ?? 3; // 1..5 (affichable)
    const w = clamp(rawConf / 5, 0.2, 1.0); // poids 0.2..1.0

    // Garantit que les scores sont sur 0-1 (normalisation défensive)
    const s = option.scores ?? {};
    P += clamp(s.plaisir ?? 0, 0, 1) * w;
    C += clamp(s.competence ?? 0, 0, 1) * w;
    U += clamp(s.utilite ?? 0, 0, 1) * w;
    V += clamp(s.viabilite ?? 0, 0, 1) * w;

    wSum += w;
    confSumRaw += rawConf;
  }

  const denom = wSum || 1;
  const choicesCount = choices.length || 1;

  return {
    plaisir: round2(P / denom),
    competence: round2(C / denom),
    utilite: round2(U / denom),
    viabilite: round2(V / denom),
    // Moyenne BRUTE 1..5 (plus interprétable par l'utilisateur final)
    confidence_avg: round2(confSumRaw / choicesCount),
    version: 1,
    source: 'sjt_v2',
  };
}

/**
 * Applique les contraintes business: viabilité min + rescaling exact pour écart <= 0.40
 * @param profile - Profil 4D brut
 * @returns Profil 4D contraint avec arrondis cohérents
 */
export function applyBusinessConstraints(profile: Profile4D): Profile4D {
  // 1) Clamp viabilité minimum
  let constrained = {
    ...profile,
    viabilite: Math.max(profile.viabilite, 0.15),
  };

  // 2) Contrôle d'écart avec rescaling exact
  const values = [
    constrained.plaisir,
    constrained.competence,
    constrained.utilite,
    constrained.viabilite,
  ];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = max - min;

  if (spread > 0.4) {
    const avg =
      (constrained.plaisir + constrained.competence + constrained.utilite + constrained.viabilite) /
      4;
    const k = 0.4 / spread; // Facteur exact pour atteindre l'écart cible en une passe

    constrained = {
      ...constrained,
      plaisir: round2(avg + (constrained.plaisir - avg) * k),
      competence: round2(avg + (constrained.competence - avg) * k),
      utilite: round2(avg + (constrained.utilite - avg) * k),
      viabilite: round2(avg + (constrained.viabilite - avg) * k),
      confidence_avg: round2(constrained.confidence_avg),
    };

    // 3) Re-garantie viabilité min (au cas où le rescaling l'a fait baisser)
    if (constrained.viabilite < 0.15) {
      constrained.viabilite = 0.15;
    }
  } else {
    // Arrondis cohérents même si pas de rescaling
    constrained = {
      ...constrained,
      plaisir: round2(constrained.plaisir),
      competence: round2(constrained.competence),
      utilite: round2(constrained.utilite),
      viabilite: round2(constrained.viabilite),
      confidence_avg: round2(constrained.confidence_avg),
    };
  }

  return constrained;
}

/**
 * Fonction utilitaire pour valider un profil 4D
 */
export function validateProfile4D(profile: Profile4D): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Vérifie que toutes les dimensions sont entre 0 et 1
  DIMS.forEach((dim) => {
    const value = profile[dim];
    if (value < 0 || value > 1) {
      issues.push(`${dim}: ${value} hors de la plage [0,1]`);
    }
  });

  // Vérifie que la confidence est dans la plage attendue (1-5 pour la version brute)
  if (profile.confidence_avg < 1 || profile.confidence_avg > 5) {
    issues.push(`confidence_avg: ${profile.confidence_avg} hors de la plage [1,5]`);
  }

  // Alerte si le profil semble trop faible partout
  const avg = (profile.plaisir + profile.competence + profile.utilite + profile.viabilite) / 4;
  if (avg < 0.3) {
    issues.push(`Profil globalement faible (moyenne: ${avg.toFixed(2)}). Vérifier les réponses.`);
  }

  // Vérifie l'écart après contraintes
  const values = [profile.plaisir, profile.competence, profile.utilite, profile.viabilite];
  const spread = Math.max(...values) - Math.min(...values);
  if (spread > 0.41) {
    // Petit buffer pour les arrondis
    issues.push(`Écart trop important: ${spread.toFixed(2)} > 0.40`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
