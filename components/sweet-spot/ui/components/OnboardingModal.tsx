// components/sweet-spot/ui/components/OnboardingModal.tsx

import React, { memo } from 'react';
import { Sparkles } from 'lucide-react';
import { ONBOARDING_STEPS } from '@sweet-spot/constants';

interface OnboardingModalProps {
  isOpen: boolean;
  step: number;
  onSkip: () => void;
  onNext: () => void;
}

export const OnboardingModal = memo<OnboardingModalProps>(({ isOpen, step, onSkip, onNext }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-sm">
      <div className="animate-fadeIn max-w-md rounded-2xl border border-white/10 bg-black/80 p-7 shadow-2xl">
        <div className="mb-5 flex items-center gap-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white">
            {step + 1}
          </span>
          <h3 className="text-2xl font-bold text-white">Bienvenue dans ton Sweet Spot Lab !</h3>
          <Sparkles className="h-5 w-5 text-white/70" />
        </div>

        <p className="mb-6 leading-relaxed text-white/70">{ONBOARDING_STEPS[step]}</p>

        {/* Progress dots */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-all ${
                s === step ? 'bg-white' : s < step ? 'bg-white/40' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">Étape {step + 1}/4</span>
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-white/70 transition-colors hover:text-white"
            >
              Passer
            </button>
            <button
              onClick={onNext}
              className="rounded-lg bg-white px-6 py-2 font-semibold text-black transition-all hover:-translate-y-px hover:bg-white/90"
            >
              {step === 3 ? 'Commencer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

OnboardingModal.displayName = 'OnboardingModal';
