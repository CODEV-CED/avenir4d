
'use client';
import { useMemo } from 'react';

type FiltersBarProps = {
  allTypes: string[];
  allCities: string[];
  selectedTypes: string[];
  onToggleType: (t: string) => void;
  city: string;
  onCityChange: (c: string) => void;
  durationMax: number | null;
  onDurationChange: (d: number | null) => void;
  sort: 'score' | 'name' | 'duration' | 'city';
  onSortChange: (s: 'score' | 'name' | 'duration' | 'city') => void;
  onReset: () => void;
};

export function FiltersBar({
  allTypes, allCities,
  selectedTypes, onToggleType,
  city, onCityChange,
  durationMax, onDurationChange,
  sort, onSortChange,
  onReset
}: FiltersBarProps) {
  const durations = [2, 3, 5] as const;

  const cityOptions = useMemo(() => {
    const uniq = Array.from(new Set(allCities.filter(Boolean))).sort((a,b) => a.localeCompare(b));
    return ['Toutes', ...uniq];
  }, [allCities]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-sm font-semibold text-white/80">Filtres</div>

      {/* Types */}
      <div className="mb-4">
        <div className="mb-2 text-xs text-white/60">Type :</div>
        <div className="flex flex-wrap gap-2">
          {allTypes.map((t) => {
            const active = selectedTypes.includes(t);
            return (
              <button
                key={t}
                onClick={() => onToggleType(t)}
                className={`rounded-lg px-3 py-1.5 text-xs transition ${
                  active
                    ? 'border border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-100'
                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Ville */}
      <div className="mb-4">
        <div className="mb-2 text-xs text-white/60">Ville :</div>
        <select
          value={city || 'Toutes'}
          onChange={(e) => onCityChange(e.target.value === 'Toutes' ? '' : e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
        >
          {cityOptions.map((c) => (
            <option key={c} value={c} className="bg-[#0b0b10]">
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Durée max */}
      <div className="mb-4">
        <div className="mb-2 text-xs text-white/60">Durée max :</div>
        <div className="flex flex-wrap gap-2">
          {durations.map((d) => {
            const active = durationMax === d;
            return (
              <button
                key={d}
                onClick={() => onDurationChange(active ? null : d)}
                className={`rounded-lg px-3 py-1.5 text-xs transition ${
                  active
                    ? 'border border-cyan-400/50 bg-cyan-500/20 text-cyan-100'
                    : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                ≤ {d} ans
              </button>
            );
          })}
          <button
            onClick={() => onDurationChange(null)}
            className={`rounded-lg px-3 py-1.5 text-xs transition ${
              durationMax == null
                ? 'border border-lime-400/50 bg-lime-500/20 text-lime-100'
                : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            Toutes
          </button>
        </div>
      </div>

      {/* Tri */}
      <div className="mb-4">
        <div className="mb-2 text-xs text-white/60">Trier par :</div>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as any)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40"
        >
          <option value="score" className="bg-[#0b0b10]">Pertinence (score)</option>
          <option value="name" className="bg-[#0b0b10]">Nom</option>
          <option value="duration" className="bg-[#0b0b10]">Durée</option>
          <option value="city" className="bg-[#0b0b10]">Ville</option>
        </select>
      </div>

      <button
        onClick={onReset}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 hover:bg-white/10"
      >
        Réinitialiser
      </button>
    </div>
  );
}
