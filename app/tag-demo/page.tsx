'use client';

import { useState } from 'react';
import { TagInputBasic } from '@/components/tag-input';

const allTags = ['design', 'gestion', 'marketing', 'code', 'éthique', 'UX', 'IA'];

export default function TagDemoPage() {
  const [tags, setTags] = useState<string[]>([]);

  return (
    <div className="mx-auto max-w-lg p-6 text-white">
      <h1 className="mb-4 text-xl font-bold">🎓 Démo Tag Input (Simple)</h1>
      <TagInputBasic availableTags={allTags} selectedTags={tags} onChange={setTags} />
      <div className="mt-4">
        <h2 className="font-semibold">Tags sélectionnés :</h2>
        <pre className="mt-2 rounded bg-gray-800 p-2 text-sm">{JSON.stringify(tags, null, 2)}</pre>
      </div>
    </div>
  );
}
