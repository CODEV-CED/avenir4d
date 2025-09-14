// /components/ProfileBadge.tsx
'use client';
import { useEffect, useState } from 'react';
import { loadProfile } from '@/lib/storage';

export default function ProfileBadge() {
  const [pct, setPct] = useState<number | null>(null);

  const refresh = () => {
    const p = loadProfile();
    if (!p) return setPct(null);
    const avg = (p.plaisir + p.competence + p.utilite + p.viabilite) / 4;
    setPct(Math.round(avg * 100));
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('profile-updated', handler as EventListener);
    return () => window.removeEventListener('profile-updated', handler as EventListener);
  }, []);

  if (pct == null) {
    return (
      <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600">
        Profil —
      </span>
    );
  }

  return (
    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
      Profil {pct}%
    </span>
  );
}
