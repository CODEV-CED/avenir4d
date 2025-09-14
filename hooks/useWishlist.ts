'use client';
import { useEffect, useState } from 'react';
import type { Profile4D } from '@/types/sjt';
import { profileKey } from '@/lib/profile-key';

const MAX = 6;

function load(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]');
  } catch {
    return [];
  }
}
function save(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {}
}

export function useWishlist(profile: Profile4D) {
  const [ids, setIds] = useState<string[]>([]);
  const [k, setK] = useState<string>(() => profileKey(profile));

  // (re)charge quand le profil change
  useEffect(() => {
    const nk = profileKey(profile);
    setK(nk);
    setIds(load(nk));

    // Listen for localStorage changes (other tabs/components)
    function handleStorage(e: StorageEvent) {
      if (e.key === nk) {
        setIds(load(nk));
      }
    }
    window.addEventListener('storage', handleStorage);

    // Listen for custom voeux-updated event (same tab)
    function handleVoeuxUpdated(e: Event) {
      if ('detail' in e && (e as CustomEvent).detail?.key === nk) {
        setTimeout(() => setIds(load(nk)), 0);
      }
    }
    window.addEventListener('voeux-updated', handleVoeuxUpdated);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('voeux-updated', handleVoeuxUpdated as EventListener);
    };
  }, [profile]);

  // helpers
  const isFull = ids.length >= MAX;
  const has = (id: string) => ids.includes(id);

  function add(id: string) {
    setIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX) return prev;
      const next = [...prev, id];
      save(k, next);
      window.dispatchEvent(new CustomEvent('voeux-updated', { detail: { key: k } }));
      return next;
    });
  }
  function remove(id: string) {
    setIds((prev) => {
      const next = prev.filter((x) => x !== id);
      save(k, next);
      window.dispatchEvent(new CustomEvent('voeux-updated', { detail: { key: k } }));
      return next;
    });
  }
  function clear() {
    try {
      localStorage.removeItem(k);
    } catch {}
    setIds([]);
    window.dispatchEvent(new CustomEvent('voeux-updated', { detail: { key: k } }));
  }

  return { ids, add, remove, clear, has, isFull, key: k, count: ids.length, max: MAX };
}
