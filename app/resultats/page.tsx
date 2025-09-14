'use client';

import Link from 'next/link';

// essaie d'abord le store (si tu as useSweetSpotStore),
// sinon fallback sur localStorage pour MVP
let hasStore = true;
let useSweetSpotStore: any;
try {
  // si le store n'existe pas encore, ce require va throw
  // @ts-ignore
  useSweetSpotStore = require('@/store/useSweetSpotStore').useSweetSpotStore;
} catch {
  hasStore = false;
}

type Profile4D = {
  plaisir: number;
  competence: number;
  utilite: number;
  viabilite: number;
  confidence_avg?: number;
  version?: number;
  source?: string;
};

export default function ResultatsPage() {
  const storeProfile: Profile4D | null = hasStore
    ? (useSweetSpotStore((s: any) => s.profile) ?? null)
    : null;

  const [profile, setProfile] = React.useState<Profile4D | null>(storeProfile);

  React.useEffect(() => {
    if (!profile) {
      // petits fallbacks LS (au cas où)
      const keys = ['a4d:profile4d', 'sweetspot_profile', 'sjt-profile'];
      for (const k of keys) {
        const raw = typeof window !== 'undefined' ? localStorage.getItem(k) : null;
        if (raw) {
          try {
            const p = JSON.parse(raw);
            if (p && typeof p === 'object') {
              setProfile(p);
              break;
            }
          } catch {}
        }
      }
    }
  }, [profile]);

  if (!profile) {
    return (
      <main className="mx-auto max-w-3xl p-6 text-white">
        <h1 className="mb-2 text-2xl font-bold">Pas de résultat disponible</h1>
        <p className="mb-4 text-white/70">
          Passe (ou repasse) le questionnaire pour générer ton profil.
        </p>
        <Link
          href="/sjt"
          className="inline-block rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500"
        >
          ✍️ Passer le questionnaire SJT
        </Link>
      </main>
    );
  }

  const rows = [
    { label: 'Plaisir', key: 'plaisir', color: 'bg-fuchsia-500' },
    { label: 'Compétence', key: 'competence', color: 'bg-cyan-400' },
    { label: 'Utilité', key: 'utilite', color: 'bg-lime-400' },
    { label: 'Viabilité', key: 'viabilite', color: 'bg-amber-400' },
  ] as const;

  const pct = (v: number) => Math.round(Math.max(0, Math.min(1, v)) * 100);

  return (
    <main className="mx-auto max-w-4xl p-6 text-white">
      <h1 className="mb-1 text-3xl font-bold">Ton profil NextYou&gt;</h1>
      <p className="mb-6 text-white/70">
        Résumé 4D issu de tes réponses. Tu peux recalibrer quand tu veux via le SJT.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((r) => {
          const val = (profile as any)[r.key] ?? 0;
          const value = pct(val);
          return (
            <div key={r.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex justify-between text-sm text-white/70">
                <span>{r.label}</span>
                <span className="text-white">{value}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div className={`h-2 rounded-full ${r.color}`} style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm font-semibold text-white/80">Confiance</div>
          <div className="text-2xl font-bold">
            {profile.confidence_avg ? `${Math.round(profile.confidence_avg * 20)}%` : '—'}
          </div>
          <div className="mt-1 text-xs text-white/60">
            version {profile.version ?? 1} • source {profile.source ?? 'sjt_v2'}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm font-semibold text-white/80">Actions</div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
            >
              Explorer les formations
            </Link>
            <Link
              href="/voeux"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
            >
              Voir mes vœux
            </Link>
            <Link
              href="/sjt"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
            >
              Recalibrer SJT
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// minimal React import for TS when using React in the same file
import * as React from 'react';
