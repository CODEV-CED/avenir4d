export type Dimension = 'passions' | 'talents' | 'utilite' | 'viabilite';

export type SweetSpotInput = {
  weights: Record<Dimension, number>;
  keywords: Record<Dimension, string[]>;
  boostTags?: string[]; // ⬅️ ajouté
};

export type Convergence = {
  keyword: string;
  strength: number; // 0..1+
  matchedDimensions: Dimension[];
  boosted?: boolean;
  boostedBy?: string[];
};

export function detectConvergences(input: SweetSpotInput) {
  const scoreMap: Record<string, Convergence> = {};
  const dims = Object.keys(input.keywords) as Dimension[];

  // 1) accumulation par dimension
  for (const d of dims) {
    for (const k of input.keywords[d] ?? []) {
      const key = k.trim();
      if (!key) continue;
      if (!scoreMap[key]) {
        scoreMap[key] = { keyword: key, strength: 0, matchedDimensions: [] };
      }
      scoreMap[key].strength += input.weights[d] || 0;
      if (!scoreMap[key].matchedDimensions.includes(d)) {
        scoreMap[key].matchedDimensions.push(d);
      }
    }
  }

  // 2) boost par tags sélectionnés
  const boost = new Set((input.boostTags ?? []).map((s) => s.toLowerCase()));
  const BOOST_AMOUNT = 0.25; // ⚖️ règle simple
  for (const k in scoreMap) {
    const kl = k.toLowerCase();
    const hits = Array.from(boost).filter((t) => kl === t || kl.includes(t));
    if (hits.length) {
      scoreMap[k].strength += BOOST_AMOUNT;
      scoreMap[k].boosted = true;
      scoreMap[k].boostedBy = hits;
    }
  }

  // 3) filtrer mots présents dans ≥ 2 dimensions
  const convergences = Object.values(scoreMap).filter((c) => c.matchedDimensions.length >= 2);

  // 4) score global (calibrage simple)
  const total = convergences.reduce((s, c) => s + c.strength, 0);
  const score = Math.min(total / 2, 1);

  return { convergences, score };
}
