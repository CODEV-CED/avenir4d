// /lib/formations-cache.ts
import type { FormationStatic } from '@/types/formation';

const KEY = 'a4d:formations:v2';
const TTL = 1000 * 60 * 60 * 24; // 24h
const isBrowser = () => typeof window !== 'undefined';

export function loadFormationsCache<T = FormationStatic[]>(): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    const fresh = Date.now() - ts < TTL;
    return fresh ? (data as T) : null;
  } catch {
    return null;
  }
}

export function saveFormationsCache(data: FormationStatic[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

export function invalidateFormationsCache() {
  if (isBrowser()) localStorage.removeItem(KEY);
}
