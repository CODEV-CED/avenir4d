'use client';
import { TagInputServer } from '@/components/tag-input'; // ou chemin relatif
import { useFormationTags } from '@/lib/hooks/useFormationTags';
import SyncSelectedTags from '@/components/SyncSelectedTags';

export default function FormationDetailClient({ formationId }: { formationId: string }) {
  const { tags, loading, addTag, removeTag } = useFormationTags(formationId);

  return (
    <div className="mt-6">
      <h3 className="mb-2 font-semibold">Tags</h3>
      {loading && <p className="text-sm text-gray-500">Chargement…</p>}

      {/* ✅ sync tags -> store (pour le boost) */}
      <SyncSelectedTags tags={tags} />

      <TagInputServer selectedTags={tags} onAdd={addTag} onRemove={removeTag} />
    </div>
  );
}
