'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/UI/tooltip';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import type { Convergence as StoreConvergence } from '@/lib/sweetspot/types';

// hash stable (0..1) from keyword to place chips deterministically
function hash01(s: string) {
  let h = 2166136261 >>> 0; // FNV-1a seed
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

// Dimensions helpers for visual dots + filters
const DIM_KEYS = ['passions', 'talents', 'utilite', 'viabilite'] as const;
type DimKey = (typeof DIM_KEYS)[number];
const DOT: Record<DimKey, string> = {
  passions: 'bg-pink-500',
  talents: 'bg-blue-500',
  utilite: 'bg-emerald-500',
  viabilite: 'bg-yellow-400',
};
function normDim(d: string): DimKey | null {
  const s = d.toLowerCase();
  if (s.startsWith('pass')) return 'passions';
  if (s.startsWith('talent')) return 'talents';
  if (s.startsWith('util')) return 'utilite';
  if (s.startsWith('viab')) return 'viabilite';
  return null;
}

export default function ConvergenceCloud({
  max = 8,
  baseRadius = 110,
  minRadius = 20,
  avoidCenterRadius = 40,
}: {
  max?: number;
  baseRadius?: number;
  minRadius?: number;
  avoidCenterRadius?: number;
}) {
  const convergences = useSweetSpotStore((s) => s.convergences as StoreConvergence[]);
  const active = useSweetSpotStore((s) => s.activeDims as DimKey[]);
  const mode = useSweetSpotStore((s) => s.filterMode);

  const items = useMemo(() => {
    const list = Array.isArray(convergences) ? convergences : [];
    const filtered =
      active.length === 0
        ? list
        : list.filter((c) => {
            const dims = c.matchedDimensions
              .map((d: string) => normDim(String(d)))
              .filter(Boolean) as DimKey[];
            if (mode === 'union') {
              return active.some((a) => dims.includes(a));
            }
            return active.every((a) => dims.includes(a));
          });

    const top = [...filtered]
      .filter((c) => c && typeof c.strength === 'number')
      .sort((a, b) => b.strength - a.strength)
      .slice(0, max);

    return top.map((c) => {
      const a = hash01(c.keyword) * Math.PI * 2; // stable angle
      const raw = (1 - c.strength) * baseRadius;
      const r = Math.max(minRadius, raw, avoidCenterRadius);
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      const scale = 0.9 + c.strength * 0.5; // 0.9 → 1.4
      const opacity = 0.6 + c.strength * 0.4; // 0.6 → 1.0
      const dims = DIM_KEYS.filter((k) =>
        c.matchedDimensions.some((d: string) => normDim(String(d)) === k),
      );
      return { ...c, x, y, scale, opacity, dims } as StoreConvergence & {
        x: number;
        y: number;
        scale: number;
        opacity: number;
        dims: DimKey[];
      };
    });
  }, [convergences, active, mode, max, baseRadius, minRadius]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center drop-shadow-[0_0_15px_rgba(255,255,255,0.25)] filter">
      <AnimatePresence>
        {items.map((c) => (
          <motion.div
            key={c.keyword}
            initial={{ x: 0, y: 0, scale: 0.8, opacity: 0 }}
            animate={{ x: c.x, y: c.y, scale: c.scale, opacity: c.opacity }}
            exit={{ x: 0, y: 0, scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={[
                    'rounded-md border px-2.5 py-1 text-[13px] shadow-sm backdrop-blur select-none',
                    'border-white/10 bg-slate-800/90 text-slate-100',
                  ].join(' ')}
                >
                  {c.keyword}
                  <span className="ml-2 inline-flex items-center gap-1 align-middle">
                    {(c as any).dims?.map((d: DimKey) => (
                      <i
                        key={`${c.keyword}-${d}`}
                        className={`inline-block h-1.5 w-1.5 rounded-full ${DOT[d]}`}
                      />
                    ))}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="max-w-xs">
                <p className="text-xs">
                  Force {Math.round(c.strength * 100)}% — {c.matchedDimensions.join(', ')}
                  {c.boostedBy?.length ? (
                    <>
                      <br />
                      Boosté par : {c.boostedBy.join(', ')}
                    </>
                  ) : null}
                </p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
