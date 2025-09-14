export type SliderKey = 'passions' | 'talents' | 'utilite' | 'viabilite';
export type SliderValues = Record<SliderKey, number>;

export const GAP = 0.4;
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

export function applySliderConstraint(
  prev: SliderValues,
  dimension: SliderKey,
  rawValue: number,
): SliderValues {
  const prevVal = prev[dimension];
  const lower = dimension === 'viabilite' ? 0.15 : 0;

  const others = Object.entries(prev)
    .filter(([k]) => k !== dimension)
    .map(([, v]) => v as number);

  const minOther = Math.min(...others);
  const maxOther = Math.max(...others);

  // 1) Clamp local + fenêtre permise par les autres sliders
  let nextVal = clamp(rawValue, lower, 1);
  const allowedMin = Math.max(maxOther - GAP, lower);
  const allowedMax = Math.min(minOther + GAP, 1);
  nextVal = round6(clamp(nextVal, allowedMin, allowedMax));

  // 2) Construire le nouvel état
  const next: SliderValues = { ...prev, [dimension]: nextVal };

  // 3) Vérifier plage globale et corriger l’extrême opposé si besoin
  const entries = Object.entries(next) as [SliderKey, number][];
  const minEntry = entries.reduce((a, b) => (a[1] <= b[1] ? a : b));
  const maxEntry = entries.reduce((a, b) => (a[1] >= b[1] ? a : b));
  const range = maxEntry[1] - minEntry[1];

  if (range > GAP) {
    if (nextVal >= prevVal) {
      // On a monté le slider courant → remonte le minimum jusqu’à max - GAP
      const target = maxEntry[1] - GAP;
      const key = minEntry[0];
      const lb = key === 'viabilite' ? 0.15 : 0;
      next[key] = round6(clamp(target, lb, 1));
    } else {
      // On a baissé le slider courant → baisse le maximum jusqu’à min + GAP
      const target = minEntry[1] + GAP;
      const key = maxEntry[0];
      next[key] = round6(clamp(target, 0, 1));
    }
  }

  // Final rounding of all values to stabilize UI
  (Object.keys(next) as SliderKey[]).forEach((k) => {
    next[k] = round6(next[k]);
  });
  return next;
}
