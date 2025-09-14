'use client';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type Filters = {
  selectedTypes: string[];
  city: string;
  durationMax: number | null;
  sort: 'score' | 'name' | 'duration' | 'city';
};

const KEY = 'a4d:filters';

function parseArray(q: string | null) {
  return q
    ? q
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
}
function parseNum(q: string | null): number | null {
  const n = q ? Number(q) : NaN;
  return Number.isFinite(n) ? n : null;
}

export function useFilters(
  initial: Filters = {
    selectedTypes: [],
    city: '',
    durationMax: null,
    sort: 'score',
  },
) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // 1) hydrate depuis URL > localStorage > défaut
  const [filters, setFilters] = useState<Filters>(() => {
    const fromUrl: Filters = {
      selectedTypes: parseArray(sp?.get('types') ?? null),
      city: sp?.get('city') ?? '',
      durationMax: parseNum(sp?.get('dmax') ?? null),
      sort: ((sp?.get('sort') as Filters['sort']) || 'score') as Filters['sort'],
    };
    if (
      fromUrl.selectedTypes.length ||
      fromUrl.city ||
      fromUrl.durationMax !== null ||
      fromUrl.sort !== 'score'
    ) {
      return fromUrl;
    }
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...initial, ...JSON.parse(raw) } : initial;
    } catch {
      return initial;
    }
  });

  // 2) push -> URL (remplace sans scroll) + localStorage
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.selectedTypes.length) params.set('types', filters.selectedTypes.join(','));
    if (filters.city.trim()) params.set('city', filters.city.trim());
    if (typeof filters.durationMax === 'number') params.set('dmax', String(filters.durationMax));
    if (filters.sort !== 'score') params.set('sort', filters.sort);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    try {
      localStorage.setItem(KEY, JSON.stringify(filters));
    } catch {}
  }, [filters, router, pathname]);

  const activeCount = useMemo(
    () =>
      (filters.selectedTypes.length ? 1 : 0) +
      (filters.city.trim() ? 1 : 0) +
      (typeof filters.durationMax === 'number' ? 1 : 0) +
      (filters.sort !== 'score' ? 1 : 0),
    [filters],
  );

  function reset() {
    setFilters({ selectedTypes: [], city: '', durationMax: null, sort: 'score' });
  }

  return { filters, setFilters, activeCount, reset };
}
