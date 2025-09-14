'use client';
import { useState } from 'react';
import IkigaiControls from '@/components/IkigaiControls';
import IkigaiRadar from '@/components/ikigai/IkigaiRadar';
import type { Profile4D } from '@/types/sjt';
import { loadProfile, saveProfile, clearProfile } from '@/lib/storage';

const DEFAULT_PROFILE: Profile4D = {
  plaisir: 0.6,
  competence: 0.6,
  utilite: 0.6,
  viabilite: 0.6,
  confidence_avg: 0.7,
};

export default function IkigaiPage() {
  const [profile, setProfile] = useState<Profile4D>(loadProfile() ?? DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveProfile(profile); // ⚡ met à jour localStorage + émet 'profile-updated'
    setSaved(true);
    setTimeout(() => setSaved(false), 800);
  }

  function handleReset() {
    clearProfile();
    setProfile(DEFAULT_PROFILE);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">Ikigaï</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <IkigaiControls value={profile} onChange={setProfile} showResetLink />

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold">Aperçu visuel</h2>
          <IkigaiRadar profile={profile} />
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              className={`rounded-md px-3 py-1.5 text-sm font-medium text-white ${
                saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {saved ? 'Enregistré ✓' : 'Enregistrer'}
            </button>
            <button type="button" onClick={handleReset} className="text-sm text-gray-600 underline">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
