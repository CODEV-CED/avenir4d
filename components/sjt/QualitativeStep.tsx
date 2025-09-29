'use client';

import React, { useMemo } from 'react';
import { H2 } from '@/components/UI/Typography';
import type { QualInputs } from '@/lib/sweetspot/types';

type Props = {
  answers: QualInputs;
  onChange: (field: keyof QualInputs, value: string) => void;
  onPrevious: () => void;
  onFinish: () => void | Promise<void>;
  isSubmitting?: boolean;
};

// Suggestions rapides par champ
const SUGGESTIONS: Record<keyof QualInputs, string[]> = {
  dimancheMatin: [
    'Je teste des idées de projets',
    'Je lis / regarde des contenus sur la tech',
    'Je fais du sport avec des amis',
    'Je dessine / compose / crée',
  ],
  algoPersonnel: [
    'J’apprends vite en pratiquant',
    'Je simplifie les choses pour les autres',
    'Je connecte des idées / des gens',
    'Je réfléchis calmement puis j’exécute',
  ],
  talentReconnu: [
    'Expliquer clairement',
    'Motiver un groupe',
    'Trouver des solutions',
    'Créer des visuels / maquettes',
  ],
  indignationMax: [
    'Injustices / inégalités d’accès',
    'Désinformation / harcèlement',
    'Gaspillage / environnement',
    'Complexité inutile / paperasse',
  ],
};

export function QualitativeStep({ answers, onChange, onPrevious, onFinish, isSubmitting }: Props) {
  // petite règle anti-submit vide
  const ready = useMemo(() => {
    const min = 6; // saisie minimale
    return (
      (answers.dimancheMatin?.trim().length ?? 0) >= min &&
      (answers.algoPersonnel?.trim().length ?? 0) >= min &&
      (answers.talentReconnu?.trim().length ?? 0) >= min &&
      (answers.indignationMax?.trim().length ?? 0) >= min
    );
  }, [answers]);

  function addChip(field: keyof QualInputs, text: string) {
    const cur = (answers[field] ?? '').trim();
    if (!cur) return onChange(field, text);
    // ajoute proprement
    const sep = cur.endsWith('.') ? ' ' : ' · ';
    onChange(field, `${cur}${sep}${text}`);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--ny-panel,#151520)] p-5 text-[var(--ny-text,#e8e8f0)] md:p-7">
      {/* Bandeau titre */}
      <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4">
        <H2 className="text-xl font-semibold text-white md:text-2xl">Quelques mots sur toi</H2>
        <p className="mt-1 text-sm text-white/70">
          Dis-le avec tes mots. Pas de “bonne” réponse — on cherche des éléments concrets qui te
          ressemblent.
        </p>
      </div>

      <div className="grid gap-6">
        {/* DIMANCHE MATIN */}
        <FieldBlock
          label="Le dimanche matin, je fais souvent…"
          placeholder="Ex. je bricole des idées, je lis sur la tech, je compose de la musique…"
          value={answers.dimancheMatin ?? ''}
          onChange={(v) => onChange('dimancheMatin', v)}
          chips={SUGGESTIONS.dimancheMatin}
          onChip={(t) => addChip('dimancheMatin', t)}
        />

        {/* ALGO PERSO */}
        <FieldBlock
          label="Mon “algorithme perso” (ce que j’adore faire, ma manière)"
          placeholder="Ex. j’apprends en testant ; je connecte des idées ; j’aime clarifier puis exécuter…"
          value={answers.algoPersonnel ?? ''}
          onChange={(v) => onChange('algoPersonnel', v)}
          chips={SUGGESTIONS.algoPersonnel}
          onChip={(t) => addChip('algoPersonnel', t)}
        />

        {/* TALENT RECONNU */}
        <FieldBlock
          label="On me reconnaît surtout pour…"
          placeholder="Ex. expliquer simplement ; motiver un groupe ; trouver des solutions ; créer des visuels…"
          value={answers.talentReconnu ?? ''}
          onChange={(v) => onChange('talentReconnu', v)}
          chips={SUGGESTIONS.talentReconnu}
          onChip={(t) => addChip('talentReconnu', t)}
        />

        {/* INDIGNATION MAX */}
        <FieldBlock
          label="Ce qui m’énerve le plus / que j’aimerais changer…"
          placeholder="Ex. inégalités d’accès ; gaspillage ; désinformation ; complexité inutile…"
          value={answers.indignationMax ?? ''}
          onChange={(v) => onChange('indignationMax', v)}
          chips={SUGGESTIONS.indignationMax}
          onChip={(t) => addChip('indignationMax', t)}
        />
      </div>

      {/* Actions */}
      <div className="mt-7 flex items-center justify-between">
        <button
          onClick={onPrevious}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10"
        >
          ← Retour
        </button>

        <button
          onClick={onFinish}
          disabled={!ready || !!isSubmitting}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{
            background:
              'linear-gradient(90deg, var(--ny-accent,#a855f7), var(--ny-accent-2,#06b6d4))',
          }}
        >
          {isSubmitting ? 'Envoi…' : 'Terminer ✅'}
        </button>
      </div>
    </div>
  );
}

/** Bloc champ + suggestions (composant interne) */
function FieldBlock({
  label,
  value,
  onChange,
  placeholder,
  chips,
  onChip,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  chips?: string[];
  onChip?: (text: string) => void;
}) {
  const count = value.trim().length;

  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-white/85">{label}</div>
        <div className="text-xs text-white/50">{count} caractères</div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[var(--ny-accent,#a855f7)]"
      />

      {chips && chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChip?.(c)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:bg-white/10"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </label>
  );
}
