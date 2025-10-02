'use client';

import * as React from 'react';
import { useState } from 'react';
import type { HybridProject } from '@/types/hybrid-project.schema';
import {
  FORMATION_LABELS,
  getFormationShortLabel,
  getFormationDescription,
} from '@/data/parcoursup-vocabulary';
import {
  ATTENDU_LABELS,
  ATTENDU_CATEGORY_LABELS,
  ATTENDUS_BY_CATEGORY,
} from '@/data/parcoursup-vocabulary';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';

export function ParcoursupExportDoc({ project }: { project: HybridProject }) {
  const store = useSweetSpotStore();
  const [copied, setCopied] = useState(false);

  const onCopyPunchline = async () => {
    await navigator.clipboard.writeText(project.punchline);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onPrint = () => window.print();

  return (
    <section aria-label="Document d’export Parcoursup">
      {/* En-tête */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">{project.title}</h3>
          <p className="mt-1 text-white/70">{project.rationale}</p>
        </div>
        <div className="no-print flex gap-2">
          <button
            onClick={onCopyPunchline}
            className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
            aria-label="Copier la punchline"
          >
            {copied ? '✓ Punchline copiée' : '📋 Copier'}
          </button>
          <button
            onClick={() => (store as any).saveProjectToProfile?.(project)}
            className="rounded-lg bg-purple-500/20 px-3 py-2 text-sm font-semibold text-purple-200 hover:bg-purple-500/30"
            aria-label="Sauvegarder le projet"
          >
            💾 Sauvegarder
          </button>
          <button
            onClick={onPrint}
            className="rounded-lg bg-green-500/20 px-3 py-2 text-sm font-semibold text-green-200 hover:bg-green-500/30"
            aria-label="Imprimer/Exporter en PDF"
          >
            🖨️ Export PDF
          </button>
        </div>
      </header>

      {/* Punchline */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-white/80">
          <span className="mr-2 font-semibold text-white/60">Punchline Parcoursup :</span>“
          {project.punchline}”
        </p>
      </div>

      {/* Mini-projet */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl bg-white/5 p-4" aria-label="Mini-projet">
          <h4 className="mb-2 text-sm font-semibold text-white/70">Mini-projet à réaliser</h4>
          <p className="text-white/80">
            ⏱️ {project.miniProject.duration}
            {project.miniProject.longRun ? ' (version longue possible 2–3 mois)' : ''} • 🧾 Preuves
            : {(project.miniProject.expectedProofs || []).join(', ')}
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-white/70">
            {(project.miniProject.steps || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </article>

        {/* Formations conseillées */}
        <aside className="rounded-xl bg-white/5 p-4" aria-label="Formations recommandées">
          <h4 className="mb-2 text-sm font-semibold text-white/70">
            Formations Parcoursup adaptées
          </h4>
          <div className="space-y-3">
            {project.suggestedFormations.map((f) => {
              const short = getFormationShortLabel(f);
              const desc = getFormationDescription(f);
              return (
                <div key={f} className="rounded-lg border border-white/10 p-3">
                  <div className="text-sm font-semibold text-white">{short}</div>
                  <div className="text-xs text-white/60">{desc}</div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Attendus groupés */}
      <section className="mt-6 rounded-xl bg-white/5 p-4" aria-label="Attendus Parcoursup">
        <h4 className="mb-2 text-sm font-semibold text-white/70">
          Attendus Parcoursup à valoriser
        </h4>
        <div className="grid gap-3 md:grid-cols-2">
          {Object.entries(ATTENDUS_BY_CATEGORY).map(([cat, items]) => {
            const selected = items.filter((a) => project.attendusLycee.includes(a));
            if (selected.length === 0) return null;
            return (
              <div key={cat} className="rounded-lg border border-white/10 p-3">
                <div className="mb-1 text-xs font-semibold text-white/60">
                  {ATTENDU_CATEGORY_LABELS[cat as keyof typeof ATTENDU_CATEGORY_LABELS]}
                </div>
                <ul className="space-y-1 text-sm text-white/80">
                  {selected.map((a) => (
                    <li key={a}>• {ATTENDU_LABELS[a]}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Conseils */}
      <footer
        className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4"
        aria-label="Conseils rédaction"
      >
        <h4 className="mb-2 text-sm font-semibold text-white/70">
          Conseils pour ta lettre Parcoursup
        </h4>
        <ul className="list-disc pl-5 text-sm text-white/70">
          <li>Mets la punchline en ouverture (max 2 lignes).</li>
          <li>Relie ton mini-projet aux attendus des formations ciblées.</li>
          <li>Valorise 1–2 preuves concrètes (GitHub, vidéo, blog, attestation).</li>
          <li>Conclue par un objectif clair (BUT/BTS/Prépa) et ton horizon métier.</li>
        </ul>
      </footer>
    </section>
  );
}
