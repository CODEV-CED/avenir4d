import { useCallback, useEffect, useState } from 'react';

export type Tag = { id: string; slug: string; label: string };

export function useFormationTags(formationId: string) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/formations/${formationId}/tags`, { cache: 'no-store' });
    const json = await res.json();
    setTags(Array.isArray(json.tags) ? json.tags : []);
    setLoading(false);
  }, [formationId]);

  const addTag = useCallback(
    async (label: string) => {
      // Optimistic UI
      const optimistic: Tag = { id: `tmp-${Date.now()}`, slug: label.toLowerCase(), label };
      setTags((prev) =>
        prev.find((t) => t.slug === optimistic.slug) ? prev : [optimistic, ...prev],
      );

      const res = await fetch(`/api/formations/${formationId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      });
      if (!res.ok)
        await fetchTags(); // resync si erreur
      else await fetchTags(); // resync pour récupérer le vrai id
    },
    [formationId, fetchTags],
  );

  const removeTag = useCallback(
    async (tagId: string) => {
      // Optimistic UI
      setTags((prev) => prev.filter((t) => t.id !== tagId));

      const res = await fetch(`/api/formations/${formationId}/tags`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId }),
      });
      if (!res.ok) await fetchTags();
    },
    [formationId, fetchTags],
  );

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, loading, addTag, removeTag };
}
