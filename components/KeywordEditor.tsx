'use client';
import { useState } from 'react';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type DimKey = 'passions' | 'talents' | 'utilite' | 'viabilite';
const ORDER: DimKey[] = ['passions', 'talents', 'utilite', 'viabilite'];
const LABEL: Record<DimKey, string> = {
  passions: 'Passions',
  talents: 'Talents',
  utilite: 'Utilité',
  viabilite: 'Viabilité',
};
const COLOR: Record<DimKey, string> = {
  passions: 'bg-pink-500',
  talents: 'bg-blue-500',
  utilite: 'bg-emerald-500',
  viabilite: 'bg-yellow-400',
};

export default function KeywordEditor({ profileId }: { profileId?: string }) {
  const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test';
  const userKeywords = useSweetSpotStore((s) => s.userKeywords);
  const addKeyword = useSweetSpotStore((s) => s.addKeyword);
  const removeKeyword = useSweetSpotStore((s) => s.removeKeyword);
  const saveKeywords = useSweetSpotStore((s) => s.saveKeywords);
  const keywordsDirty = useSweetSpotStore((s) => s.keywordsDirty);
  const savingKeywords = useSweetSpotStore((s) => s.savingKeywords);

  const [drafts, setDrafts] = useState<Record<DimKey, string>>({
    passions: '',
    talents: '',
    utilite: '',
    viabilite: '',
  });

  const onAdd = (dim: DimKey) => {
    const v = drafts[dim].trim();
    if (!v) return;
    addKeyword(dim, v);
    setDrafts((d) => ({ ...d, [dim]: '' }));
  };

  return (
    <div className="mb-6 grid gap-3 md:grid-cols-2">
      {ORDER.map((dim) => (
        <div key={dim} className="rounded-lg border border-white/10 bg-[var(--surface-0)] p-3">
          <div className="mb-2 flex items-center gap-2">
            <span className={clsx('h-2 w-2 rounded-full', COLOR[dim])} />
            <div className='text-sm font-semibold text-white'>{LABEL[dim]}</div>
          </div>

          {/* Liste des tags */}
          <div className="mb-2 flex flex-wrap gap-2">
            {(userKeywords[dim] || []).map((kw) => (
              <motion.span
                key={`${dim}-${kw}`}
                {...(!isTest ? { layout: true } : {})}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 text-xs"
              >
                {kw}
                <button
                  onClick={() => removeKeyword(dim, kw)}
                  className="rounded bg-white/20 px-1 text-[10px] hover:bg-white/30"
                  aria-label={`Retirer ${kw}`}
                >
                  ×
                </button>
              </motion.span>
            ))}
          </div>

          {/* Saisie + bouton */}
          <div className="flex gap-2">
            <input
              value={drafts[dim]}
              onChange={(e) => setDrafts((d) => ({ ...d, [dim]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && onAdd(dim)}
              placeholder="Ajouter un mot-clé (Entrée)"
              className="flex-1 rounded-md border border-white/15 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-white/40"
            />
            <button
              onClick={() => onAdd(dim)}
              className='rounded-md border border-white/15 px-2 py-1 text-sm text-white hover:bg-white/10'
            >
              Ajouter
            </button>
          </div>
        </div>
      ))}

      {/* Barre d'action */}
      <div className="mt-1 flex items-center justify-end gap-2 md:col-span-2">
        {keywordsDirty && (
          <span className="text-xs text-amber-300/90">Modifications non enregistrées</span>
        )}
        <button
          disabled={!profileId || !keywordsDirty || savingKeywords}
          onClick={() => profileId && saveKeywords(profileId)}
          className={clsx(
            'rounded-md px-3 py-1.5 text-sm',
            !profileId || !keywordsDirty || savingKeywords
              ? 'cursor-not-allowed border border-white/10 text-white/40'
              : 'border border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10',
          )}
        >
          {savingKeywords ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
