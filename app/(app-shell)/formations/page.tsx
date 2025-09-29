'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiltersBar } from '@/components/filters/FiltersBar';
import { FormationCard } from '@/components/reco/FormationCard';
import { MesVoeuxPanel } from '@/components/MesVoeuxPanel';
import { useVoeux } from '@/lib/voeux';
import { H1, Paragraph } from '@/components/UI/Typography';

import formationsData from '@/data/formations.json';
import type { FormationStatic as FormationStaticOfficial, FormationType } from '@/types/formation';

// utils
const allTypesFromData = (list?: FormationStaticOfficial[]) =>
  Array.from(new Set((list ?? []).map((f) => f.type)));

const allCitiesFromData = (list?: FormationStaticOfficial[]) =>
  Array.from(new Set((list ?? []).map((f) => f.ville).filter((v): v is string => !!v)));

function ensureAnonId(): string {
  const KEY = 'a4d:anonId';
  let id = '';
  try {
    id = localStorage.getItem(KEY) || '';
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(KEY, id);
    }
  } catch {}
  return id;
}

export default function FormationsPage() {
  // normalisation dataset pour typer strict
  const formations: FormationStaticOfficial[] = (formationsData as any[]).map((f) => ({
    id: String(f.id),
    nom: String(f.nom),
    type: f.type as FormationType,
    duree: typeof f.duree === 'number' ? f.duree : 3,
    etablissement: typeof f.etablissement === 'string' ? f.etablissement : '',
    ville: typeof f.ville === 'string' ? f.ville : '',
    code_postal: typeof f.code_postal === 'string' ? f.code_postal : '',
    plaisir_tags: Array.isArray(f.plaisir_tags) ? f.plaisir_tags : [],
    competence_tags: Array.isArray(f.competence_tags) ? f.competence_tags : [],
    utilite_tags: Array.isArray(f.utilite_tags) ? f.utilite_tags : [],
    viabilite_data: f.viabilite_data ?? undefined,
    confidence: typeof f.confidence === 'number' ? f.confidence : 0,
  }));

  // Filtres
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [city, setCity] = useState<string>('');
  const [durationMax, setDurationMax] = useState<number | null>(null);
  const [sort, setSort] = useState<'score' | 'name' | 'duration' | 'city'>('score');

  const allTypes = useMemo(() => allTypesFromData(formations), [formations]);
  const allCities = useMemo(() => allCitiesFromData(formations), [formations]);

  // vœux
  const { ids: wishIds, isFull, add, remove } = useVoeux();

  // liste filtrée + triée
  const list = useMemo(() => {
    let arr = [...formations];

    if (selectedTypes.length) arr = arr.filter((f) => selectedTypes.includes(f.type));
    if (city.trim()) {
      const c = city.trim().toLowerCase();
      arr = arr.filter((f) => (f.ville || '').toLowerCase().includes(c));
    }
    if (durationMax != null) arr = arr.filter((f) => (f.duree ?? 99) <= durationMax);

    switch (sort) {
      case 'name':
        arr.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'duration':
        arr.sort((a, b) => (a.duree ?? 99) - (b.duree ?? 99));
        break;
      case 'city':
        arr.sort((a, b) => (a.ville || '').localeCompare(b.ville || ''));
        break;
      default:
        arr.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
    }

    return arr;
  }, [formations, selectedTypes, city, durationMax, sort]);

  const resetFilters = () => {
    setSelectedTypes([]);
    setCity('');
    setDurationMax(null);
    setSort('score');
  };

  async function sendFeedback(formationId: string, kind: 'feedback_up' | 'feedback_down') {
    const anonId = ensureAnonId();
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: kind, formationId, anonId }),
      });
    } catch {}
  }

  useEffect(() => {
    ensureAnonId();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b10] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-4">_</div>

        <H1 className="text-2xl">Explorer les formations</H1>
        <Paragraph className="text-sm text-white/60">
          Filtre, compare et ajoute à tes vœux.
        </Paragraph>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr_320px]">
          {/* Filtres */}
          <aside className="sticky top-6 space-y-4 self-start">
            <FiltersBar
              allTypes={allTypes}
              allCities={allCities}
              selectedTypes={selectedTypes}
              onToggleType={(t: string) =>
                setSelectedTypes((prev) =>
                  prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
                )
              }
              city={city}
              onCityChange={(c: string) => setCity(c)}
              durationMax={durationMax}
              onDurationChange={(d: number | null) => setDurationMax(d)}
              sort={sort}
              onSortChange={(s: 'score' | 'name' | 'duration' | 'city') => setSort(s)}
              onReset={resetFilters}
            />
          </aside>

          {/* Liste */}
          <main className="space-y-4">
            <div className="text-sm text-white/60">{list.length} résultats après filtres</div>

            {list.slice(0, 24).map((f) => (
              <FormationCard
                key={f.id}
                id={f.id}
                title={`${f.type} ${f.nom}`}
                type={f.type}
                school={f.etablissement ?? ''}
                city={f.ville ?? ''}
                tags={[
                  ...(f.plaisir_tags ?? []),
                  ...(f.competence_tags ?? []),
                  ...(f.utilite_tags ?? []),
                ]}
                score={f.confidence ?? 0}
                inWishlist={(wishIds ?? []).includes(f.id)}
                wishlistLimit={isFull}
                onAdd={() => {
                  if (!isFull) add?.(f.id);
                }}
                onRemove={() => remove?.(f.id)}
                onVote={(v) => sendFeedback(f.id, v === 'up' ? 'feedback_up' : 'feedback_down')}
              />
            ))}

            {list.length > 24 && (
              <div className="pt-2 text-center">
                <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10">
                  Afficher plus ({list.length - 24} restants)
                </button>
              </div>
            )}
          </main>

          {/* Mes vœux */}
          <MesVoeuxPanel formationsAll={formations} />
        </div>
      </div>
    </div>
  );
}
