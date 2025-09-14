import type { Filters } from '@/hooks/useFilters';

export function filtersToQuery(f: Filters) {
  const p = new URLSearchParams();
  if (f.selectedTypes.length) p.set('types', f.selectedTypes.join('|'));
  if (f.city) p.set('city', f.city);
  if (typeof f.durationMax === 'number') p.set('dur', String(f.durationMax));
  if (f.sort && f.sort !== 'score') p.set('sort', f.sort); // score = défaut
  return p.toString();
}

export function queryToFilters(sp: URLSearchParams | null): Partial<Filters> {
  const r: Partial<Filters> = {};
  if (!sp) return r;
  const types = sp.get('types');
  if (types) r.selectedTypes = types.split('|').filter(Boolean);
  const city = sp.get('city');
  if (city) r.city = city;
  const dur = sp.get('dur');
  if (dur != null && dur !== '') r.durationMax = Number(dur);
  const sort = sp.get('sort');
  if (sort === 'name' || sort === 'duration' || sort === 'city' || sort === 'score') r.sort = sort;
  return r;
}
