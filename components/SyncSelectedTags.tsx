// components/SyncSelectedTags.tsx
'use client';
import { useEffect } from 'react';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';

type Tag = { id: string; slug: string; label: string };

export default function SyncSelectedTags({ tags }: { tags: Tag[] }) {
  const setSelectedTags = useSweetSpotStore((s) => s.setSelectedTags);
  useEffect(() => {
    setSelectedTags(tags.map((t) => t.slug)); // ou t.label selon ta stratégie
  }, [tags, setSelectedTags]);
  return null;
}
