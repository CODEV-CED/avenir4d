// lib/voeux-local.ts
const KEY = 'a4d:voeux:v1';
const MAX_VOEUX = 6;

const isBrowser = () => typeof window !== 'undefined';

export function loadVoeux(): string[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveVoeux(next: string[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function isFull(list: string[]) {
  return list.length >= MAX_VOEUX;
}

// ⬇️ Ces deux fonctions retournent le NOUVEAU tableau ET le persistent
export function addVoeu(prev: string[], id: string): string[] {
  if (prev.includes(id) || prev.length >= MAX_VOEUX) return prev;
  const next = [...prev, id];
  saveVoeux(next);
  return next;
}

export function removeVoeu(prev: string[], id: string): string[] {
  const next = prev.filter((v) => v !== id);
  saveVoeux(next);
  return next;
}
