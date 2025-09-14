// app/formations/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import formationsData from '@/data/formations.json';
import type { FormationStatic as FormationStaticOfficial, FormationType } from '@/types/formation';
import GoogleMapInline from '@/components/maps/GoogleMapInline';
import FormationDetailClient from './FormationDetailClient';

type Props = { params: Promise<{ id: string }> };

// --- metadata (await params)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const f = (formationsData as any[]).find((x) => String(x?.id) === id);
  return {
    title: f ? `${f.nom} – ${f.etablissement ?? ''}` : 'Formation',
  };
}

// --- page (await params)
export default async function FormationDetailPage({ params }: Props) {
  const { id } = await params;

  // Normalise le JSON pour coller au type strict
  const data: FormationStaticOfficial[] = (formationsData as any[]).map((f) => ({
    id: String(f.id),
    nom: String(f.nom),
    type: f.type as FormationType,
    duree: typeof f.duree === 'number' ? f.duree : 3,
    etablissement: typeof f.etablissement === 'string' ? f.etablissement : '',
    ville: typeof f.ville === 'string' ? f.ville : '',
    code_postal: typeof f.code_postal === 'string' ? f.code_postal : '',
    plaisir_tags: Array.isArray(f.plaisir_tags) ? f.plaisir_tags : [],
    competence_tags: Array.isArray(f.competence_tags) ? f.competence_tags : [],
    utilite_tags: Array.isArray(f.utilite_tags) ? f.utilite_tags : [],
    viabilite_data: f.viabilite_data ?? undefined,
    confidence: typeof f.confidence === 'number' ? f.confidence : 0,
    debouches: Array.isArray(f.debouches) ? f.debouches : undefined,
    specialites_recommandees: Array.isArray(f.specialites_recommandees)
      ? f.specialites_recommandees
      : undefined,
    image_url: typeof f.image_url === 'string' ? f.image_url : undefined,
    website: typeof f.website === 'string' ? f.website : undefined,
    ranking: f.ranking ?? undefined,
    metiers: Array.isArray(f.metiers) ? f.metiers : undefined,
  }));

  const f = data.find((x) => x.id === id);
  if (!f) return notFound();

  const tags = [...(f.plaisir_tags ?? []), ...(f.competence_tags ?? []), ...(f.utilite_tags ?? [])];
  const mapQuery = [f.etablissement, f.ville, f.code_postal, 'France'].filter(Boolean).join(', ');

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <a href="/formations" className="text-sm text-[var(--ny-subtext)] hover:underline">
        ← Retour aux formations
      </a>

      <h1 className="mt-3 text-3xl font-bold">{f.nom}</h1>
      <div className="mt-1 text-[var(--ny-subtext)]">
        {f.type} • {f.etablissement || '—'} • {f.ville || '—'}
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-lg font-semibold">À propos</h2>
          <ul className="space-y-1 text-sm text-white/80">
            <li>Durée : {f.duree} ans</li>
            {f.viabilite_data?.taux_acces != null && (
              <li>Taux d’accès : {Math.round(f.viabilite_data.taux_acces * 100)}%</li>
            )}
            {f.viabilite_data?.cout && <li>Coût : {f.viabilite_data.cout}</li>}
            <li>Score (confiance) : {Math.round((f.confidence ?? 0) * 100)}%</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-2 text-lg font-semibold">Mots-clés</h2>
          <div className="flex flex-wrap gap-2">
            {tags.length ? (
              [...new Set(tags)].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-[var(--ny-muted)] px-3 py-1 text-xs text-white/90"
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="text-sm text-[var(--ny-subtext)]">—</span>
            )}
          </div>
        </section>
      </div>

      {/* Localisation */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-[var(--ny-panel)] p-4">
        <h3 className="mb-3 text-base font-semibold text-white/90">Localisation</h3>
        <GoogleMapInline query={mapQuery} height={320} className="border-white/10 bg-black/10" />
      </section>

      {/* Tags interactifs */}
      <FormationDetailClient formationId={f.id} />

      {f.website && (
        <a
          href={f.website}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          Voir le site de la formation
        </a>
      )}
    </div>
  );
}
