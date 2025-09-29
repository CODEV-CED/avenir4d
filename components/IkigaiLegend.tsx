'use client';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';

export const DIM_META = {
  passions: { label: 'Passions', color: 'bg-pink-500' },
  talents: { label: 'Talents', color: 'bg-blue-500' },
  utilite: { label: 'Utilité', color: 'bg-emerald-500' },
  viabilite: { label: 'Viabilité', color: 'bg-yellow-400' },
} as const;
type DimKey = keyof typeof DIM_META;

export default function IkigaiLegend({ className = '' }: { className?: string }) {
  const active = useSweetSpotStore((s) => s.activeDims);
  const toggle = useSweetSpotStore((s) => s.toggleDim);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {(Object.keys(DIM_META) as DimKey[]).map((k) => {
        const on = active.length === 0 || active.includes(k);
        return (
          <button
            key={k}
            onClick={() => toggle(k)}
            className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition ${on ? 'border-white/30 bg-white/10 text-white' : 'border-white/15 text-slate-300 hover:bg-white/5'}`}
            aria-pressed={on}
            title={DIM_META[k].label}
          >
            <i className={`h-2 w-2 rounded-full ${DIM_META[k].color}`} />
            {DIM_META[k].label}
            <span className="ml-1 text-[10px] opacity-70">{on ? 'ON' : 'OFF'}</span>
          </button>
        );
      })}
      {/* 👉 AUCUN bouton Union / Intersection / Réinitialiser ici */}
    </div>
  );
}
