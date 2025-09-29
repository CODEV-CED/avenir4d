// NEW FILE
export type DimKey = 'passions' | 'talents' | 'utilite' | 'viabilite';
export type SliderValues = Record<DimKey, number>;
export type UserKeywords = Record<DimKey, string[]>;

export type WorkerResult = {
  sweetSpotScore: number;
  isEureka: boolean;
  analysis: {
    strongestDimension: DimKey;
    weakestDimension: DimKey;
    balance: number;
    maturity: number;
    coherence: number;
  };
  insights: {
    nextSteps: string[];
    recommendations: string[];
    warnings?: string[];
  };
  convergences: Array<{
    id: string;
    formula: string[];
    result: string;
    description: string;
    example: string;
    score: number;
    confidence: number;
    viability: 'high' | 'medium' | 'low';
  }>;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function calculateKeywordBalance(keywords: UserKeywords): number {
  const counts = Object.values(keywords).map((k) => k.length);
  const mean = avg(counts);
  const variance = counts.length ? sum(counts.map((c) => (c - mean) ** 2)) / counts.length : 0;
  return clamp01(1 - variance / 10);
}

function maturityFromKeywords(keywords: UserKeywords) {
  const target = 24;
  const total = Object.values(keywords).reduce((s, a) => s + a.length, 0);
  return clamp01(total / target);
}

function calcStrongWeak(sliders: SliderValues) {
  const entries = Object.entries(sliders) as [DimKey, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return { strongestDimension: entries[0][0], weakestDimension: entries[entries.length - 1][0] };
}

function calculateCoherence(sliders: SliderValues, keywords: UserKeywords) {
  const dims: DimKey[] = ['passions', 'talents', 'utilite', 'viabilite'];
  const dens = dims.map((d) => clamp01((keywords[d]?.length ?? 0) / 6));
  const weights = dims.map((d) => sliders[d]);
  return avg(weights.map((w, i) => clamp01(w * dens[i])));
}

function viabilityFromScore(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.7) return 'high';
  if (score >= 0.45) return 'medium';
  return 'low';
}

function confidenceFor(sliders: SliderValues, keywords: UserKeywords, d1: DimKey, d2: DimKey) {
  const s = sliders[d1] * sliders[d2];
  const k = clamp01(((keywords[d1]?.length || 0) + (keywords[d2]?.length || 0)) / 12);
  return clamp01(0.6 * s + 0.4 * k);
}

function generateSmartTitle(d1: DimKey, d2: DimKey, k1: string, k2: string): string {
  const key = [d1, d2].sort().join('_');
  const templates: Record<string, string[]> = {
    passions_talents: [`Expert ${k2} en ${k1}`, `Spécialiste ${k1} avec talent ${k2}`],
    passions_utilite: [`${k1} au service de ${k2}`, `Impact ${k2} via ${k1}`],
    talents_viabilite: [`${k1} monétisé en ${k2}`, `Business ${k2} avec expertise ${k1}`],
  };
  const list = templates[key] || [`${k1} × ${k2}`];
  return list[Math.floor(Math.random() * list.length)];
}

function detectConvergences(keywords: UserKeywords, sliders: SliderValues, tags: string[]) {
  const dims = Object.entries(keywords) as [DimKey, string[]][];
  const out: WorkerResult['convergences'] = [];

  const compatibility: Record<string, number> = {
    passions_talents: 0.9,
    passions_utilite: 0.8,
    passions_viabilite: 0.6,
    talents_utilite: 0.85,
    talents_viabilite: 0.9,
    utilite_viabilite: 0.7,
  };

  for (let i = 0; i < dims.length; i++) {
    for (let j = i + 1; j < dims.length; j++) {
      const [d1, kw1] = dims[i];
      const [d2, kw2] = dims[j];
      if (!kw1.length || !kw2.length) continue;

      const compatKey = [d1, d2].sort().join('_');
      const compatBonus = compatibility[compatKey] || 0.5;
      const base = sliders[d1] * sliders[d2];
      const synergy = base * compatBonus;
      if (synergy <= 0.25) continue;

      const k1 = kw1[0];
      const k2 = kw2[0];
      out.push({
        id: `conv_${d1}_${d2}_${k1}_${k2}`.slice(0, 64),
        formula: [...kw1.slice(0, 2), ...kw2.slice(0, 1)],
        result: generateSmartTitle(d1, d2, k1, k2),
        description: `Synergie ${d1}/${d2} autour de ${k1} et ${k2}.`,
        example: `Prototype mêlant ${k1} et ${k2}${tags[0] ? ` (tag: ${tags[0]})` : ''}.`,
        score: synergy,
        confidence: confidenceFor(sliders, keywords, d1, d2),
        viability: viabilityFromScore(synergy),
      });
    }
  }

  if (out.length === 0) {
    out.push({
      id: 'wk_default_1',
      formula: ['Design', 'IA', 'Éducation'],
      result: "Coach d'app créatives",
      description: "Expériences d'apprentissage avec IA.",
      example: 'App portfolio assisté par IA.',
      score: 0.55,
      confidence: 0.6,
      viability: 'medium',
    });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 5);
}

export function calculateSweetSpotScore(
  sliders: SliderValues,
  keywords: UserKeywords,
  tags: string[],
  mode: 'union' | 'intersection' = 'union',
) {
  const values = Object.values(sliders);
  if (mode === 'intersection') {
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const balance = clamp01(1 - (maxV - minV));
    const base = minV * balance;
    const kwBalance = calculateKeywordBalance(keywords);
    return clamp01(base * 0.7 + kwBalance * 0.2 + clamp01(tags.length / 10) * 0.1);
  }
  const sliderAvg = avg(values);
  const totalKw = Object.values(keywords).reduce((s, a) => s + a.length, 0);
  const kwDensity = clamp01(totalKw / 20);
  const tagBoost = Math.min(0.2, tags.length * 0.025);
  return clamp01(sliderAvg * 0.6 + kwDensity * 0.3 + tagBoost);
}

export function calculateSweetSpotSync(
  sliders: SliderValues,
  keywords: UserKeywords,
  tags: string[],
  mode: 'union' | 'intersection',
): WorkerResult {
  const sweetSpotScore = calculateSweetSpotScore(sliders, keywords, tags, mode);
  const { strongestDimension, weakestDimension } = calcStrongWeak(sliders);
  const balance = calculateKeywordBalance(keywords);
  const maturity = maturityFromKeywords(keywords);
  const coherence = calculateCoherence(sliders, keywords);
  const convergences = detectConvergences(keywords, sliders, tags);
  const isEureka = sweetSpotScore >= 0.7;

  return {
    sweetSpotScore,
    isEureka,
    analysis: { strongestDimension, weakestDimension, balance, maturity, coherence },
    insights: {
      nextSteps: [
        'Ajoute 2-3 mots-clés dans la dimension la plus faible',
        'Teste un mini-projet lié à la convergence top 1',
      ],
      recommendations: [
        'Équilibre tes dimensions pour améliorer la cohérence',
        'Ajoute un tag de contexte pour préciser la cible',
      ],
      warnings: balance < 0.4 ? ['Profil déséquilibré : répartis mieux tes mots-clés'] : undefined,
    },
    convergences,
  };
}
