export type SweetSpotInput = {
  weights: { passions: number; talents: number; utilite: number; viabilite: number };
  keywords: { passions: string[]; talents: string[]; utilite: string[]; viabilite: string[] };
  boostTags?: string[];
  boostEnabled?: boolean;
};

export type Convergence = {
  keyword: string;
  dims: string[];
  matchedDimensions?: string[];
  strength: number;
};
export type SweetSpotResult = {
  score: number;
  convergences: Convergence[];
  metrics: { quad: number; tri: number; inter: number; union: number; maxStrength: number };
};

export type TuningPresetConfig = {
  weights: { passions: number; talents: number; utilite: number; viabilite: number };
  label: string;
  // lib/sweetSpotEngine.ts
};

export type TuningPreset = 'balanced' | 'strict' | 'lax';

const dims: (keyof SweetSpotInput['keywords'])[] = ['passions', 'talents', 'utilite', 'viabilite'];

export function detectConvergences(input: SweetSpotInput, topK = 20): SweetSpotResult {
  const { weights, keywords, boostTags = [], boostEnabled } = input;

  const map = new Map<string, Set<string>>();
  for (const d of dims) {
    for (const kw of keywords[d] || []) {
      const k = norm(kw);
      if (!k) continue;
      if (!map.has(k)) map.set(k, new Set());
      map.get(k)!.add(d);
    }
  }

  const conv: Convergence[] = [];
  const weightSum = dims.reduce((a, d) => a + weights[d], 0) || 1;

  for (const [k, setDims] of map.entries()) {
    const present = Array.from(setDims);
    const count = present.length;
    const weightCover =
      present.reduce((a, d) => a + weights[d as keyof typeof weights], 0) / weightSum;
    const density = (count - 1) / 3;
    const boosted = boostEnabled && boostTags?.includes(k) ? 1.15 : 1.0;
    const strength = clamp(weightCover * 0.6 + density * 0.4, 0, 1) * boosted;

    conv.push({
      keyword: k,
      dims: present,
      matchedDimensions: present, // nouveau champ ajouté
      strength: Math.min(strength, 1),
    });
  }

  const union = map.size;
  const inter = Array.from(map.values()).filter((s) => s.size === 4).length;
  const tri = Array.from(map.values()).filter((s) => s.size >= 3).length;
  const quad = inter;

  const maxStrength = conv.reduce((m, c) => Math.max(m, c.strength), 0);
  const triCoverage = union ? tri / union : 0;
  const quadCoverage = union ? quad / union : 0;

  let score = 0.45 * maxStrength + 0.35 * triCoverage + 0.2 * quadCoverage;

  score = clamp(score, 0, 1);

  conv.sort((a, b) => b.strength - a.strength);
  const top = conv.slice(0, topK);

  return {
    score,
    convergences: top,
    metrics: { quad, tri, inter, union, maxStrength },
  };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function norm(s: string) {
  return (s || '')
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '');
}
