// components/projects/ProjectPreview.tsx
'use client';

import { useMemo } from 'react';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import type { HybridProject } from '@/types/hybrid-project.schema';
import Link from 'next/link';
import { getFormationShortLabel } from '@/data/parcoursup-vocabulary';
import { EMERGING_CAREERS_BATCH3 } from '@/data/emerging-careers-batch3';

type Props = {
  title?: string;
  max?: number;
  onPrimaryCta?: () => void;
};

function MiniCard({ p }: { p: HybridProject }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20">
      <h3 className="font-semibold text-white">{p.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-white/70">{p.rationale}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {p.suggestedFormations?.slice(0, 3).map((f) => (
          <span key={f} className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
            {getFormationShortLabel(f)}
          </span>
        ))}
      </div>
      <div className="mt-4 text-xs text-white/50">
        Durée mini-projet : {p.miniProject?.duration} • Difficulté :{' '}
        {p.miniProject?.difficulty === 'facile'
          ? 'Facile'
          : p.miniProject?.difficulty === 'medium'
            ? 'Moyen'
            : 'Ambitieux'}
      </div>
    </div>
  );
}

export default function ProjectPreview({
  title = 'Tes Projets de Vie',
  max = 3,
  onPrimaryCta,
}: Props) {
  const { generatedProjects, isGeneratingProjects } = useSweetSpotStore();

  const top = useMemo<HybridProject[]>(
    () => (generatedProjects || []).slice(0, max),
    [generatedProjects, max],
  );

  return (
    <section id="hybrid-projects-section" className="mt-8 rounded-2xl border border-white/10 p-6">
      <div className="mb-4 flex items-center gap-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white">
          6
        </span>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="ml-auto text-white/60">
          {isGeneratingProjects ? 'Génération en cours…' : null}
        </div>
      </div>

      {isGeneratingProjects && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/70">
          ✨ On prépare tes projets personnalisés…
        </div>
      )}

      {!isGeneratingProjects && top.length > 0 && (
        <>
          <div className="grid gap-5 md:grid-cols-3">
            {top.map((p) => (
              <MiniCard key={p.id || p.title} p={p} />
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {/* 2 boutons principaux */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onPrimaryCta}
                className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                Continuer vers mes formations →
              </button>
              <button
                onClick={() => {
                  const { generateProjects } = useSweetSpotStore.getState();
                  const randomSeed =
                    EMERGING_CAREERS_BATCH3[
                      Math.floor(Math.random() * EMERGING_CAREERS_BATCH3.length)
                    ];
                  generateProjects([randomSeed]).then(() => {
                    setTimeout(() => {
                      document
                        .getElementById('hybrid-projects-section')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 300);
                  });
                }}
                className="rounded-full border border-white/30 px-5 py-3 text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                Générer d'autres pistes
              </button>
            </div>

            {/* Lien discret */}
            <div className="text-center">
              <Link
                href="/lab/projects"
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                Voir tous mes projets →
              </Link>
            </div>
          </div>
        </>
      )}

      {!isGeneratingProjects && top.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
          Aucun projet à afficher pour l'instant.
        </div>
      )}
    </section>
  );
}
