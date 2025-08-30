'use client';
import { useEffect, useState } from 'react';
import type { FormationStatic } from '@/types/formation';
import type { Profile4D } from '@/types/sjt';
import { sortFormations } from '@/lib/matching';
import FormationCard from '@/components/formations/FormationCard';
import IkigaiControls from '@/components/IkigaiControls';
import { loadFeedback, applyFeedbackBoost } from '@/lib/feedback';

// Barre de vœux + helpers localStorage
import VoeuxBar from '@/components/voeux/VoeuxBar';
import { loadVoeux, addVoeu, removeVoeu, isFull } from '@/lib/voeux-local';

const FALLBACK: FormationStatic[] = [
  {
    id: 'but_gea_paris',
    nom: 'BUT GEA',
    type: 'BUT',
    duree: 3,
    etablissement: 'IUT Paris - Rives de Seine',
    ville: 'Paris',
    attendus: ['rigueur', 'maths', 'communication'],
    plaisir_tags: ['analyse', 'projets', 'groupe'],
    competence_tags: ['maths', 'gestion', 'bureautique'],
    utilite_tags: ['gestion', 'entreprise', 'emploi'],
    viabilite_data: { taux_acces: 0.6, cout: 'gratuit' },
    confidence: 0.88,
  },
  {
    id: 'bts_sio_paris',
    nom: 'BTS SIO',
    type: 'BTS',
    duree: 2,
    etablissement: 'Lycée Turgot',
    ville: 'Paris',
    attendus: ['logique', 'web', 'communication'],
    plaisir_tags: ['code', 'projets'],
    competence_tags: ['programmation', 'reseaux', 'support'],
    utilite_tags: ['numerique', 'developpement', 'emploi'],
    viabilite_data: { taux_acces: 0.65, cout: 'gratuit' },
    confidence: 0.85,
  },
];

type WithScore = FormationStatic & { compatibilityScore?: number };

export default function Page() {
  const [data, setData] = useState<FormationStatic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile4D>({
    plaisir: 0.6,
    competence: 0.6,
    utilite: 0.6,
    viabilite: 0.6,
    confidence_avg: 0.7,
  });

  // Vœux
  const [voeux, setVoeux] = useState<string[]>([]);
  useEffect(() => {
    setVoeux(loadVoeux());
  }, []);

  // Chargement dataset
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/data/formations.json?v=1', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!Array.isArray(json)) throw new Error('JSON mal formé (pas un tableau)');
        setData(json);
      } catch (e: any) {
        console.error('Erreur chargement formations:', e);
        setError(e?.message ?? 'Erreur inconnue');
        setData(FALLBACK);
      }
    })();
  }, []);

  const [sorted, setSorted] = useState<WithScore[]>([]);

  // Petite fonction utilitaire pour (re)calculer le tri + feedback
  function recomputeSorted(currentProfile = profile, currentData = data) {
    const base = sortFormations(currentProfile, currentData, 12) as WithScore[];
    const fb = loadFeedback();
    const withFb = base
      .map((f) => ({
        ...f,
        compatibilityScore: applyFeedbackBoost(f.compatibilityScore ?? 0, f.id, fb),
      }))
      .sort((a, b) => (b.compatibilityScore ?? 0) - (a.compatibilityScore ?? 0));
    setSorted(withFb);
  }

  // Recalcul à chaque changement de profil/données
  useEffect(() => {
    recomputeSorted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, data]);

  // Un SEUL listener pour le feedback (et on laisse finir le clic avant de recalculer)
  useEffect(() => {
    const handler = () => requestAnimationFrame(() => recomputeSorted());
    window.addEventListener('feedback-changed', handler);
    return () => window.removeEventListener('feedback-changed', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, data]);

  // Handlers vœux
  function handleAdd(id: string) {
    setVoeux((prev) => addVoeu(prev, id));
  }
  function handleRemove(id: string) {
    setVoeux((prev) => removeVoeu(prev, id));
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="mb-6 text-2xl font-bold">Formations</h1>

      {error && (
        <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
          Problème de chargement du dataset (affichage d’un échantillon). Détail : {error}
        </div>
      )}

      <div className="mb-6">
        <IkigaiControls value={profile} onChange={setProfile} />
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-md border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Aucune formation ne correspond pour ces réglages. Ajuste les curseurs ou élargis tes
          critères. 🙂
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((formation) => (
            <FormationCard
              key={formation.id}
              formation={formation}
              inWishlist={voeux.includes(formation.id)}
              wishlistFull={isFull(voeux)}
              onAdd={handleAdd}
            />
          ))}
        </div>
      )}

      {/* Afficher le bandeau s’il y a au moins 1 vœu */}
      {voeux.length > 0 && <VoeuxBar ids={voeux} formations={data} onRemove={handleRemove} />}
    </div>
  );
}
