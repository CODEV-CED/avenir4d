// components/sweet-spot/ui/components/ProgressIndicator.tsx

import React, { memo } from 'react';

interface ProgressIndicatorProps {
  completedSteps: number[];
  isMobile: boolean;
}

export const ProgressIndicator = memo<ProgressIndicatorProps>(({ completedSteps, isMobile }) => {
  return (
    <div
      className={`absolute top-0 right-0 flex items-center gap-2 rounded-full border border-purple-500/30 bg-gray-900/80 backdrop-blur-md ${
        isMobile ? 'px-2 py-1' : 'px-5 py-2'
      }`}
    >
      <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white/90`}>
        {isMobile ? 'Prog.' : 'Progression'}
      </span>
      <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
        {[0, 1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1 rounded-full transition-all ${isMobile ? 'w-3' : 'w-6'} ${
              completedSteps.includes(step)
                ? 'bg-white'
                : step === completedSteps.length
                  ? 'animate-pulse bg-white/50'
                  : 'bg-white/20'
            }`}
          />
        ))}
      </div>
      <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white/70`}>
        {completedSteps.length}/5
      </span>
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

interface QuickStepsProps {
  completedSteps: number[];
  isMobile: boolean;
  onStepClick: (index: number) => void;
}

export const QuickSteps = memo<QuickStepsProps>(({ completedSteps, isMobile, onStepClick }) => {
  const steps = ['Ajuste tes curseurs', 'Observe ton Ikigaï', 'Personnalise ton profil'];

  return (
    <div className={`mb-10 flex flex-wrap justify-center ${isMobile ? 'gap-4' : 'gap-8'}`}>
      {steps.map((step, idx) => (
        <button
          key={idx}
          onClick={() => onStepClick(idx)}
          className={`flex cursor-pointer items-center gap-2 transition-all hover:scale-105 ${
            completedSteps.includes(idx)
              ? 'opacity-100'
              : idx === completedSteps.length
                ? 'opacity-80'
                : 'opacity-40'
          }`}
        >
          <span
            className={`flex ${isMobile ? 'h-4 w-4' : 'h-5 w-5'} items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
              completedSteps.includes(idx)
                ? 'border-white bg-white text-black'
                : idx === completedSteps.length
                  ? 'animate-pulse border-white/60 bg-white/10'
                  : 'border-white/30'
            }`}
          >
            {completedSteps.includes(idx) && '✔'}
          </span>
          <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{step}</span>
        </button>
      ))}
    </div>
  );
});

QuickSteps.displayName = 'QuickSteps';
