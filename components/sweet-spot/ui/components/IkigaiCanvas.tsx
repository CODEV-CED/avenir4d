// components/sweet-spot/ui/components/IkigaiCanvas.tsx

import React, { memo, useMemo } from 'react';
import type { SweetSpotState, SliderPercentages } from '@sweet-spot/types';
import { CANVAS_CIRCLES, LEGEND_ITEMS, RESPONSIVE_SIZES } from '@sweet-spot/constants';
import { createGradient, getFilterStyle } from '@sweet-spot/utils';

interface IkigaiCanvasProps {
  sliderPct: SliderPercentages;
  state: SweetSpotState;
  isEureka: boolean;
  scorePct: number;
  isMobile: boolean;
  canvasQuality?: {
    filter: string;
    opacity: number;
    mixBlendMode: 'normal' | 'screen';
  };
}

export const IkigaiCanvas = memo<IkigaiCanvasProps>(
  ({ sliderPct, state, isEureka, scorePct, isMobile, canvasQuality }) => {
    const sizes = isMobile ? RESPONSIVE_SIZES.mobile : RESPONSIVE_SIZES.desktop;

    // Cercles pré-définis (positions, couleurs, dimension associée)
    const circles = useMemo(() => CANVAS_CIRCLES, []);

    const quality = useMemo(
      () =>
        isMobile
          ? ({ filter: 'blur(0.2px)', opacity: 0.7, mixBlendMode: 'normal' } as const)
          : ({ filter: 'blur(0.4px)', opacity: 0.85, mixBlendMode: 'screen' } as const),
      [isMobile],
    );

    const circleFilter = useMemo(() => {
      const baseFilter = getFilterStyle(state.filterMode, isEureka);
      // on garde nos blur/opacity depuis `quality.filter`, on enlève juste le blur éventuel du baseFilter
      const tokens = baseFilter.split(' ').filter((t) => t && !t.startsWith('blur'));
      return [quality.filter, ...tokens].join(' ').trim();
    }, [quality.filter, state.filterMode, isEureka]);

    return (
      <>
        <div className={`relative flex items-center justify-center ${sizes.canvasWrapper}`}>
          <div
            className={`ikigai-canvas relative ${sizes.canvas}`}
            role="img"
            aria-label={`Diagramme Ikigaï en mode ${state.filterMode}. Score ${scorePct}%.`}
          >
            {/* Fond pour le mode intersection */}
            {state.filterMode === 'intersection' && (
              <div className="absolute inset-0 rounded-full bg-white/5" />
            )}

            {/* Les 4 cercles colorés */}
            {circles.map((circle, i) => (
              <div
                key={i}
                className="absolute h-56 w-56 rounded-full transition-all duration-700"
                style={{
                  background: createGradient(
                    circle.rgb,
                    state.filterMode === 'intersection' ? 0.95 : 0.85,
                    state.filterMode === 'intersection' ? 0.6 : 0.45,
                  ),
                  ...circle.pos,
                  transform: `scale(${
                    (sliderPct[circle.dim] / 100) * 0.6 + (isEureka ? 0.8 : 0.6)
                  })`,
                  filter: circleFilter,
                  mixBlendMode: quality.mixBlendMode,
                  opacity: quality.opacity,
                }}
              />
            ))}

            {/* Overlay pour le mode intersection */}
            {state.filterMode === 'intersection' && (
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.06) 20%, transparent 60%)',
                  mixBlendMode: 'screen',
                }}
              />
            )}

            {/* Score au centre */}
            <div className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
              <div className="relative flex items-center justify-center">
                {isEureka && (
                  <>
                    <div
                      className={`pointer-events-none absolute ${sizes.ring} animate-[eureka-ring_2s_ease-out_infinite] rounded-full border-4 border-purple-500`}
                    />
                    <div
                      className={`pointer-events-none absolute ${sizes.ring} animate-[eureka-ring_2s_ease-out_infinite] rounded-full border-4 border-cyan-500 [animation-delay:0.5s]`}
                    />
                    <div className="pointer-events-none absolute -inset-2 animate-pulse rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-sm" />
                  </>
                )}
                <div
                  className={`relative flex ${sizes.score} items-center justify-center rounded-full bg-white/95 text-2xl font-black text-black transition-all ${
                    isEureka ? 'shadow-eureka animate-pulse' : 'shadow-lg'
                  }`}
                >
                  {scorePct}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Légende */}
        <div className="mt-6 flex flex-wrap justify-center gap-5">
          {LEGEND_ITEMS.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2"
            >
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm">{item.name}</span>
            </div>
          ))}
        </div>
      </>
    );
  },
);

IkigaiCanvas.displayName = 'IkigaiCanvas';
