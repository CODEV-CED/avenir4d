'use client';
import { useEffect, useState } from 'react';
import { loadProfile } from '@/lib/storage';
import type { Profile4D } from '@/types/sjt';

export function useCurrentProfile() {
  const [p, setP] = useState<Profile4D | null>(null);
  useEffect(() => {
    setP(loadProfile());
    const h = () => setP(loadProfile());
    window.addEventListener('profile-updated', h);
    return () => window.removeEventListener('profile-updated', h);
  }, []);
  return p;
}
