'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSweetSpotStore, type Convergence as StoreConvergence } from '@/store/useSweetSpotStore';

// hash stable (0..1) from keyword to place chips deterministically
function hash01(s: string) {
  let h = 2166136261 >>> 0; // FNV-1a seed
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 2 ** 32;
}

export default function ConvergenceCloud({
  max = 8,
  baseRadius = 110,
  minRadius = 20,
}: {
  max?: number;
  baseRadius?: number;
  minRadius?: number;
}) {
  const convergences = useSweetSpotStore((s) => s.convergences as StoreConvergence[]);

  const items = useMemo(() => {
    if (!Array.isArray(convergences))
      return [] as Array<
        StoreConvergence & { x: number; y: number; scale: number; opacity: number }
      >;

    const top = [...convergences]
      .filter((c) => c && typeof c.strength === 'number')
      .sort((a, b) => b.strength - a.strength)
      .slice(0, max);

    return top.map((c) => {
      const a = hash01(c.keyword) * Math.PI * 2; // stable angle
      const r = Math.max(minRadius, (1 - c.strength) * baseRadius); // stronger → closer to center
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      const scale = 0.9 + c.strength * 0.5; // 0.9 → 1.4
      const opacity = 0.6 + c.strength * 0.4; // 0.6 → 1.0
      return { ...c, x, y, scale, opacity };
    });
  }, [convergences, max, baseRadius, minRadius]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
      <AnimatePresence>
        {items.map((c) => (
          <motion.div
            key={c.keyword}
            initial={{ x: 0, y: 0, scale: 0.8, opacity: 0 }}
            animate={{ x: c.x, y: c.y, scale: c.scale, opacity: c.opacity }}
            exit={{ x: 0, y: 0, scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            title={`Force ${Math.round(c.strength * 100)}% — ${c.matchedDimensions.join(', ')}${
              c.boostedBy?.length ? `\nBoosté par : ${c.boostedBy.join(', ')}` : ''
            }`}
          >
            <span
              className={[
                'rounded-full px-2.5 py-1 text-xs font-medium shadow select-none',
                c.boosted
                  ? 'bg-emerald-600/90 text-white ring-1 ring-white/15'
                  : 'bg-white/85 text-gray-900 ring-1 ring-black/10',
              ].join(' ')}
            >
              {c.keyword}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
