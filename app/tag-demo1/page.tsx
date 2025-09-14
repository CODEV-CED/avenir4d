'use client';

import { useState, useRef, useEffect } from 'react';

// The new TagInput gets suggestions from an API, so we don't need a static list.
// The Tag type should be consistent with what the component expects.
type Tag = { id: string; slug: string; label: string };

type TagInputProps = {
  selectedTags: Tag[];
  onAdd: (label: string) => void;
  onRemove: (tagId: string) => void;
};

function TagInput({ selectedTags, onAdd, onRemove }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onAdd(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      onRemove(selectedTags[selectedTags.length - 1].id);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedTags]);

  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-md border border-gray-600 bg-gray-900 p-2"
      onClick={() => inputRef.current?.focus()}
    >
      {selectedTags.map((tag) => (
        <span
          key={tag.id}
          className="flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-sm"
        >
          {tag.label}
          <button
            onClick={() => onRemove(tag.id)}
            className="text-blue-200 hover:text-white"
            aria-label={`Remove ${tag.label}`}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a tag..."
        className="min-w-[100px] flex-1 bg-transparent text-white outline-none"
      />
    </div>
  );
}

export default function TagDemoPage() {
  const [tags, setTags] = useState<Tag[]>([]);

  const handleAddTag = (label: string) => {
    // In a real app, the server would return the created tag with its real ID.
    // For this demo, we'll simulate it client-side.
    const newTag: Tag = {
      id: `temp-id-${Date.now()}`,
      slug: label.toLowerCase().trim().replace(/\s+/g, '-'),
      label: label.trim(),
    };

    // Prevent adding duplicate tags
    if (!tags.some((t) => t.slug === newTag.slug)) {
      setTags((prev) => [...prev, newTag]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  return (
    <div className="mx-auto max-w-lg p-6 text-white">
      <h1 className="mb-4 text-xl font-bold">🎓 Démo Tag Input (API-driven)</h1>
      <TagInput selectedTags={tags} onAdd={handleAddTag} onRemove={handleRemoveTag} />
      <div className="mt-4">
        <h2 className="font-semibold">Tags sélectionnés :</h2>
        <pre className="mt-2 rounded bg-gray-800 p-2 text-sm">{JSON.stringify(tags, null, 2)}</pre>
      </div>
    </div>
  );
}
