// lib/sweetspot/profile-builder.ts
export type BadgeVariant = 'success' | 'info' | 'warning' | 'caution' | 'danger';
import type { Profile4D, SweetSpotProfile } from './types';

export function buildSweetSpotProfile(
  base4d: Profile4D,
  keywords: SweetSpotProfile['keywords'],
): SweetSpotProfile {
  return {
    base4d: { ...base4d, version: 1, source: 'sjt_v2' },
    keywords,
    // batch 2: convergences, sweetSpotScore, links...
  };
}

// ----- Summary -----
export function generateProfileSummary(profile: SweetSpotProfile): {
  dominantDimension: string;
  weakestDimension: string;
  balance: 'équilibré' | 'spécialisé' | 'polarisé';
  topKeywords: string[];
  confidenceLevel: 'faible' | 'moyenne' | 'élevée';
  confidenceScore: number;
} {
  const { base4d } = profile;

  // Dimensions (labels UI avec accents)
  const dims = [
    { name: 'plaisir', value: base4d.plaisir },
    { name: 'compétence', value: base4d.competence },
    { name: 'utilité', value: base4d.utilite },
    { name: 'viabilité', value: base4d.viabilite },
  ] as const;

  // Tri sans muter
  const sorted = [...dims].sort((a, b) => b.value - a.value);
  const dominantDimension = sorted[0].name;
  const weakestDimension = sorted[sorted.length - 1].name;

  // Balance
  const range = sorted[0].value - sorted[sorted.length - 1].value;
  const balance: 'équilibré' | 'spécialisé' | 'polarisé' =
    range < 0.2 ? 'équilibré' : range < 0.4 ? 'spécialisé' : 'polarisé';

  // ---- Patch readonly → mutable (aucun type predicate) ----
  const arrays = Object.values(profile.keywords ?? {}) as Array<readonly string[] | undefined>;
  const flatKeywords: string[] = arrays
    .flatMap((a) => (a ? Array.from(a) : [])) // clone → mutable
    .filter((k): k is string => typeof k === 'string' && k.trim().length > 0);

  // Fréquences
  const freq = new Map<string, number>();
  for (const k of flatKeywords) {
    const t = k.trim();
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }

  const topKeywords = [...freq.entries()]
    .sort(([a, fa], [b, fb]) => fb - fa || b.length - a.length)
    .slice(0, 5)
    .map(([k]) => k);

  // Confiance (1..5)
  const confidenceScore = base4d.confidence_avg;
  const confidenceLevel: 'faible' | 'moyenne' | 'élevée' =
    confidenceScore < 2.5 ? 'faible' : confidenceScore < 4 ? 'moyenne' : 'élevée';

  return {
    dominantDimension,
    weakestDimension,
    balance,
    topKeywords,
    confidenceLevel,
    confidenceScore,
  };
}

// ----- Détection profils atypiques -----
export function detectAtypicalProfile(profile: SweetSpotProfile): {
  isAtypical: boolean;
  flags: string[];
  recommendations: string[];
} {
  const flags: string[] = [];
  const recommendations: string[] = [];
  const v = [
    profile.base4d.plaisir,
    profile.base4d.competence,
    profile.base4d.utilite,
    profile.base4d.viabilite,
  ];
  const max = Math.max(...v),
    min = Math.min(...v);

  if (max - min > 0.5) {
    flags.push('Profil très déséquilibré');
    recommendations.push('Considérer des formations hybrides ou des doubles cursus');
  }
  if (profile.base4d.viabilite < 0.3) {
    flags.push('Viabilité économique faible');
    recommendations.push('Explorer les débouchés non-traditionnels et les nouveaux métiers');
  }
  if (v.every((x) => x > 0.8)) {
    flags.push('Profil potentiellement idéalisé');
    recommendations.push('Affiner les préférences avec des choix plus contrastés');
  }
  if (v.every((x) => x < 0.4)) {
    flags.push('Profil globalement incertain');
    recommendations.push('Expérimentation pratique recommandée (stages, projets)');
  }
  if (profile.base4d.confidence_avg < 2) {
    flags.push('Faible confiance dans les réponses');
    recommendations.push('Reprendre le test après réflexion ou échanges avec proches');
  }

  // Comptage keywords sans predicate readonly
  const kwArrays = Object.values(profile.keywords ?? {}) as Array<readonly string[] | undefined>;
  const totalKeywords = kwArrays.reduce(
    (acc, a) =>
      acc + (a ? a.filter((k) => typeof k === 'string' && k.trim().length > 0).length : 0),
    0,
  );

  if (totalKeywords < 10) {
    flags.push('Réponses qualitatives trop brèves');
    recommendations.push('Développer davantage les réponses aux questions ouvertes');
  }

  return { isAtypical: flags.length > 0, flags, recommendations };
}

// ----- Badges / chips -----
export function createProfileBadges(summary: ReturnType<typeof generateProfileSummary>) {
  const balanceMap = {
    équilibré: {
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: '⚖️',
      variant: 'info' as BadgeVariant,
    },
    spécialisé: {
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: '🎪',
      variant: 'warning' as BadgeVariant,
    },
    polarisé: {
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: '🌊',
      variant: 'caution' as BadgeVariant,
    },
  } as const;

  const confMap = {
    élevée: {
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: '💯',
      variant: 'success' as BadgeVariant,
    },
    moyenne: {
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: '👍',
      variant: 'warning' as BadgeVariant,
    },
    faible: {
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: '🤔',
      variant: 'danger' as BadgeVariant,
    },
  } as const;

  return {
    dominant: {
      label: 'Dominante',
      value: summary.dominantDimension,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      priority: 1,
      icon: '🎯',
      variant: 'success' as BadgeVariant,
    },
    balance: {
      label: 'Équilibre',
      value: summary.balance,
      color: balanceMap[summary.balance].color,
      priority: 2,
      icon: balanceMap[summary.balance].icon,
      variant: balanceMap[summary.balance].variant,
    },
    confidence: {
      label: 'Confiance',
      value: `${summary.confidenceLevel} (${summary.confidenceScore}/5)`,
      color: confMap[summary.confidenceLevel].color,
      priority: 3,
      icon: confMap[summary.confidenceLevel].icon,
      variant: confMap[summary.confidenceLevel].variant,
    },
    weak: {
      label: 'À développer',
      value: summary.weakestDimension,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      priority: 4,
      icon: '📈',
      variant: 'warning' as BadgeVariant,
    },
  };
}
