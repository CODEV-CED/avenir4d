'use client';

import { motion } from 'framer-motion';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import clsx from 'clsx';

type Props = { className?: string };

const DIM_META = {
  passions: { label: 'Passions', color: 'bg-pink-500', ring: 'ring-pink-400/50' },
  talents: { label: 'Talents', color: 'bg-blue-500', ring: 'ring-blue-400/50' },
  utilite: { label: 'Utilité', color: 'bg-emerald-500', ring: 'ring-emerald-400/50' },
  viabilite: { label: 'Viabilité', color: 'bg-yellow-400', ring: 'ring-yellow-300/50' },
} as const;

export default function IkigaiLegend({ className }: Props) {
  const active = useSweetSpotStore((s) => s.activeDims);
  const toggle = useSweetSpotStore((s) => s.toggleDim);
  const clear = useSweetSpotStore((s) => s.clearDims);
  const mode = useSweetSpotStore((s) => s.filterMode);
  const setMode = useSweetSpotStore((s) => s.setFilterMode);

  return (
    <div className={clsx('flex flex-wrap items-center justify-between gap-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(DIM_META) as Array<keyof typeof DIM_META>).map((key) => {
          const m = DIM_META[key];
          const isOn = active.includes(key as any);
          return (
            <motion.button
              key={key}
              onClick={() => toggle(key as any)}
              whileTap={{ scale: 0.96 }}
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 transition',
                isOn ? 'bg-white/90 text-gray-900' : 'bg-white/10 text-white/80 hover:bg-white/15',
                m.ring,
              )}
            >
              <span className={clsx('h-2 w-2 rounded-full', m.color)} />
              {m.label}
              {isOn && <span className="ml-1 text-[10px] text-gray-500">ON</span>}
            </motion.button>
          );
        })}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={clear}
          className="ml-1 inline-flex items-center rounded-full bg-transparent px-2 py-1 text-[11px] text-white/70 ring-1 ring-white/20 hover:bg-white/10"
          title="Afficher toutes les dimensions"
        >
          Réinitialiser
        </motion.button>
      </div>

      {/* Mini toggle Union / Intersection */}
      <div className="inline-flex overflow-hidden rounded-full ring-1 ring-white/20">
        <button
          onClick={() => setMode('union')}
          className={clsx(
            'px-3 py-1 text-xs transition',
            mode === 'union'
              ? 'bg-white/90 text-gray-900'
              : 'bg-white/10 text-white/80 hover:bg-white/15',
          )}
          title="Au moins une dimension sélectionnée"
        >
          Union
        </button>
        <button
          onClick={() => setMode('intersection')}
          className={clsx(
            'px-3 py-1 text-xs transition',
            mode === 'intersection'
              ? 'bg-white/90 text-gray-900'
              : 'bg-white/10 text-white/80 hover:bg-white/15',
          )}
          title="Toutes les dimensions sélectionnées"
        >
          Intersection
        </button>
      </div>
    </div>
  );
}
