'use client';
import { useEffect, useState } from 'react';
import type React from 'react';
import { loadFeedback, saveFeedback } from '@/lib/feedback';
import { telemetry } from '@/lib/telemetry';

type Props = { formationId: string };

export default function FeedbackButtons({ formationId }: Props) {
  const [value, setValue] = useState<1 | -1 | 0>(0); // 1=up, -1=down, 0=none

  // charger l'état initial depuis localStorage
  useEffect(() => {
    const map = loadFeedback();
    setValue((map[formationId] as 1 | -1 | 0) ?? 0);
  }, [formationId]);

  function vote(e: React.MouseEvent<HTMLButtonElement>, v: 1 | -1) {
    // évite que le clic “bave” sur un autre bouton pendant le re-tri
    e.preventDefault();
    e.stopPropagation();

    const next = value === v ? 0 : v;
    setValue(next);

    const map = loadFeedback();
    if (next === 0) delete map[formationId];
    else map[formationId] = next;
    saveFeedback(map);

    // re-déclenche le tri après la fin du cycle de clic
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('feedback-changed'));
    }, 0);

    // 🔔 télémétrie
    if (next === 1) telemetry.feedbackUp(formationId);
    if (next === -1) telemetry.feedbackDown(formationId);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('feedback-changed'));
    }, 0);
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-xs text-gray-500">Cette recommandation :</span>

      <button
        type="button"
        onClick={(e) => vote(e, 1)}
        aria-pressed={value === 1}
        className={`rounded border px-2 py-1 text-xs transition-colors ${
          value === 1
            ? 'border-green-200 bg-green-100 text-green-700'
            : 'border-gray-200 text-gray-600 hover:border-green-200'
        }`}
      >
        👍 Pertinente
      </button>

      <button
        type="button"
        onClick={(e) => vote(e, -1)}
        aria-pressed={value === -1}
        className={`rounded border px-2 py-1 text-xs transition-colors ${
          value === -1
            ? 'border-red-200 bg-red-100 text-red-700'
            : 'border-gray-200 text-gray-600 hover:border-red-200'
        }`}
      >
        👎 Pas pertinente
      </button>
    </div>
  );
}
