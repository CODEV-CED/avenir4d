// components/sweet-spot/ui/sections/TagsSection.tsx

import React, { memo, useCallback } from 'react';
import { useSweetSpot } from '@sweet-spot/hooks';
import { TAG_POOL, UI_CLASSES } from '@sweet-spot/constants';
import { TagChip } from '@sweet-spot/ui/components/KeywordChip';

export const TagsSection = memo(() => {
  const { state, actions } = useSweetSpot();

  const toggleTag = useCallback(
    (tag: string) => {
      // Enlever l'emoji du tag
      const label = tag.replace(/^[^ ]+\s*/, '');
      if (state.selectedTags.includes(label)) {
        actions.removeTag(label);
      } else {
        actions.addTag(label);
      }
    },
    [state.selectedTags, actions],
  );

  return (
    <>
      <div className="mb-5 flex items-center gap-4">
        <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
          Optionnel
        </span>
        {state.selectedTags.length > 0 && (
          <span className="rounded-full border border-white/30 bg-white/15 px-2 py-1 text-xs font-medium text-white">
            {state.selectedTags.length} sélectionné{state.selectedTags.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <p className={`${UI_CLASSES.SUBTITLE} mb-6`}>
        Choisis quelques tags pour affiner les résultats. Plus tu en sélectionnes, plus les
        recommandations seront précises.
      </p>

      <div className="flex flex-wrap gap-3">
        {TAG_POOL.map((tag) => {
          const label = tag.replace(/^[^ ]+\s*/, '');
          const isSelected = state.selectedTags.includes(label);

          return (
            <TagChip key={tag} tag={tag} selected={isSelected} onToggle={() => toggleTag(tag)} />
          );
        })}
      </div>

      {state.selectedTags.length > 0 && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-xs text-white/60">Tags sélectionnés :</p>
          <div className="flex flex-wrap gap-2">
            {state.selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-2 py-1 text-xs text-white"
              >
                {tag}
                <button
                  onClick={() => {
                    // Retrouver le tag complet avec emoji pour le toggle
                    const fullTag = TAG_POOL.find((t) => t.includes(tag));
                    if (fullTag) toggleTag(fullTag);
                  }}
                  className="ml-1 font-bold text-white/80 hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
});

TagsSection.displayName = 'TagsSection';
