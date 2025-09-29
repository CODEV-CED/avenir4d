'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function FeatureRowScroll({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const y = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);
  const o = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0.9]);

  return (
    <div ref={ref} className="relative">
      <motion.div
        style={{ x, y, opacity: o, willChange: 'transform, opacity' }}
        className="grid gap-8 md:grid-cols-3"
      >
        {children}
      </motion.div>
    </div>
  );
}
