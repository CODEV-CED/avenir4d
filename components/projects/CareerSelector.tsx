'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import type { CareerSelectorProps } from '@/types/project-laboratory.types';
import type { EmergingCareerBatch3 } from '@/data/emerging-careers-batch3';
import {
  FORMATION_LABELS,
  getFormationShortLabel,
  getFormationType,
} from '@/data/parcoursup-vocabulary';
import {
  ATTENDU_LABELS,
  ATTENDUS_BY_CATEGORY,
  ATTENDU_CATEGORY_LABELS,
} from '@/data/parcoursup-vocabulary';
import { EMERGING_CAREERS_BATCH3 } from '@/data/emerging-careers-batch3'; // <-- assure-toi du nom

const categoryLabels: Record<string, string> = {
  tech_durable: 'Tech × Durable',
  tech_creative: 'Tech × Créatif',
  ethique_tech: 'Éthique × Tech',
  economie_circulaire: 'Économie circulaire',
  industrie_4_0: 'Industrie 4.0',
  energie_mobilite: 'Énergie & Mobilité',
};

export function CareerSelector({
  careers = EMERGING_CAREERS_BATCH3,
  onSelect,
  maxSelection = 1,
}: CareerSelectorProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | 'all'>('all');
  const [attenduFilter, setAttenduFilter] = useState<string | ''>('');

  // Mappage cohérent pour l’affichage
  const normalized: EmergingCareerBatch3[] = useMemo(() => {
    return careers.map((c) => {
      const formations = c.formationsParcoursup ?? c.formations ?? [];
      const attendus = c.attendusParcoursup ?? c.attendus ?? [];
      const miniProjets = c.miniProjetsLycee ?? c.miniProjets ?? [];
      return {
        ...c,
        formationsParcoursup: formations,
        attendusParcoursup: attendus,
        miniProjetsLycee: miniProjets,
      };
    });
  }, [careers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalized.filter((c) => {
      const formations = c.formationsParcoursup ?? c.formations ?? [];
      const attendus = c.attendusParcoursup ?? c.attendus ?? [];

      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        formations.some((f) => (FORMATION_LABELS[f] || f).toLowerCase().includes(q));

      const matchCategory = category === 'all' || c.category === category;
      const matchAttendu = !attenduFilter || attendus.includes(attenduFilter as any);

      return matchSearch && matchCategory && matchAttendu;
    });
  }, [normalized, search, category, attenduFilter]);

  return (
    <div className="space-y-4" role="listbox" aria-label="Sélection d'un métier de départ">
      {/* Filtres */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-xs text-white/60" htmlFor="career-search">
            Rechercher un métier
          </label>
          <input
            id="career-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ex: green, no-code, jumeaux…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-white/40 outline-none focus:border-white/20"
            aria-describedby="career-search-help"
          />
          <p id="career-search-help" className="mt-1 text-[11px] text-white/40">
            Tape un mot-clé (ex : green, privacy, batteries)
          </p>
        </div>

        <div>
          <label className="text-xs text-white/60" htmlFor="career-category">
            Catégorie
          </label>
          <select
            id="career-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/20"
          >
            <option value="all">Toutes</option>
            {Array.from(new Set(normalized.map((c) => c.category))).map((cat) => (
              <option key={cat} value={cat}>
                {categoryLabels[cat] || cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-white/60" htmlFor="career-attendu">
            Attendu Parcoursup
          </label>
          <select
            id="career-attendu"
            value={attenduFilter}
            onChange={(e) => setAttenduFilter(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-white/20"
          >
            <option value="">Tous</option>
            {Object.entries(ATTENDUS_BY_CATEGORY).map(([cat, items]) => (
              <optgroup
                key={cat}
                label={ATTENDU_CATEGORY_LABELS[cat as keyof typeof ATTENDU_CATEGORY_LABELS]}
              >
                {items.map((a) => (
                  <option key={a} value={a}>
                    {ATTENDU_LABELS[a]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Grid métiers */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c)}
            className="group h-full cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-black/70 to-black/50 p-4 text-left transition hover:border-white/20 hover:shadow-xl"
            aria-label={`Sélectionner le métier ${c.title}`}
            role="option"
            aria-selected={false}
          >
            <div className="flex items-center justify-between">
              <div className="text-3xl">{c.emoji || '✨'}</div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">
                {categoryLabels[c.category] || c.category}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-white">{c.title}</h3>
            <p className="mt-1 line-clamp-3 text-sm text-white/60">{c.description}</p>

            {/* Formations */}
            <div className="mt-3 space-y-1">
              {(c.formationsParcoursup ?? c.formations ?? []).slice(0, 2).map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/60">
                    {getFormationType(f)}
                  </span>
                  <span className="text-xs text-white/80">{getFormationShortLabel(f)}</span>
                </div>
              ))}
              {(c.formationsParcoursup ?? c.formations ?? []).length > 2 && (
                <div className="text-[11px] text-white/50">
                  + {(c.formationsParcoursup ?? c.formations ?? []).length - 2} autres parcours possibles
                </div>
              )}
            </div>

            {/* Attendus (chips) */}
            <div className="mt-3 flex flex-wrap gap-1">
              {(c.attendusParcoursup ?? c.attendus ?? []).slice(0, 4).map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-white/60"
                >
                  {ATTENDU_LABELS[a]}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-white/50">Clique pour générer des projets</span>
              <span className="rounded-lg bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 transition group-hover:bg-purple-500/30">
                Sélectionner →
              </span>
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-black/60 p-6 text-center text-white/60">
          Aucun métier ne correspond à ta recherche.
        </div>
      )}
    </div>
  );
}
