'use client';
import { useState } from 'react';

export type TagInputBasicProps = {
  availableTags: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
};

export default function TagInputBasic({
  availableTags,
  selectedTags,
  onChange,
}: TagInputBasicProps) {
  const [input, setInput] = useState('');

  const filtered = availableTags.filter(
    (t) => t.toLowerCase().includes(input.toLowerCase()) && !selectedTags.includes(t),
  );

  const add = (t: string) => {
    if (!selectedTags.includes(t)) onChange([...selectedTags, t]);
    setInput('');
  };

  const remove = (t: string) => onChange(selectedTags.filter((x) => x !== t));

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      add(input.trim());
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedTags.map((t) => (
          <span
            key={t}
            className="flex items-center rounded-full bg-blue-600 px-3 py-1 text-sm text-white"
          >
            {t}
            <button onClick={() => remove(t)} className="ml-2 text-xs hover:text-red-200">
              ✕
            </button>
          </span>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ajouter un tag…"
        className="w-full rounded border px-3 py-2"
      />

      {input && filtered.length > 0 && (
        <ul className="mt-1 max-h-40 overflow-y-auto rounded border bg-white text-sm shadow">
          {filtered.map((s) => (
            <li
              key={s}
              onClick={() => add(s)}
              className="cursor-pointer px-3 py-2 hover:bg-blue-50"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
