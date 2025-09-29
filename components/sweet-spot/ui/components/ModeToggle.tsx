// components/sweet-spot/ui/components/ModeToggle.tsx

import React, { memo } from 'react';
import { Info } from 'lucide-react';
import type { FilterMode } from '@sweet-spot/types';

interface ModeToggleProps {
  mode: FilterMode;
  onChange: (mode: FilterMode) => void;
  isMobile: boolean;
}

export const ModeToggle = memo<ModeToggleProps>(({ mode, onChange, isMobile }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative grid grid-cols-2 overflow-hidden rounded-full bg-black/30 ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}
      >
        {/* Sélecteur blanc qui glisse */}
        <div
          className="pointer-events-none absolute top-0 left-0 h-full w-1/2 rounded-full bg-white transition-transform duration-300"
          style={{
            transform: mode === 'union' ? 'translateX(0%)' : 'translateX(100%)',
          }}
        />

        {/* Boutons */}
        <button
          type="button"
          onClick={() => onChange('union')}
          aria-pressed={mode === 'union'}
          className={`relative z-10 font-semibold whitespace-nowrap ${
            isMobile ? 'w-[7.5rem] px-3 py-1' : 'w-32 px-4 py-1.5'
          } ${mode === 'union' ? 'text-black' : 'text-white/70 hover:text-white'}`}
        >
          Union
        </button>

        <button
          type="button"
          onClick={() => onChange('intersection')}
          aria-pressed={mode === 'intersection'}
          className={`relative z-10 font-semibold whitespace-nowrap ${
            isMobile ? 'w-[7.5rem] px-3 py-1' : 'w-32 px-4 py-1.5'
          } ${mode === 'intersection' ? 'text-black' : 'text-white/70 hover:text-white'}`}
        >
          Intersection
        </button>
      </div>

      {/* Info tooltip */}
      <div className="group relative grid place-items-center">
        <Info className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} cursor-help text-white/60`} />
        <div
          className={`pointer-events-none absolute top-6 right-0 ${
            isMobile ? 'w-40' : 'w-48'
          } z-10 rounded-lg border border-white/15 bg-black p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100`}
        >
          <p className="text-xs text-white/80">
            <strong>Union</strong> : toutes tes forces combinées
            <br />
            <strong>Intersection</strong> : là où tout se croise
          </p>
        </div>
      </div>
    </div>
  );
});

ModeToggle.displayName = 'ModeToggle';
