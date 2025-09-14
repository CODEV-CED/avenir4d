// components/IkigaiControls.tsx
'use client';
import { useEffect, useState } from 'react';
import type { Profile4D } from '@/types/sjt';
import { loadProfile, clearProfile } from '@/lib/storage';

type Props = {
  value: Profile4D;
  onChange: (next: Profile4D) => void;
  showResetLink?: boolean; // facultatif
};

function Row({ label, v, onChange }: { label: string; v: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-48 text-sm text-gray-700">{label}</div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-64 accent-indigo-600"
        aria-label={label}
      />
      {/* suppressHydrationWarning to avoid SSR/CSR % mismatch */}
      <div className="w-12 text-sm text-gray-600 tabular-nums" suppressHydrationWarning>
        {Math.round(v * 100)}%
      </div>
    </div>
  );
}

export default function IkigaiControls({ value, onChange, showResetLink = false }: Props) {
  // 0) Mount flag — but DO NOT return before other hooks
  const [mounted, setMounted] = useState(false);

  // 1) État local pour des sliders fluides
  const [plaisir, setPlaisir] = useState(value.plaisir);
  const [competence, setCompetence] = useState(value.competence);
  const [utilite, setUtilite] = useState(value.utilite);
  const [viabilite, setViabilite] = useState(value.viabilite);
  const [confidence, setConfidence] = useState(value.confidence_avg);

  // 2) Marquer le composant comme monté (après première peinture)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3) Hydrate une seule fois depuis le SJT si présent (après mount)
  useEffect(() => {
    const p = loadProfile();
    if (!p) return;
    setPlaisir(p.plaisir);
    setCompetence(p.competence);
    setUtilite(p.utilite);
    setViabilite(p.viabilite);
    setConfidence(p.confidence_avg ?? 0.7);
    onChange({
      plaisir: p.plaisir,
      competence: p.competence,
      utilite: p.utilite,
      viabilite: p.viabilite,
      confidence_avg: p.confidence_avg ?? 0.7,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]); // se déclenche après mount

  // 4) Si le parent change `value`, resynchroniser l’état local
  useEffect(() => {
    setPlaisir(value.plaisir);
    setCompetence(value.competence);
    setUtilite(value.utilite);
    setViabilite(value.viabilite);
    setConfidence(value.confidence_avg);
  }, [value]);

  // 5) Helper pour pousser les updates au parent
  function pushNext(patch: Partial<Profile4D>) {
    const next: Profile4D = {
      plaisir,
      competence,
      utilite,
      viabilite,
      confidence_avg: confidence,
      ...patch,
    };
    onChange(next);
  }

  // 6) SKELETON pendant l’hydratation, sans casser l’ordre des hooks
  if (!mounted) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-48 rounded bg-gray-200" />
              <div className="h-2 w-64 rounded bg-gray-200" />
              <div className="h-4 w-12 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 7) UI normale
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold">Réglages Ikigaï</h2>

      <Row
        label="Plaisir"
        v={plaisir}
        onChange={(v) => {
          setPlaisir(v);
          pushNext({ plaisir: v });
        }}
      />
      <Row
        label="Compétence"
        v={competence}
        onChange={(v) => {
          setCompetence(v);
          pushNext({ competence: v });
        }}
      />
      <Row
        label="Utilité"
        v={utilite}
        onChange={(v) => {
          setUtilite(v);
          pushNext({ utilite: v });
        }}
      />
      <Row
        label="Viabilité"
        v={viabilite}
        onChange={(v) => {
          setViabilite(v);
          pushNext({ viabilite: v });
        }}
      />

      <div className="mt-2 border-t pt-2">
        <Row
          label="Confiance du profil"
          v={confidence}
          onChange={(v) => {
            setConfidence(v);
            pushNext({ confidence_avg: v });
          }}
        />
      </div>

      {showResetLink && (
        <button
          type="button"
          onClick={() => {
            clearProfile();
            setPlaisir(0.6);
            setCompetence(0.6);
            setUtilite(0.6);
            setViabilite(0.6);
            setConfidence(0.7);
            onChange({
              plaisir: 0.6,
              competence: 0.6,
              utilite: 0.6,
              viabilite: 0.6,
              confidence_avg: 0.7,
            });
          }}
          className="mt-3 text-xs text-gray-500 underline"
        >
          Réinitialiser le profil
        </button>
      )}
    </div>
  );
}
