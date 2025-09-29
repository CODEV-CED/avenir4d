'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function MagneticButton({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.3 });

  const handleMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * 0.15);
    y.set(dy * 0.15);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      onClick={onClick}
      style={{ translateX: springX, translateY: springY }}
      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-400 px-5 py-3 font-semibold text-slate-900 shadow-[0_12px_40px_rgba(124,58,237,.35)] hover:brightness-110 active:scale-[0.99] ${className} `}
    >
      {children}
    </motion.button>
  );
}
