// store/sliderConstraints.ts
export type SliderKey = 'passions' | 'talents' | 'utilite' | 'viabilite';
export type SliderValues = Record<SliderKey, number>;

export const GAP = 0.4;
export const MIN_VIAB = 0.15;

export const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;
const eps = 1e-6;

const sum = (v: SliderValues) => v.passions + v.talents + v.utilite + v.viabilite;
const spread = (v: SliderValues) =>
  Math.max(v.passions, v.talents, v.utilite, v.viabilite) -
  Math.min(v.passions, v.talents, v.utilite, v.viabilite);

/** Normalise somme=1 et impose viabilité minimale */
function normalizeWithViab(v: SliderValues): SliderValues {
  const a: SliderValues = {
    passions: clamp(v.passions),
    talents: clamp(v.talents),
    utilite: clamp(v.utilite),
    viabilite: Math.max(MIN_VIAB, clamp(v.viabilite)),
  };

  let s = sum(a);
  if (s <= 0) return { passions: 0.25, talents: 0.25, utilite: 0.25, viabilite: 0.25 };

  let n: SliderValues = {
    passions: a.passions / s,
    talents: a.talents / s,
    utilite: a.utilite / s,
    viabilite: a.viabilite / s,
  };

  if (n.viabilite < MIN_VIAB - eps) {
    const deficit = MIN_VIAB - n.viabilite;
    const pool = n.passions + n.talents + n.utilite;
    if (pool > eps) {
      const scale = (pool - deficit) / pool;
      n = {
        passions: n.passions * scale,
        talents: n.talents * scale,
        utilite: n.utilite * scale,
        viabilite: MIN_VIAB,
      };
    } else {
      n.viabilite = MIN_VIAB;
    }
  }

  const s2 = sum(n);
  return {
    passions: n.passions / s2,
    talents: n.talents / s2,
    utilite: n.utilite / s2,
    viabilite: n.viabilite / s2,
  };
}

/** Réduit l’écart global à GAP autour d’un intervalle [lo..hi], puis renormalise */
function clampSpread(n: SliderValues): SliderValues {
  const vals = [n.passions, n.talents, n.utilite, n.viabilite];
  const mx = Math.max(...vals);
  const mn = Math.min(...vals);
  if (mx - mn <= GAP + eps) return n;

  const mid = (mx + mn) / 2;
  const hi = mid + GAP / 2;
  const lo = mid - GAP / 2;

  const c: SliderValues = {
    passions: clamp(n.passions, lo, hi),
    talents: clamp(n.talents, lo, hi),
    utilite: clamp(n.utilite, lo, hi),
    viabilite: Math.max(MIN_VIAB, clamp(n.viabilite, lo, hi)),
  };
  return normalizeWithViab(c);
}

/** Version “simple” si tu n’as pas besoin d’événements */
export function applySliderConstraint(
  prev: SliderValues,
  dimension: SliderKey,
  rawValue: number,
): SliderValues {
  const { next } = applySliderConstraintVerbose(prev, dimension, rawValue);
  return next;
}

/** Événement UI pour bannière/analytics */
export type AutoAdjustEvent =
  | { at: number; type: 'viabilityMin'; adjusted: { key: SliderKey; from: number; to: number } }
  | { at: number; type: 'gap'; adjusted: { key: SliderKey; from: number; to: number } }
  | { at: number; type: 'clamp'; adjusted: { key: SliderKey; from: number; to: number } };

/** Résultat “verbose” pour le store */
export type ApplyResult = {
  next: SliderValues;
  evt: AutoAdjustEvent | null;
  autoKey: SliderKey | null; // le slider autre que 'dimension' le plus impacté
};

/** Version verbose : calcule next + détecte l’événement + la clé auto-ajustée */
export function applySliderConstraintVerbose(
  prev: SliderValues,
  dimension: SliderKey,
  rawValue: number,
): ApplyResult {
  const prevNorm = normalizeWithViab(prev);
  const prevSpread = spread(prevNorm);

  // 1) clamp local + min viabilité si dimension = viabilite
  const lower = dimension === 'viabilite' ? MIN_VIAB : 0;
  const clampedLocal = clamp(rawValue, lower, 1);
  const localClampedChanged = Math.abs(clampedLocal - rawValue) > eps;

  // 2) intégrer la nouvelle valeur puis normaliser
  let next = normalizeWithViab({ ...prevNorm, [dimension]: clampedLocal } as SliderValues);

  // 3) limiter l’écart global
  const beforeSpread = spread(next);
  next = clampSpread(next);
  const afterSpread = spread(next);

  // 4) détecter l’autoKey (clé la plus modifiée hors dimension)
  let autoKey: SliderKey | null = null;
  let autoDelta = 0;
  (Object.keys(next) as SliderKey[]).forEach((k) => {
    if (k === dimension) return;
    const d = Math.abs(next[k] - prevNorm[k]);
    if (d > autoDelta + eps) {
      autoDelta = d;
      autoKey = k;
    }
  });

  // 5) construire evt
  let evt: AutoAdjustEvent | null = null;

  // a) cas viabilité sous le minimum imposée
  if (dimension === 'viabilite' && rawValue < MIN_VIAB - eps) {
    evt = {
      at: Date.now(),
      type: 'viabilityMin',
      adjusted: { key: 'viabilite', from: rawValue, to: next.viabilite },
    };
  }
  // b) cas réduction de spread (écart > GAP résorbé) → 'gap' sur la clé la plus ajustée
  else if (prevSpread > GAP + eps && afterSpread <= GAP + eps && autoKey) {
    evt = {
      at: Date.now(),
      type: 'gap',
      adjusted: { key: autoKey, from: prevNorm[autoKey], to: next[autoKey] },
    };
  }
  // c) sinon, si on a clampé localement la valeur entrée
  else if (localClampedChanged) {
    evt = {
      at: Date.now(),
      type: 'clamp',
      adjusted: { key: dimension, from: rawValue, to: clampedLocal },
    };
  }

  // 6) arrondis stables
  (Object.keys(next) as SliderKey[]).forEach((k) => (next[k] = round6(next[k])));

  return { next, evt, autoKey };
}
