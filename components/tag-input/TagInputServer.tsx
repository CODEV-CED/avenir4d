'use client';
import { useEffect, useMemo, useState } from 'react';

export type Tag = { id: string; slug: string; label: string };

export type TagInputServerProps = {
  selectedTags: Tag[];
  onAdd: (label: string) => void; // on envoie juste le label, l’API fait l’upsert
  onRemove: (tagId: string) => void; // suppression via id
};

export default function TagInputServer({ selectedTags, onAdd, onRemove }: TagInputServerProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);

  const selectedSlugs = useMemo(() => new Set(selectedTags.map((t) => t.slug)), [selectedTags]);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      const q = input.trim();
      const res = await fetch(`/api/tags/suggest?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!ignore) {
        const list: Tag[] = Array.isArray(json.tags) ? json.tags : [];
        setSuggestions(list.filter((t) => !selectedSlugs.has(t.slug)));
        setOpen(!!q && list.length > 0);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [input, selectedSlugs]);

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      onAdd(input.trim());
      setInput('');
      setOpen(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="flex items-center rounded-full bg-blue-600 px-3 py-1 text-sm text-white"
          >
            {tag.label}
            <button className="ml-2 text-xs hover:text-red-200" onClick={() => onRemove(tag.id)}>
              ✕
            </button>
          </span>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleEnter}
        placeholder="Ajouter un tag…"
        className="w-full rounded border px-3 py-2"
      />

      {open && (
        <ul className="mt-1 max-h-40 overflow-y-auto rounded border bg-white text-sm shadow">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="cursor-pointer px-3 py-2 hover:bg-blue-50"
              onClick={() => {
                onAdd(s.label);
                setInput('');
                setOpen(false);
              }}
            >
              {s.label}
              <span className="ml-2 text-[10px] text-gray-500">({s.slug})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
