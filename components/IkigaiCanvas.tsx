'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import ConvergenceCloud from '@/components/ConvergenceCloud';

type Props = { size?: number };

export default function IkigaiCanvas({ size = 640 }: Props) {
  const v = useSweetSpotStore((s) => s.sliderValues);
  const score = useSweetSpotStore((s) => s.sweetSpotScore);
  const isEureka = score >= 0.7;

  const DIM = useMemo(() => Math.round(Math.min(Math.max(size, 420), 760)), [size]);
  const base = Math.round(DIM * 0.6);
  const off = Math.round(DIM * 0.13);
  const dot = Math.round(DIM * 0.035);
  const s = (x: number) => 0.6 + x * 0.8; // 0.6..1.4

  return (
    <div
      className="relative mx-auto grid place-items-center"
      style={{ width: DIM, height: DIM, isolation: 'isolate' }}
    >
      {/* aura eureka: blanc doux (plus de jaune) */}
      {isEureka && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: Math.round(DIM * 0.33),
            height: Math.round(DIM * 0.33),
            boxShadow: '0 0 0 0 rgba(255,255,255,0.45)',
          }}
          animate={{
            boxShadow: ['0 0 0 0 rgba(255,255,255,0.45)', '0 0 60px 30px rgba(255,255,255,0)'],
          }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
        />
      )}

      {/* 4 cercles — flat, sans gradient, blend "screen" pour éviter le marron */}
      <Circle color="#ef4444" x={-off} y={-off / 2} size={base} scale={s(v.passions)} />
      <Circle color="#22c55e" x={+off} y={-off / 2} size={base} scale={s(v.talents)} />
      <Circle color="#3b82f6" x={-off} y={+off / 2} size={base} scale={s(v.utilite)} />
      <Circle color="#eab308" x={+off} y={+off / 2} size={base} scale={s(v.viabilite)} />

      {/* centre : gris neutre + inner shadow, aucun mélange */}
      <motion.div
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: dot * 1.9,
          height: dot * 1.9,
          backgroundColor: '#cbd5e1', // gris (slate-300)
          mixBlendMode: 'normal', // évite toute teinte remontée
          zIndex: 10, // au-dessus des cercles
          willChange: 'transform, box-shadow, filter',
          // inner shadow douce + léger liseré interne (pas de bordure externe)
          boxShadow: [
            'inset 0 10px 22px rgba(2, 6, 23, 0.1)', // haut
            'inset 0 -12px 26px rgba(2, 6, 23, 0.1)', // bas
            'inset 0 0 0 1px rgba(255,255,255,0.1)', // liseré intérieur
            isEureka ? '0 0 24px rgba(255,255,255,0.20)' : '0 0 0 rgba(0,0,0,0)',
          ].join(', '),
        }}
        animate={
          isEureka
            ? {
                scale: [1, 1.18, 1], // + d’amplitude
                filter: ['brightness(1)', 'brightness(1.25)', 'brightness(1)'],
                boxShadow: [
                  // clé 1
                  'inset 0 10px 22px rgba(2,6,23,0.55), inset 0 -12px 26px rgba(2,6,23,0.38), inset 0 0 0 1px rgba(255,255,255,0.20), 0 0 0 rgba(255,255,255,0)',
                  // clé 2 (glow)
                  'inset 0 10px 22px rgba(2,6,23,0.55), inset 0 -12px 26px rgba(2,6,23,0.38), inset 0 0 0 1px rgba(255,255,255,0.20), 0 0 28px rgba(255,255,255,0.32)',
                  // clé 3
                  'inset 0 10px 22px rgba(2,6,23,0.55), inset 0 -12px 26px rgba(2,6,23,0.38), inset 0 0 0 1px rgba(255,255,255,0.20), 0 0 0 rgba(255,255,255,0)',
                ],
              }
            : { scale: 1 }
        }
        transition={{ duration: 0.9, repeat: isEureka ? Infinity : 0, ease: 'easeInOut' }}
      />
      {/* ripple externe doux (anneau) */}
      {isEureka && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: dot * 4.4,
            height: dot * 4.4,
            border: '2px solid rgba(255,255,255,0.22)',
            zIndex: 9,
            pointerEvents: 'none',
          }}
          initial={{ scale: 0.9, opacity: 0.0 }}
          animate={{ scale: [0.9, 1.3], opacity: [0.28, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      {/* nuage : laisse le centre libre */}
      <ConvergenceCloud
        baseRadius={Math.round(DIM * 0.4)}
        minRadius={Math.round(DIM * 0.24)}
        // @ts-ignore
        avoidCenterRadius={Math.round(DIM * 0.22)}
        max={8}
      />
    </div>
  );
}

function Circle({
  color,
  x,
  y,
  size,
  scale,
}: {
  color: string;
  x: number;
  y: number;
  size: number;
  scale: number;
}) {
  const [r, g, b] = hexToRgb(color);
  const alpha = 0.2; // opacité homogène, sans “ombre”
  return (
    <motion.div
      className="absolute rounded-full mix-blend-screen"
      style={{
        backgroundColor: `rgba(${r},${g},${b},${alpha})`,
        width: size,
        height: size,
        left: '50%',
        top: '50%',
        translateX: -size / 2 + x,
        translateY: -size / 2 + y,
      }}
      animate={{ scale }}
      transition={{ type: 'spring', stiffness: 140, damping: 18 }}
    />
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  );
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
