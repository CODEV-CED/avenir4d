'use client';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';

export default function AutoAdjustBanner() {
  const { autoAdjust, clearAutoAdjust } = useSweetSpotStore((s) => ({
    autoAdjust: s.autoAdjust,
    clearAutoAdjust: s.clearAutoAdjust,
  }));

  useEffect(() => {
    if (!autoAdjust) return;
    const t = setTimeout(() => clearAutoAdjust(), 1200);
    return () => clearTimeout(t);
  }, [autoAdjust, clearAutoAdjust]);

  const msg = (() => {
    if (!autoAdjust) return '';
    const k = autoAdjust.adjusted?.key;
    const to = autoAdjust.adjusted ? Math.round(autoAdjust.adjusted.to * 100) : null;
    if (autoAdjust.type === 'viabilityMin') return 'Viabilité minimale 15% appliquée';
    if (autoAdjust.type === 'gap' && k && to !== null)
      return `Écart limité à 0.40 — ajustement de ${label(k)} à ${to}%`;
    if (autoAdjust.type === 'clamp' && k && to !== null)
      return `Valeur limitée — ${label(k)} → ${to}%`;
    return 'Ajustement automatique appliqué';
  })();

  return (
    <AnimatePresence>
      {autoAdjust && (
        <motion.div
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="fixed top-4 right-4 z-[60] rounded-lg bg-[var(--ny-panel)]/90 px-3 py-2 text-xs text-white shadow-lg ring-1 ring-white/10 backdrop-blur"
          role="status"
          aria-live="polite"
        >
          <span className="font-semibold">Règle active</span> — {msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function label(k: 'passions' | 'talents' | 'utilite' | 'viabilite') {
  switch (k) {
    case 'passions':
      return 'Passions';
    case 'talents':
      return 'Talents';
    case 'utilite':
      return 'Utilité';
    case 'viabilite':
      return 'Viabilité';
  }
}
