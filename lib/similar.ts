import type { FormationStatic } from '@/types/formation';

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size && !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const uni = a.size + b.size - inter;
  return uni === 0 ? 0 : inter / uni;
}

/** Concatène les tags “contenus” de la formation (plaisir/compétence/utilité) */
export function collectTagSet(f: FormationStatic): Set<string> {
  const tags = [...(f.plaisir_tags ?? []), ...(f.competence_tags ?? []), ...(f.utilite_tags ?? [])];
  return new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean));
}

/** Similarité globale entre deux formations (tags + bonus si même type/ville) */
export function similarity(a: FormationStatic, b: FormationStatic): number {
  const sa = collectTagSet(a);
  const sb = collectTagSet(b);
  let score = jaccard(sa, sb); // 0..1

  if (a.type && b.type && a.type === b.type) score += 0.08;
  if (a.ville && b.ville && a.ville === b.ville) score += 0.04;

  return Math.min(1, +score.toFixed(3));
}

/** Trouve K formations proches (exclut l’ID courant) */
export function topKSimilar(
  all: FormationStatic[],
  current: FormationStatic,
  k = 6,
): Array<{ item: FormationStatic; score: number }> {
  return all
    .filter((x) => x.id !== current.id)
    .map((x) => ({ item: x, score: similarity(current, x) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
