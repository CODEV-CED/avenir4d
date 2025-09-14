// lib/profile-key.ts
import type { Profile4D } from '@/types/sjt';

/** Clé courte et stable pour partitionner les vœux par profil. */
export function profileKey(p: Profile4D) {
  // on arrondit à 2 décimales pour éviter de “trop” fragmenter
  const r = (x: number) => Math.round(x * 100) / 100;
  // ex: a4d:voeux:p80-c65-u72-v58-ca70
  return `a4d:voeux:p${r(p.plaisir)}-c${r(p.competence)}-u${r(p.utilite)}-v${r(p.viabilite)}-ca${r(p.confidence_avg)}`;
}
