// components/sweet-spot/workers/sweetspot.worker.ts
// --------------------------------------------------
// Worker ESM (Next 14+/15) — typé WebWorker

export {}; // pour isoler le scope du module

// ✅ Types partagés (copiez/importe z si vous avez déjà ces types ailleurs)
type DimKey = 'passions' | 'talents' | 'utilite' | 'viabilite';
type SliderValues = Record<DimKey, number>;
type UserKeywords = Record<DimKey, string[]>;

type Convergence = {
  id: string;
  formula: string[];
  result: string;
  description: string;
  example: string;
  score: number;
  confidence: number;
  viability: 'high' | 'medium' | 'low';
};

type WorkerResult = {
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
  convergences: Convergence[];
};

// ✅ Payload attendu par PRECOMPUTE
type ComputePayload = {
  sliders: SliderValues;
  keywords: UserKeywords;
  tags: string[];
  mode: 'union' | 'intersection';
};

// ✅ Messages in/out
type InMsg = { type: 'PING' } | { type: 'PRECOMPUTE'; payload: ComputePayload };

type OutMsg = { type: 'PONG' } | { type: 'PRECOMPUTE_RESULT'; payload: WorkerResult };

// ✅ Scope dédié du worker (lib "webworker" activée dans tsconfig)
declare const self: DedicatedWorkerGlobalScope;
const ctx: DedicatedWorkerGlobalScope = self;

// --------------------------------------------------
// Implémentations (stub : branchez vos vraies fonctions)
function calculateSweetSpotScore(
  sliders: SliderValues,
  keywords: UserKeywords,
  tags: string[],
  mode: 'union' | 'intersection',
): number {
  const vals = Object.values(sliders);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const kw = Object.values(keywords).reduce((s, arr) => s + arr.length, 0);
  const kwDensity = Math.min(1, kw / 20);
  const tagBoost = Math.min(0.2, tags.length * 0.025);
  if (mode === 'intersection') {
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const balance = 1 - (maxV - minV);
    return Math.min(1, minV * balance * 0.8 + kwDensity * 0.15 + tagBoost * 0.05);
  }
  return Math.min(1, avg * 0.6 + kwDensity * 0.3 + tagBoost);
}

function detectConvergences(
  keywords: UserKeywords,
  sliders: SliderValues,
  tags: string[],
): Convergence[] {
  // Exemple minimal ; remplacez par votre logique enrichie
  const dims = Object.entries(keywords) as [DimKey, string[]][];
  const out: Convergence[] = [];
  for (let i = 0; i < dims.length; i++) {
    for (let j = i + 1; j < dims.length; j++) {
      const [d1, k1] = dims[i];
      const [d2, k2] = dims[j];
      if (!k1.length || !k2.length) continue;
      const score = sliders[d1] * sliders[d2];
      if (score < 0.25) continue;
      out.push({
        id: `conv_${d1}_${d2}_${i}_${j}`,
        formula: [k1[0], k2[0]],
        result: `${k1[0]} × ${k2[0]}`,
        description: `Relier ${d1} et ${d2} autour de ${k1[0]} et ${k2[0]}.`,
        example: `Mini-projet combinant ${k1[0]} et ${k2[0]}. Tags: ${tags.slice(0, 2).join(', ')}`,
        score,
        confidence: Math.min(1, score + 0.2),
        viability: score > 0.65 ? 'high' : score > 0.45 ? 'medium' : 'low',
      });
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 5);
}

function analyze(sliders: SliderValues, keywords: UserKeywords): WorkerResult['analysis'] {
  const entries = Object.entries(sliders) as [DimKey, number][];
  const strongest = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const weakest = entries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
  const vals = entries.map(([, v]) => v);
  const balance = 1 - (Math.max(...vals) - Math.min(...vals));
  const totalKw = Object.values(keywords).reduce((s, arr) => s + arr.length, 0);
  const maturity = Math.min(1, totalKw / 24);
  const coherence = Math.max(0.1, balance);
  return { strongestDimension: strongest, weakestDimension: weakest, balance, maturity, coherence };
}

function insightsFrom(result: WorkerResult): WorkerResult['insights'] {
  const nextSteps = ['Ajoute 2–3 mots-clés par dimension', 'Teste une micro-action cette semaine'];
  const recommendations = ['Équilibre tes curseurs', 'Identifie 1 tag “boost” pertinent'];
  const warnings =
    result.analysis.balance < 0.4
      ? ['Profil déséquilibré : augmente la dimension la plus faible']
      : undefined;
  return { nextSteps, recommendations, warnings };
}

// --------------------------------------------------
// Traitement
let computeTimeout: number | null = null;

function processCompute(payload: ComputePayload) {
  const { sliders, keywords, tags, mode } = payload;

  const sweetSpotScore = calculateSweetSpotScore(sliders, keywords, tags, mode);
  const analysis = analyze(sliders, keywords);
  const convergences = detectConvergences(keywords, sliders, tags);

  const result: WorkerResult = {
    sweetSpotScore,
    isEureka: sweetSpotScore >= 0.7,
    analysis,
    insights: insightsFrom({
      sweetSpotScore,
      isEureka: sweetSpotScore >= 0.7,
      analysis,
      insights: { nextSteps: [], recommendations: [] },
      convergences,
    }),
    convergences,
  };

  ctx.postMessage({ type: 'PRECOMPUTE_RESULT', payload: result } as OutMsg);
}

// --------------------------------------------------
// Message handler — correctement typé
ctx.onmessage = (evt: MessageEvent<InMsg>) => {
  const msg = evt.data;

  if (msg?.type === 'PING') {
    ctx.postMessage({ type: 'PONG' } as OutMsg);
    return;
  }

  if (msg?.type === 'PRECOMPUTE') {
    if (computeTimeout) clearTimeout(computeTimeout);
    computeTimeout = setTimeout(() => {
      processCompute(msg.payload); // ✅ payload est typé ComputePayload
      computeTimeout = null;
    }, 100) as unknown as number; // id numérique en worker
  }
};
