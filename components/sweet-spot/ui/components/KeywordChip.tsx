// components/sweet-spot/ui/components/KeywordChip.tsx

import React, { memo } from 'react';

interface KeywordChipProps {
  keyword: string;
  onRemove: (keyword: string) => void;
}

export const KeywordChip = memo<KeywordChipProps>(({ keyword, onRemove }) => {
  return (
    <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-sm text-white transition-colors hover:border-white/40">
      {keyword}
      <button
        onClick={() => onRemove(keyword)}
        className="text-white/60 transition-colors hover:text-rose-300"
        aria-label={`Retirer ${keyword}`}
      >
        ×
      </button>
    </span>
  );
});

KeywordChip.displayName = 'KeywordChip';

interface TagChipProps {
  tag: string;
  selected: boolean;
  onToggle: () => void;
}

export const TagChip = memo<TagChipProps>(({ tag, selected, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative transform rounded-full border px-4 py-2 font-medium transition-all hover:scale-105 ${
        selected
          ? 'scale-105 border-white/50 bg-white/20 text-white shadow-lg'
          : 'border-white/10 bg-black/40 text-white/70 hover:border-white/20 hover:bg-white/8'
      }`}
      aria-pressed={selected}
    >
      {selected && (
        <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full border border-black/20 bg-white">
          <span className="text-xs font-bold text-black">✔</span>
        </div>
      )}
      {tag}
    </button>
  );
});

TagChip.displayName = 'TagChip';
