'use client';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  className?: string;
  mode?: 'demo' | 'lab'; // "demo" = anneaux toujours ON
  score?: number; // utile en "lab"
  wrap?: number; // largeur/hauteur du canvas (px)
  diam?: number; // diamètre d’un cercle (px)
  offset?: number; // distance centre→centre (px)
};

export default function HeroVisual({
  className = '',
  mode = 'demo',
  score = 0,
  wrap = 360,
  diam = 240,
  offset = 72,
}: Props) {
  const r = diam / 2;
  const cx = wrap / 2;
  const cy = wrap / 2;
  const showRings = mode === 'demo' || score > 0.7;

  const circles = [
    { fill: '#ef4444', x: cx - offset, y: cy - offset }, // 🔴 Passions
    { fill: '#22c55e', x: cx + offset, y: cy - offset }, // 🟢 Talents
    { fill: '#3b82f6', x: cx - offset, y: cy + offset }, // 🔵 Utilité
    { fill: '#eab308', x: cx + offset, y: cy + offset }, // 🟡 Viabilité
  ];

  return (
    <div
      className={`relative ${className}`}
      style={{ width: wrap, height: wrap, isolation: 'isolate' }}
      aria-label="Démo Sweet Spot — intersection centrale des 4 cercles"
    >
      <motion.svg
        viewBox={`0 0 ${wrap} ${wrap}`}
        width={wrap}
        height={wrap}
        className="overflow-visible"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
      >
        {/* halo doux */}
        <radialGradient id="bgHalo" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="70%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <rect width={wrap} height={wrap} fill="url(#bgHalo)" />

        {/* Cercles additifs */}
        {circles.map((c, i) => (
          <motion.circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={r}
            fill={c.fill}
            style={{ mixBlendMode: 'screen' }}
            initial={{ scale: 0.96, opacity: 0.2 }}
            animate={{ scale: 1, opacity: 0.3 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: i * 0.05 }}
          />
        ))}

        {/* Noyau */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={28}
          fill="rgba(255,255,255,0.75)"
          stroke="rgba(255,255,255,0.5)"
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />

        {/* Anneaux pulsants — toujours ON en démo */}
        <AnimatePresence>
          {showRings &&
            [0, 1].map((k) => (
              <motion.circle
                key={k}
                cx={cx}
                cy={cy}
                r={28}
                fill="transparent"
                stroke="rgba(139,92,246,0.7)"
                strokeWidth={2}
                style={{ mixBlendMode: 'screen' }}
                initial={{ opacity: 0.9, scale: 1 }}
                animate={{ opacity: 0, scale: 1.8 }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 * k }}
              />
            ))}
        </AnimatePresence>
      </motion.svg>
    </div>
  );
}
