'use client';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function ChevronMark({
  // plus grand par défaut
  size = 'clamp(180px,24vw,420px)',
}: {
  size?: string;
}) {
  return (
    <div className="relative flex flex-col items-center text-white md:items-end">
      {/* halo doux derrière */}
      <div className="pointer-events-none absolute top-2 right-4 -z-10 h-64 w-64 rounded-full bg-white/12 blur-3xl md:right-8" />

      {/* chevron animé */}
      <motion.div
        aria-hidden
        style={{ width: size, height: size }}
        initial={{ scale: 1, filter: 'drop-shadow(0 0 4px rgba(255,255,255,.45))' }}
        animate={{
          scale: [1, 1.06, 1],
          filter: [
            'drop-shadow(0 0 4px rgba(255,255,255,.45))',
            'drop-shadow(0 0 16px rgba(255,255,255,.9))',
            'drop-shadow(0 0 4px rgba(255,255,255,.45))',
          ],
        }}
        transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
        className="select-none"
      >
        <ChevronRight className="h-full w-full text-white" strokeWidth={3.5} />
      </motion.div>

      {/* slogan sous le chevron (pas d’absolu) */}
      <p className="mt-4 text-center text-[clamp(28px,3.4vw,56px)] leading-tight font-extrabold md:text-right">
        Ton futur,
        <br />
        <span className="text-white/90">version toi</span>
      </p>
    </div>
  );
}
