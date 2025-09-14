'use client';
import { motion } from 'framer-motion';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import EurekaFX from '@/components/EurekaFX'; // ton composant d’anim “Eureka”
import ConvergenceCloud from '@/components/ConvergenceCloud';

const scaleFrom = (x: number) => 0.85 + x * 0.5; // 0.85 → 1.35

export default function IkigaiCanvas() {
  const { sliderValues, sweetSpotScore } = useSweetSpotStore((s) => ({
    sliderValues: s.sliderValues,
    sweetSpotScore: s.sweetSpotScore,
  }));

  return (
    <div className="relative mx-auto my-4 h-[22rem] w-full max-w-xl">
      {/* 4 cercles — mix-blend-screen pour de jolies intersections */}
      <motion.div
        className="absolute top-0 left-6 size-56 rounded-full bg-pink-500/30 mix-blend-screen blur-[1px]"
        animate={{ scale: scaleFrom(sliderValues.passions) }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      />
      <motion.div
        className="absolute top-0 right-6 size-56 rounded-full bg-blue-500/30 mix-blend-screen blur-[1px]"
        animate={{ scale: scaleFrom(sliderValues.talents) }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      />
      <motion.div
        className="absolute bottom-0 left-6 size-56 rounded-full bg-emerald-500/30 mix-blend-screen blur-[1px]"
        animate={{ scale: scaleFrom(sliderValues.utilite) }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      />
      <motion.div
        className="absolute right-6 bottom-0 size-56 rounded-full bg-yellow-400/30 mix-blend-screen blur-[1px]"
        animate={{ scale: scaleFrom(sliderValues.viabilite) }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      />

      {/* Marqueur central + Eureka */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="h-4 w-4 rounded-full bg-white/70 shadow-[0_0_30px_rgba(255,255,255,.4)]" />
      </div>
      {/* Convergence cloud overlay (centered) */}
      <ConvergenceCloud max={8} baseRadius={110} minRadius={20} />
      <EurekaFX show={sweetSpotScore > 0.7} />
    </div>
  );
}
