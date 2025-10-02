// public/workers/sweetspot.worker.js
// --------------------------------------------------
// Web Worker ESM (module) — version JS, sans dépendances
// - Messages IN:  { type: 'PING' } | { type: 'PRECOMPUTE', payload }
// - Messages OUT: { type: 'PONG' } | { type: 'PRECOMPUTE_RESULT', payload }
//
// Payload attendu pour PRECOMPUTE:
//   {
//     sliders: { passions:number, talents:number, utilite:number, viabilite:number },
//     keywords: { passions:string[], talents:string[], utilite:string[], viabilite:string[] },
//     tags: string[],
//     mode: 'union' | 'intersection'
//   }
//
// Résultat renvoyé:
//   {
//     sweetSpotScore: number,
//     isEureka: boolean,
//     analysis: { strongestDimension, weakestDimension, balance, maturity, coherence },
//     insights: { nextSteps: string[], recommendations: string[], warnings?: string[] },
//     convergences: Array<Convergence>
//   }
//
// Convergence:
//   {
//     id: string,
//     formula: string[],
//     result: string,
//     description: string,
//     example: string,
//     score: number,
//     confidence: number,
//     viability: 'high' | 'medium' | 'low'
//   }

// --------------------------------------------------
// Helpers "type-like" (en JS pur)
const DIM_KEYS = ['passions', 'talents', 'utilite', 'viabilite'];

// --------------------------------------------------
// Calcul du Sweet Spot (version simple, non-bloquante)
function calculateSweetSpotScore(sliders, keywords, tags, mode) {
  const vals = DIM_KEYS.map((k) => Number(sliders?.[k] ?? 0));
  const avg = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);

  const kwCount =
    (keywords?.passions?.length || 0) +
    (keywords?.talents?.length || 0) +
    (keywords?.utilite?.length || 0) +
    (keywords?.viabilite?.length || 0);

  const kwDensity = Math.min(1, kwCount / 20); // densité de mots-clés
  const tagBoost = Math.min(0.2, (tags?.length || 0) * 0.025); // petit bonus

  if (mode === 'intersection') {
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const balance = 1 - (maxV - minV); // 1 = très équilibré
    // pondération plus stricte en mode "intersection"
    return Math.min(1, minV * balance * 0.8 + kwDensity * 0.15 + tagBoost * 0.05);
  }

  // mode "union" plus permissif
  return Math.min(1, avg * 0.6 + kwDensity * 0.3 + tagBoost);
}

// --------------------------------------------------
// Détection très simple de convergences (stub)
function detectConvergences(keywords, sliders, tags) {
  const pairs = [];
  const dims = DIM_KEYS.map((k) => [k, keywords?.[k] || []]);

  for (let i = 0; i < dims.length; i++) {
    for (let j = i + 1; j < dims.length; j++) {
      const d1 = dims[i][0],
        list1 = dims[i][1];
      const d2 = dims[j][0],
        list2 = dims[j][1];
      if (!list1.length || !list2.length) continue;

      const s = Number(sliders?.[d1] ?? 0) * Number(sliders?.[d2] ?? 0);
      if (s < 0.25) continue;

      const k1 = String(list1[0]);
      const k2 = String(list2[0]);

      pairs.push({
        id: `conv_${d1}_${d2}_${i}_${j}`,
        formula: [k1, k2],
        result: `${k1} × ${k2}`,
        description: `Relier ${labelizeDim(d1)} et ${labelizeDim(d2)} via « ${k1} » et « ${k2} ».`,
        example: `Mini-projet combinant ${k1} et ${k2}. Tags: ${(tags || []).slice(0, 2).join(', ')}`,
        score: s,
        confidence: Math.min(1, s + 0.2),
        viability: s > 0.65 ? 'high' : s > 0.45 ? 'medium' : 'low',
      });
    }
  }

  return pairs.sort((a, b) => b.score - a.score).slice(0, 5);
}

function labelizeDim(k) {
  switch (k) {
    case 'passions':
      return 'les passions';
    case 'talents':
      return 'les talents';
    case 'utilite':
      return "l'utilité (impact)";
    case 'viabilite':
      return 'la viabilité';
    default:
      return k;
  }
}

// --------------------------------------------------
// Analyse de profil
function analyze(sliders, keywords) {
  const entries = DIM_KEYS.map((k) => [k, Number(sliders?.[k] ?? 0)]);
  const strongest = entries.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  const weakest = entries.reduce((a, b) => (b[1] < a[1] ? b : a))[0];

  const vals = entries.map(([, v]) => v);
  const balance = 1 - (Math.max(...vals) - Math.min(...vals)); // 1 = équilibré

  const totalKw =
    (keywords?.passions?.length || 0) +
    (keywords?.talents?.length || 0) +
    (keywords?.utilite?.length || 0) +
    (keywords?.viabilite?.length || 0);

  const maturity = Math.min(1, totalKw / 24);
  const coherence = Math.max(0.1, balance);

  return {
    strongestDimension: strongest,
    weakestDimension: weakest,
    balance,
    maturity,
    coherence,
  };
}

// --------------------------------------------------
// Insights (reco + warnings basiques)
function insightsFrom(result) {
  const nextSteps = [
    'Ajoute 2–3 mots-clés dans chaque dimension',
    'Teste une micro-action cette semaine (mini-projet)',
  ];

  const recommendations = [
    'Équilibre tes curseurs (évite > 0.4 d’écart)',
    'Identifie 1 tag “boost” pertinent (ex: IA, éco, social)',
  ];

  const warnings =
    result.analysis.balance < 0.4
      ? ['Profil déséquilibré : augmente la dimension la plus faible']
      : undefined;

  return { nextSteps, recommendations, warnings };
}

// --------------------------------------------------
// Pipeline principal
let computeTimeout = null;

function processCompute(payload) {
  const { sliders, keywords, tags, mode } = payload || {};

  const sweetSpotScore = calculateSweetSpotScore(sliders, keywords, tags || [], mode || 'union');
  const analysis = analyze(sliders || {}, keywords || {});
  const convergences = detectConvergences(keywords || {}, sliders || {}, tags || []);

  const base = {
    sweetSpotScore,
    isEureka: sweetSpotScore >= 0.7,
    analysis,
    convergences,
  };

  const result = {
    ...base,
    insights: insightsFrom(base),
  };

  self.postMessage({ type: 'PRECOMPUTE_RESULT', payload: result });
}

// --------------------------------------------------
// Handler messages
self.onmessage = (evt) => {
  const msg = evt?.data;
  if (!msg || !msg.type) return;

  if (msg.type === 'PING') {
    self.postMessage({ type: 'PONG' });
    return;
  }

  if (msg.type === 'PRECOMPUTE') {
    if (computeTimeout) clearTimeout(computeTimeout);
    // petit debounce pour grouper les rafales de sliders
    computeTimeout = setTimeout(() => {
      try {
        processCompute(msg.payload || {});
      } catch {
        self.postMessage({
          type: 'PRECOMPUTE_RESULT',
          payload: {
            sweetSpotScore: 0,
            isEureka: false,
            analysis: {
              strongestDimension: 'passions',
              weakestDimension: 'passions',
              balance: 0,
              maturity: 0,
              coherence: 0.1,
            },
            insights: {
              nextSteps: ['Réessaie dans quelques secondes'],
              recommendations: ['Vérifie tes curseurs et mots-clés'],
            },
            convergences: [],
          },
        });
      } finally {
        computeTimeout = null;
      }
    }, 100);
  }
};
