'use client';

import React, { type RefObject, useCallback } from 'react';

type Option = {
  id: string;
  label: string;
  description?: string;
};

type Question = {
  id: string;
  title: string; // normalisé par SJTQuizAdvanced
  subtitle?: string; // optionnel
  options: Option[];
};

type Props = {
  questionIndex: number;
  totalQuestions: number;
  question: Question;
  selectedOption?: string;
  onSelectOption: (optionId: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
  isFirstQuestion: boolean;
  error?: string;
  /** ✅ Nouveau : ref pour focus auto */
  nextButtonRef?: RefObject<HTMLButtonElement | null>;
};

export function QcmStep({
  questionIndex,
  totalQuestions,
  question,
  selectedOption,
  onSelectOption,
  onNext,
  onPrevious,
  canProceed,
  isFirstQuestion,
  error,
  nextButtonRef,
}: Props) {
  const handlePick = useCallback(
    (id: string) => {
      onSelectOption(id);
      // Le focus sur “Suivant” est fait par le parent (SJTQuizAdvanced)
      // juste après avoir appelé onSelectOption (queueMicrotask).
    },
    [onSelectOption],
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--ny-panel,#151520)] p-5 text-[var(--ny-text,#e8e8f0)] md:p-7">
      {/* En-tête */}
      <div className="mb-5 flex items-center justify-between">
        <div className="text-xs font-medium text-white/60">
          Question <b className="text-white">{questionIndex + 1}</b> / {totalQuestions}
        </div>
        <div className="h-2 w-40 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-fuchsia-500"
            style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Titre */}
      <h2 className="mb-2 text-xl font-semibold text-white md:text-2xl">{question.title}</h2>
      {question.subtitle ? <p className="mb-4 text-sm text-white/70">{question.subtitle}</p> : null}

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((opt) => {
          const active = selectedOption === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePick(opt.id)}
              className={[
                'rounded-xl border p-4 text-left transition',
                active
                  ? 'border-fuchsia-500/60 bg-fuchsia-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10',
              ].join(' ')}
            >
              <div className="font-medium text-white">{opt.label}</div>
              {opt.description ? (
                <div className="mt-1 text-sm text-white/70">{opt.description}</div>
              ) : null}
            </button>
          );
        })}
      </div>

      {error && <div className="mt-3 text-sm text-red-500">{error}</div>}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirstQuestion}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 disabled:opacity-40"
        >
          ← Retour
        </button>

        <button
          type="button"
          ref={nextButtonRef /* ✅ Le bouton “Suivant” reçoit le ref */}
          onClick={onNext}
          disabled={!canProceed}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{
            background:
              'linear-gradient(90deg, var(--ny-accent,#a855f7), var(--ny-accent-2,#06b6d4))',
          }}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
