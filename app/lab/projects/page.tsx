// app/lab/projects/page.tsx
'use client';

import { usePostPaymentAutoplay } from '@/hooks/usePostPaymentAutoplay';
import { ProjectLaboratory } from '@/components/projects/ProjectLaboratory';

export default function ProjectsPage() {
  usePostPaymentAutoplay();

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Laboratoire de Projets</h1>
          <p className="mt-2 text-white/70">
            Explore, génère et personnalise tes projets hybrides pour Parcoursup.
          </p>
        </header>

        <ProjectLaboratory />
      </div>
    </div>
  );
}
