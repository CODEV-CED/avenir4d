// lib/voeux.ts
const KEY = 'a4d:voeux:v1';
export const MAX_VOEUX = 6;

const isBrowser = () => typeof window !== 'undefined';
const emit = () => isBrowser() && window.dispatchEvent(new CustomEvent('voeux-changed'));

export function loadVoeux(): string[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
export function saveVoeux(ids: string[]) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX_VOEUX)));
  emit();
}

export function isSelected(id: string) {
  return loadVoeux().includes(id);
}
export function isFull() {
  return loadVoeux().length >= MAX_VOEUX;
}

export function addVoeu(id: string) {
  const ids = loadVoeux();
  if (ids.includes(id)) return { ok: true };
  if (ids.length >= MAX_VOEUX) return { ok: false, reason: 'limit' };
  ids.push(id);
  saveVoeux(ids);
  return { ok: true };
}

export function removeVoeu(id: string) {
  const ids = loadVoeux().filter((x) => x !== id);
  saveVoeux(ids);
}

export function toggleVoeu(id: string) {
  const ids = loadVoeux();
  if (ids.includes(id)) saveVoeux(ids.filter((x) => x !== id));
  else addVoeu(id);
}

export function moveVoeu(fromIndex: number, toIndex: number) {
  const ids = loadVoeux();
  if (fromIndex < 0 || fromIndex >= ids.length) return;
  if (toIndex < 0 || toIndex >= ids.length) return;
  const [item] = ids.splice(fromIndex, 1);
  ids.splice(toIndex, 0, item);
  saveVoeux(ids);
}

// Hook pratique
import { useEffect, useState } from 'react';
export function useVoeux() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(loadVoeux());
    const h = () => setIds(loadVoeux());
    window.addEventListener('voeux-changed', h);
    return () => window.removeEventListener('voeux-changed', h);
  }, []);
  return {
    ids,
    count: ids.length,
    max: MAX_VOEUX,
    add: addVoeu,
    remove: removeVoeu,
    toggle: toggleVoeu,
    move: moveVoeu,
    isSelected: (id: string) => ids.includes(id),
    isFull: () => ids.length >= MAX_VOEUX,
  };
}
