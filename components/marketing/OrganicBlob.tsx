'use client';
import { motion, useReducedMotion } from 'framer-motion';

const d1 =
  'M76.7,-46.4C93.7,-23.2,96.9,11.5,82.6,38.9C68.2,66.3,36.3,86.5,4.3,84.3C-27.7,82.1,-55.5,57.4,-69.7,27.2C-84,-3,-84.8,-38.8,-69.5,-62.3C-54.2,-85.8,-27.1,-96.9,1.9,-98.3C30.9,-99.6,61.8,-91.2,76.7,-46.4Z';
const d2 =
  'M65.4,-44.9C80.5,-25.2,84.3,2.8,75.5,26.1C66.7,49.4,45.4,67.9,20.4,76.9C-4.5,85.9,-33.2,85.3,-53.3,71.2C-73.4,57.1,-85,29.6,-83.1,4C-81.3,-21.7,-66,-45.4,-46.2,-64.7C-26.4,-84.1,-13.2,-99.2,3.9,-103.8C21.1,-108.5,42.2,-102.6,65.4,-44.9Z';
const d3 =
  'M63.9,-44.8C77.8,-25.8,77.6,5.2,64.5,28.1C51.4,51,25.7,65.9,1.5,64.9C-22.7,64,-45.5,47.1,-59.4,24.3C-73.2,1.4,-78.2,-27.3,-66.9,-47.8C-55.6,-68.2,-27.8,-80.4,1.1,-81.2C29.9,-82,59.9,-71.3,63.9,-44.8Z';

export default function OrganicBlob() {
  const reduce = useReducedMotion();
  return (
    <svg
      // OrganicBlob.tsx (className du <svg>)
      className="absolute -top-24 right-[-30%] hidden h-[50vh] w-[50vh] opacity-35 md:block"
    >
      <defs>
        <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <motion.path
        fill="url(#blobGrad)"
        initial={{ d: d1 }}
        animate={reduce ? undefined : { d: [d1, d2, d3, d1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{ filter: 'blur(8px)' }}
      />
    </svg>
  );
}
