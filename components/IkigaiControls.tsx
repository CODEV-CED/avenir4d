'use client';
import * as React from 'react';
import type { Profile4D } from '@/types/sjt';

type Props = {
  value: Profile4D;
  onChange: (next: Profile4D) => void;
};

type RowProps = {
  label: string;
  v: number;
  onChange: (v: number) => void;
};

function Row({ label, v, onChange }: RowProps) {
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
      <div className="w-12 text-sm text-gray-600 tabular-nums">{Math.round(v * 100)}%</div>
    </div>
  );
}

export default function IkigaiControls({ value, onChange }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-base font-semibold">Réglages Ikigaï</h2>

      <Row label="Plaisir" v={value.plaisir} onChange={(v) => onChange({ ...value, plaisir: v })} />
      <Row
        label="Compétence"
        v={value.competence}
        onChange={(v) => onChange({ ...value, competence: v })}
      />
      <Row label="Utilité" v={value.utilite} onChange={(v) => onChange({ ...value, utilite: v })} />
      <Row
        label="Viabilité"
        v={value.viabilite}
        onChange={(v) => onChange({ ...value, viabilite: v })}
      />
      <div className="mt-2 border-t pt-2">
        <Row
          label="Confiance du profil"
          v={value.confidence_avg}
          onChange={(v) => onChange({ ...value, confidence_avg: v })}
        />
      </div>
    </div>
  );
}
