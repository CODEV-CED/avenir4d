export function profileKey(p: StoredProfile | null): string {
  if (!p) return 'guest';
  const r = (x: number) => Math.round(x * 100); // 0..100
  return `p-${r(p.plaisir)}-${r(p.competence)}-${r(p.utilite)}-${r(p.viabilite)}-${r(p.confidence_avg)}`;
}
// /lib/storage.ts
import type { Profile4D } from '@/types/sjt';

const KEY = 'a4d:profile';
const isBrowser = () => typeof window !== 'undefined';

// On aligne: StoredProfile = Profile4D
export type StoredProfile = Profile4D;

export function loadProfile(): StoredProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(p: StoredProfile) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(p));
  // j’envoie le profil en détail (CustomEvent), pratique si un composant veut le lire direct
  window.dispatchEvent(new CustomEvent('profile-updated', { detail: p }));
}

// alias rétro-compat (si tu as laissé "setProfile" dans 2–3 fichiers)
export const setProfile = saveProfile;

export function clearProfile() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('profile-updated', { detail: null }));
}
