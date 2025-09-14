import type { FormationStatic } from '@/types/formation';

/**
 * Retourne la liste des formations correspondant à une liste d'ids, dans l'ordre fourni.
 * @param ids Liste d'identifiants formation
 * @param allFormations Tableau source (ex: toutes les formations chargées)
 */
export function getFormationsByIds(
  ids: string[],
  allFormations: FormationStatic[],
): FormationStatic[] {
  if (!Array.isArray(ids) || !Array.isArray(allFormations)) return [];
  const byId = new Map<string, FormationStatic>();
  for (const f of allFormations) byId.set(f.id, f);
  return ids.map((id) => byId.get(id)).filter((f): f is FormationStatic => !!f);
}
