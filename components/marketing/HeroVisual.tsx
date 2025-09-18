'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useLayoutEffect } from 'react';

type Props = { score?: number; className?: string };

const CIRCLES = [
  { x: -72, y: -84 },
  { x: 72, y: -80 },
  { x: -64, y: 24 },
  { x: 76, y: 44 },
];

export default function HeroVisual({ score = 0, className = '' }: Props) {
  const CIRCLE_SIZE = 'clamp(190px, 30vw, 280px)';
  const WRAP_SIZE = 'clamp(300px, 44vw, 560px)';

  // refs to measure actual rendered circle centers so we can place the
  // sweet-spot precisely at their intersection for any responsive size
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const circleRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const wRect = wrapper.getBoundingClientRect();
    const centers = circleRefs.current
      .map((el) => el && el.getBoundingClientRect())
      .filter(Boolean) as DOMRect[];
    if (centers.length === 0) return;
    const sum = centers.reduce(
      (acc, r) => ({
        x: acc.x + (r.left + r.width / 2 - wRect.left),
        y: acc.y + (r.top + r.height / 2 - wRect.top),
      }),
      { x: 0, y: 0 },
    );
    setCenter({ x: Math.round(sum.x / centers.length), y: Math.round(sum.y / centers.length) });
    // recompute on resize
    const onResize = () => {
      const centers2 = circleRefs.current
        .map((el) => el && el.getBoundingClientRect())
        .filter(Boolean) as DOMRect[];
      if (centers2.length === 0) return;
      const sum2 = centers2.reduce(
        (acc, r) => ({
          x: acc.x + (r.left + r.width / 2 - wRect.left),
          y: acc.y + (r.top + r.height / 2 - wRect.top),
        }),
        { x: 0, y: 0 },
      );
      setCenter({
        x: Math.round(sum2.x / centers2.length),
        y: Math.round(sum2.y / centers2.length),
      });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      ref={wrapperRef}
      data-testid="herovisual-wrapper"
      className={[
        'pointer-events-none relative',
        'mx-auto md:mx-0',
        'aspect-square',
        'overflow-visible',
        'transition-transform duration-300 hover:scale-105',
        className,
      ].join(' ')}
      style={{ width: WRAP_SIZE, height: WRAP_SIZE }}
    >
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 50%, rgba(139,92,246,0.32) 0%, rgba(56,189,248,0.14) 36%, rgba(0,0,0,0) 78%)',
          filter: 'blur(14px)',
        }}
      />

      {CIRCLES.map(({ x, y }, i) => (
        <motion.div
          key={i}
          ref={((el: HTMLDivElement | null) => (circleRefs.current[i] = el)) as any}
          className={`absolute rounded-full mix-blend-screen ${
            i === 0
              ? 'bg-rose-500/60'
              : i === 1
                ? 'bg-emerald-500/60'
                : i === 2
                  ? 'bg-sky-500/60'
                  : 'bg-yellow-400/60'
          }`}
          style={{
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.42,
          }}
          initial={{ x, y: y + 8, scale: 0.98, opacity: 0.32 }}
          animate={{ x, y, scale: 1, opacity: 0.42 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: i * 0.03 }}
        />
      ))}

      <motion.div
        className="absolute rounded-full border border-white/40 bg-white/85"
        style={{
          width: '48px',
          height: '48px',
          left: center ? `${center.x - 22}px` : '50%',
          top: center ? `${center.y - 30}px` : '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 40px rgba(255,255,255,0.9)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.96, 1, 0.96] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />

      <AnimatePresence>
        {score > 0.7 && (
          <>
            {[0, 1].map((k) => (
              <motion.span
                data-testid={`herovisual-pulse-${k}`}
                key={k}
                className="absolute rounded-full"
                style={{
                  left: center ? `${center.x}px` : '50%',
                  top: center ? `${center.y}px` : '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 0 6px rgba(139,92,246,0.78)',
                  width: 80,
                  height: 80,
                  mixBlendMode: 'screen',
                }}
                initial={{ opacity: 0.96, scale: 1 }}
                animate={{ opacity: 0, scale: 2.8 }}
                transition={{ duration: 1.25, repeat: Infinity, delay: k * 0.55 }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
