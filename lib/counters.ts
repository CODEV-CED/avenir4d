import type { FormationStatic } from '@/types/formation';

export function countTypes(
  all: FormationStatic[],
  f: { city: string; durationMax: number | null },
) {
  const c: Record<string, number> = {};
  for (const it of all) {
    if (f.city && it.ville !== f.city) continue;
    if (
      typeof f.durationMax === 'number' &&
      typeof it.duree === 'number' &&
      it.duree > f.durationMax
    )
      continue;
    c[it.type] = (c[it.type] || 0) + 1;
  }
  return c;
}

export function countCities(
  all: FormationStatic[],
  f: { selectedTypes: string[]; durationMax: number | null },
) {
  const c: Record<string, number> = {};
  for (const it of all) {
    if (f.selectedTypes.length && !f.selectedTypes.includes(it.type)) continue;
    if (
      typeof f.durationMax === 'number' &&
      typeof it.duree === 'number' &&
      it.duree > f.durationMax
    )
      continue;
    if (it.ville) c[it.ville] = (c[it.ville] || 0) + 1;
  }
  return c;
}
