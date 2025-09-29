'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function TagBoostBar({ className = 'card' }: { className?: string }) {
  // ✅ NE PAS utiliser (s)=>({ ... }) ici → crée un nouvel objet à chaque render
  const selectedTags = useSweetSpotStore((s) => s.selectedTags);
  const candidateTags = useSweetSpotStore((s) => s.candidateTags);
  const boostEnabled = useSweetSpotStore((s) => s.boostEnabled);

  const addTag = useSweetSpotStore((s) => s.addTag);
  const removeTag = useSweetSpotStore((s) => s.removeTag);
  const setBoostEnabled = useSweetSpotStore((s) => s.setBoostEnabled);
  const fetchConvergences = useSweetSpotStore((s) => s.fetchConvergences);

  // Pour recalculer les suggestions quand la source évolue
  const userKeywords = useSweetSpotStore((s) => s.userKeywords);
  const convergences = useSweetSpotStore((s) => s.convergences);

  const hydrateTagsFromKeywords = useSweetSpotStore((s) => s.hydrateTagsFromKeywords);
  const searchTagSuggestions = useSweetSpotStore((s) => s.searchTagSuggestions);

  const [q, setQ] = useState('');

  // ✅ Hydrate candidats AU MONTAGE seulement (évite la boucle)
  useEffect(() => {
    hydrateTagsFromKeywords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Met à jour les candidats quand les données sources changent
  useEffect(() => {
    hydrateTagsFromKeywords();
  }, [userKeywords, convergences, hydrateTagsFromKeywords]);

  const shown = useMemo(() => {
    const base = q.trim() ? [] : candidateTags;
    return Array.from(new Set(base))
      .filter((t) => !selectedTags.includes(t))
      .slice(0, 8);
  }, [candidateTags, selectedTags, q]);

  // Recherche serveurs (facultatif), pas de setState autre que setQ
  useEffect(() => {
    let cancel = false;
    (async () => {
      const term = q.trim();
      if (term.length < 2) return;
      await searchTagSuggestions(term);
      if (cancel) return;
      // pas d'update ici → pas de boucle
    })();
    return () => {
      cancel = true;
    };
  }, [q, searchTagSuggestions]);

  return (
    <div className={clsx(className)}>
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className='text-white font-semibold'>Boost par tags</div>
          <div className="text-xs text-white/60">
            Augmente la force des mots-clés présents dans vos tags.
          </div>
        </div>

        {/* Toggle */}
        <label className="inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={boostEnabled}
            onChange={(e) => {
              setBoostEnabled(e.target.checked);
              fetchConvergences();
            }}
          />
          <span className='mr-2 text-xs text-white/60'>{boostEnabled ? 'ON' : 'OFF'}</span>
          <div className="relative h-6 w-11 rounded-full bg-gray-400/40 transition peer-checked:bg-emerald-500">
            <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
          </div>
        </label>
      </div>

      {/* Selected chips */}
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedTags.map((t) => (
          <motion.span
            key={t}
            layout
            className="inline-flex items-center gap-1 rounded-full border border-emerald-400/60 bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-100 transition"
          >
            #{t}
            <button
              className="rounded bg-white/10 px-1 text-[10px] text-white/80 hover:bg-white/20"
              onClick={() => removeTag(t)}
              aria-label={`Retirer ${t}`}
            >
              ×
            </button>
          </motion.span>
        ))}
        {selectedTags.length === 0 && (
          <span className='text-xs text-white/60'>Aucun tag sélectionné</span>
        )}
      </div>

      {/* Input + suggestions */}
      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && q.trim()) {
              addTag(q);
              setQ('');
            }
          }}
          placeholder="Ajouter un tag (ex: design, IA…) — Entrée pour valider"
          className="flex-1 rounded-md border border-white/15 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-white/30"
        />
        <button
          onClick={() => {
            if (q.trim()) {
              addTag(q);
              setQ('');
            }
          }}
          className='rounded-md border border-white/15 px-2 py-1 text-sm text-white hover:bg-white/10'
        >
          Ajouter
        </button>
      </div>

      {shown.length > 0 && (
        <div className='mt-2 flex flex-wrap items-center gap-2'>
          <span className="text-[11px] text-white/50">Suggestions :</span>
          {shown.map((t) => (
            <button
              key={`sugg-${t}`}
              onClick={() => addTag(t)}
              className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-slate-200 transition hover:border-white/40"
            >
              #{t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
