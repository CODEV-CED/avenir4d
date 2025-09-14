import type { Profile4D } from '@/types/sjt';
import { loadProfile, profileKey } from '@/lib/storage';

const BASE = 'a4d:voeux';

function keyForProfile(profile: Profile4D): string {
  return `${BASE}:${profileKey(profile)}`;
}

export function loadVoeux(profile: Profile4D): string[] {
  try {
    const raw = localStorage.getItem(keyForProfile(profile));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveVoeux(profile: Profile4D, list: string[]) {
  try {
    localStorage.setItem(keyForProfile(profile), JSON.stringify(list));
  } catch {}
}

export function addVoeu(profile: Profile4D, prev: string[], id: string, max = 6): string[] {
  if (prev.includes(id)) return prev;
  if (prev.length >= max) return prev;
  const next = [...prev, id];
  saveVoeux(profile, next);
  return next;
}

export function removeVoeu(profile: Profile4D, prev: string[], id: string): string[] {
  const next = prev.filter((x) => x !== id);
  saveVoeux(profile, next);
  return next;
}

export function isFull(list: string[], max = 6) {
  return list.length >= max;
}

export function clearVoeux(profile: Profile4D) {
  try {
    localStorage.removeItem(keyForProfile(profile));
  } catch {}
  return [] as string[];
}

const currentProfileKey = profileKey(loadProfile());

// Dans le JSX, près du titre :
// {/* <div className="text-xs text-gray-400">profil: {currentProfileKey}</div> */}
