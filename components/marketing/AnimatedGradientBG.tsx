'use client';
import { motion, useReducedMotion } from 'framer-motion';
import clsx from 'clsx';
import type { Variants } from 'framer-motion';

const gradientVariants: Variants = {
  animate: {
    backgroundPosition: ['0% 0%', '100% 50%', '0% 100%'],
    filter: ['blur(80px)', 'blur(120px)', 'blur(80px)'],
    transition: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
  },
};

export default function AnimatedGradientBG({
  variant = 'dual', // 'dual' | 'left-only' | 'soft'
  className = '',
}: {
  variant?: 'dual' | 'left-only' | 'soft';
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  const bgImage =
    variant === 'left-only'
      ? // ⬅️ violet uniquement (supprime la tache cyan à droite)
        'radial-gradient(circle_at_20%_40%,#7c3aed40,transparent_60%)'
      : variant === 'soft'
        ? 'radial-gradient(circle_at_25%_35%,#7c3aed30,transparent_60%),radial-gradient(circle_at_70%_40%,#22d3ee22,transparent_70%)'
        : // 'dual'
          'radial-gradient(circle_at_20%_20%,#7c3aed40,transparent_60%),radial-gradient(circle_at_80%_30%,#22d3ee40,transparent_70%)';

  return (
    <motion.div
      aria-hidden
      className={clsx('pointer-events-none absolute inset-0 -z-10', className)}
      style={{ backgroundImage: bgImage, backgroundSize: '200% 200%' }}
      variants={gradientVariants}
      animate={prefersReducedMotion ? undefined : 'animate'}
    />
  );
}
