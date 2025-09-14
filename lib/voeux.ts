'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';

// Clé “officielle” unique
const KEY = 'a4d:voeux';
// Clés possibles “anciennes”
const LEGACY_KEYS = ['wishlist', 'a4d:wishlist'];

function readIds(): string[] {
  if (typeof window === 'undefined') return [];
  // lecture clé officielle
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw) ?? [];
    } catch {
      return [];
    }
  }
  // fallback: migrer depuis anciennes clés si présentes
  for (const old of LEGACY_KEYS) {
    const legacy = localStorage.getItem(old);
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) ?? [];
        localStorage.setItem(KEY, JSON.stringify(parsed));
        // on peut conserver l’ancienne clé ou la supprimer :
        // localStorage.removeItem(old)
        return parsed;
      } catch {}
    }
  }
  return [];
}

function writeIds(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(ids));
}

export function useVoeux() {
  const [hydrated, setHydrated] = useState(false);
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setHydrated(true);
    setIds(readIds());
  }, []);

  const add = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      writeIds(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.filter((x) => x !== id);
      writeIds(next);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeIds(next);
      return next;
    });
  }, []);

  const move = useCallback((from: number, to: number) => {
    setIds((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      writeIds(next);
      return next;
    });
  }, []);

  const count = ids.length;
  const max = 6;
  const isSelected = useCallback((id: string) => ids.includes(id), [ids]);
  const isFull = useMemo(() => count >= max, [count]);

  return { hydrated, ids, count, max, add, remove, toggle, move, isSelected, isFull };
}
