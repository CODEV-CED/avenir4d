// lib/hooks/useSJTProfile.ts
'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export type SJTProfile = {
  id: string;
  created_at: string;
  survey_version: string | null;
  profile4d: any;
  keywords: { passions?: string[]; talents?: string[]; utilite?: string[]; viabilite?: string[] };
  qual: any;
  raw_choices: any;
};

export function useSJTProfile(id: string | null | undefined) {
  const [profile, setProfile] = useState<SJTProfile | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sjt/profile?id=${encodeURIComponent(id)}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error || `Erreur ${res.status}`);
      setProfile(json.profile);
    } catch (e: any) {
      const msg = e?.message ?? 'Erreur de chargement du profil';
      setError(msg);
      toast.error('Chargement du profil échoué', {
        description: msg,
        action: { label: 'Réessayer', onClick: () => fetchProfile() },
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}
