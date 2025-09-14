'use client';
import { useMemo } from 'react';

type Props = { show: boolean; count?: number; radius?: number };

export default function EurekaFX({ show, count = 18, radius = 96 }: Props) {
  if (!show) return null;

  const parts = useMemo(() => {
    const arr: { x: number; y: number; delay: number }[] = [];
    const r = radius; // px
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const jitter = i % 2 ? 1 : 0.85;
      arr.push({
        x: Math.cos(ang) * r * jitter,
        y: Math.sin(ang) * r * jitter,
        delay: 40 * (i % 7),
      });
    }
    return arr;
  }, [count, radius]);

  return (
    <div className="eureka-center z-20">
      <div className="relative">
        <div
          className="eureka-core animate-in zoom-in-95 fade-in-0 animate-halo duration-300"
          style={{ filter: 'drop-shadow(0 0 24px rgb(var(--eureka-glow) / 0.45))' }}
        />
        {parts.map((p, idx) => (
          <span
            key={idx}
            className="eureka-dot particle"
            style={
              {
                '--tx': `${p.x}px`,
                '--ty': `${p.y}px`,
                animationDelay: `${p.delay}ms`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
