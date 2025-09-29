'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';

export type SJTProfile = {
  id: string;
  createdAt: string;
  surveyVersion: string;
  profile4d: {
    plaisir: number;
    competence: number;
    utilite: number;
    viabilite: number;
    confidence_avg?: number;
    version?: number;
  } | null;
  keywords: { passions: string[]; talents: string[]; utilite: string[]; viabilite: string[] };
  qual: {
    dimancheMatin: string;
    algoPersonnel: string;
    talentReconnu: string;
    indignationMax: string;
  } | null;
};

type Options = {
  id?: string;
  auto?: boolean; // fetch auto au mount (défaut true)
  endpoint?: string; // /api/sweet-spot/profile par défaut
  hydrateSliders?: boolean; // copie profile4d -> sliders (défaut true)
  onLoaded?: (p: SJTProfile) => void;
};

type FetchResult = { ok: true; data: SJTProfile } | { ok: false; error?: string; aborted?: true };

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function useSJTProfile(opts: Options = {}) {
  const {
    id: initId = '',
    auto = true,
    endpoint = '/api/sjt/profile',
    hydrateSliders = true,
    onLoaded,
  } = opts;

  const [id, setId] = useState(initId);
  const [profile, setProfile] = useState<SJTProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ✅ actions Zustand (appel de hooks au top-level)
  const setUserKeywords = useSweetSpotStore((s) => s.setUserKeywords);
  const setSliderValue = useSweetSpotStore((s) => s.setSliderValue);
  const triggerDetect = useSweetSpotStore((s) => s.fetchConvergences);

  const fetchProfile = useCallback(
    async (overrideId?: string): Promise<FetchResult> => {
      const pid = overrideId ?? id ?? '';
      if (!pid) {
        const msg = 'Aucun identifiant de profil fourni';
        setError(msg);
        return { ok: false, error: 'missing_id' };
      }

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setLoading(true);
      setError(null);

      try {
        const url = `${endpoint}?id=${encodeURIComponent(pid)}`;
        const res = await fetch(url, {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: ac.signal,
        });
        const json = await res.json().catch(() => ({}));

        if (!res.ok || json?.ok === false) {
          const msg = json?.error || `Erreur ${res.status}`;
          throw new Error(msg);
        }

        const prof = json.profile as SJTProfile;
        setProfile(prof);

        // ✅ HYDRATE STORE (keywords)
        if (prof?.keywords) {
          setUserKeywords({
            passions: prof.keywords.passions ?? [],
            talents: prof.keywords.talents ?? [],
            utilite: prof.keywords.utilite ?? [],
            viabilite: prof.keywords.viabilite ?? [],
          } as any);
        }

        // ✅ (option) HYDRATE SLIDERS à partir de profile4d
        if (hydrateSliders && prof?.profile4d) {
          const p4 = prof.profile4d;
          setSliderValue('passions', clamp01(p4.plaisir));
          setSliderValue('talents', clamp01(p4.competence));
          setSliderValue('utilite', clamp01(p4.utilite));
          setSliderValue('viabilite', Math.max(0.15, clamp01(p4.viabilite))); // contrainte min
        }

        // ✅ DÉCLENCHE LA DÉTECTION
        await triggerDetect();

        onLoaded?.(prof);
        return { ok: true, data: prof };
      } catch (e: any) {
        if (e?.name === 'AbortError') return { ok: false, aborted: true };
        const msg = e?.message ?? 'Erreur de chargement du profil';
        setError(msg);
        toast.error('Chargement du profil échoué', {
          description: msg,
          action: { label: 'Réessayer', onClick: () => fetchProfile(pid) },
        });
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [id, endpoint, hydrateSliders, onLoaded, setUserKeywords, setSliderValue, triggerDetect],
  );

  useEffect(() => {
    if (!auto) return;
    const fallbackId =
      id || (typeof window !== 'undefined' ? localStorage.getItem('sjtProfileId') || '' : '');
    if (!id && fallbackId) setId(fallbackId);
    if (fallbackId) fetchProfile(fallbackId);
    return () => abortRef.current?.abort();
  }, [auto, id, fetchProfile]);

  return {
    id,
    setId,
    profile,
    setProfile,
    loading,
    setLoading,
    error,
    setError,
    fetchProfile,
  };
}
