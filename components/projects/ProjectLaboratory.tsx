// components/projects/ProjectLaboratory.tsx
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import type { EmergingCareerBatch3 } from '@/data/emerging-careers-batch3';
import type { ProjectCardProps } from '@/types/project-laboratory.types';
import { CareerSelector } from './CareerSelector';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import {
  FORMATION_LABELS,
  ATTENDU_LABELS,
  getFormationShortLabel,
} from '@/data/parcoursup-vocabulary';

// Local mapping for mini-project difficulty labels (keeps file self-contained
// while the upstream export is missing); keys cover numeric and string cases.
const DIFFICULTY_LABELS: Record<string, string> = {
  '1': 'Facile',
  '2': 'Moyen',
  '3': 'Difficile',
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
};
import type { HybridProject } from '@/types/hybrid-project.schema';
import { ParcoursupExportDoc } from './ParcoursupExportDoc';

type LocalStep = 1 | 2 | 3 | 4;

function StepIndicator({ current, total = 4 }: { current: LocalStep; total?: number }) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2" aria-hidden>
      {Array.from({ length: total }).map((_, i) => {
        const step = (i + 1) as LocalStep;
        const active = step <= current;
        return (
          <div
            key={step}
            className={`h-2 w-12 rounded-full ${active ? 'bg-purple-500' : 'bg-white/10'}`}
          />
        );
      })}
    </div>
  );
}

function ProjectCard({ project, onSelect, isSelected }: ProjectCardProps) {
  return (
    <div
      className={`group flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-black/70 to-black/50 p-4 transition hover:border-white/20 ${
        isSelected ? 'ring-2 ring-purple-400/50' : ''
      }`}
      role="article"
      aria-label={`Projet ${project.title}`}
    >
      <div>
        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
        <p className="mt-1 text-sm text-white/70">{project.rationale}</p>

        {/* Mini-projet */}
        <div className="mt-3 rounded-xl bg-white/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">Mini-projet</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">
              {DIFFICULTY_LABELS[project.miniProject.difficulty] || ''}
            </span>
          </div>
          <p className="mt-1 text-sm text-white/80">
            ⏱️ {project.miniProject.duration}
            {project.miniProject.longRun ? ' (version longue possible 2–3 mois)' : ''} • 🧾 Preuves:{' '}
            {(project.miniProject.expectedProofs || []).join(', ')}
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-white/70">
            {(project.miniProject.steps || []).slice(0, 4).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Formations */}
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-white/60">Formations Parcoursup adaptées</p>
          <div className="flex flex-wrap gap-1">
            {project.suggestedFormations.slice(0, 3).map((f) => (
              <span
                key={f}
                className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-white/70"
              >
                {getFormationShortLabel(f)}
              </span>
            ))}
          </div>
        </div>

        {/* Attendus */}
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-white/60">Tes atouts à valoriser</p>
          <div className="flex flex-wrap gap-1">
            {project.attendusLycee.slice(0, 4).map((a) => (
              <span key={a} className="rounded bg-white/5 px-2 py-1 text-[11px] text-white/60">
                {ATTENDU_LABELS[a] || a}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-white/50">Punchline : “{project.punchline}”</span>
        <button
          onClick={() => onSelect(project)}
          className="rounded-lg bg-purple-500/20 px-3 py-1 text-sm font-semibold text-purple-200 transition hover:bg-purple-500/30"
          aria-label={`Choisir le projet ${project.title}`}
        >
          Choisir →
        </button>
      </div>
    </div>
  );
}

export function ProjectLaboratory() {
  const [step, setStep] = useState<LocalStep>(1);
  const [error, setError] = useState<string | null>(null);
  const [selectedCareers, setSelectedCareers] = useState<EmergingCareerBatch3[]>([]);

  const {
    generatedProjects,
    selectedProject,
    isGeneratingProjects,
    projectGenerationError,
    generateProjects,
    selectProject,
  } = useSweetSpotStore();

  const handleSelectCareer = async (career: EmergingCareerBatch3) => {
    setError(null);
    setSelectedCareers([career]);

    try {
      await generateProjects([career]); // <-- plus de "as any"
      setStep(2);
    } catch (err) {
      console.error('Erreur génération:', err);
      setError('Impossible de générer les projets. Réessayez.');
      setStep(1);
    }
  };

  // Gérer les erreurs du store
  useEffect(() => {
    if (projectGenerationError) {
      setError(projectGenerationError);
      setStep(1);
    }
  }, [projectGenerationError]);

  // Transition auto après génération
  useEffect(() => {
    if (!isGeneratingProjects && step === 2) {
      if (generatedProjects.length > 0) {
        setStep(3);
      } else if (!error) {
        setError('Aucun projet généré. Essaye un autre métier.');
        setStep(1);
      }
    }
  }, [isGeneratingProjects, generatedProjects.length, step, error]);

  return (
    <div className="space-y-6" aria-live="polite">
      <StepIndicator current={step} />

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4" role="alert">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Étape 1 — Sélection du métier seed */}
      {step === 1 && (
        <>
          <h2 className="text-xl font-semibold text-white">1) Choisis un métier de départ</h2>
          <p className="mb-3 text-white/60">
            Cela servira d’inspiration pour générer 5 projets hybrides personnalisés.
          </p>
          <CareerSelector onSelect={handleSelectCareer} />
        </>
      )}

      {/* Étape 2 — Génération */}
      {step === 2 && (
        <>
          <h2 className="text-xl font-semibold text-white">2) Génération en cours</h2>
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="animate-pulse text-center">
              <div className="text-3xl">🧪</div>
              <p className="mt-2 text-white/80">Génération de 5 projets hybrides…</p>
              <p className="text-xs text-white/50">Cela prend quelques secondes.</p>
            </div>
          </div>
        </>
      )}

      {/* Étape 3 — Choix du projet */}
      {step === 3 && (
        <>
          <h2 className="text-xl font-semibold text-white">3) Choisis ton projet préféré</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {generatedProjects.map((p: HybridProject) => (
              <ProjectCard
                key={p.id ?? p.title}
                project={p}
                onSelect={(proj) => {
                  selectProject(proj);
                  setStep(4);
                }}
                isSelected={selectedProject?.id === p.id}
              />
            ))}
          </div>
          {generatedProjects.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-black/60 p-6 text-center text-white/60">
              Aucun projet pour le moment.
            </div>
          )}
        </>
      )}

      {/* Étape 4 — Export */}
      {step === 4 && selectedProject && (
        <>
          <h2 className="text-xl font-semibold text-white">4) Export Parcoursup</h2>
          <div className="print-area">
            {' '}
            {/* <- zone imprimable */}
            <ParcoursupExportDoc project={selectedProject} />
          </div>
        </>
      )}
    </div>
  );
}
