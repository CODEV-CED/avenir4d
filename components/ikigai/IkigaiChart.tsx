// components/ikigai/IkigaiChart.tsx
'use client';
import * as React from 'react';
import type { Profile4D } from '@/types/sjt';

type Props = {
  profile: Profile4D; // 0..1 pour chaque dimension
  size?: number; // taille en px (carré)
  levels?: number; // nombre de cercles
  showGrid?: boolean;
};

export default function IkigaiChart({ profile, size = 280, levels = 4, showGrid = true }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 16; // marge

  // ordre des axes (sens horaire)
  const axes: Array<keyof Profile4D> = ['plaisir', 'competence', 'utilite', 'viabilite'];
  const labels: Record<keyof Profile4D, string> = {
    plaisir: 'Plaisir',
    competence: 'Compétence',
    utilite: 'Utilité',
    viabilite: 'Viabilité',
    confidence_avg: 'Confiance',
  };

  // calcule les points (x,y) pour un radius relatif (0..1)
  const pointFor = (axisIndex: number, value: number) => {
    const angle = -Math.PI / 2 + axisIndex * ((2 * Math.PI) / axes.length); // 0° en haut
    const rr = r * value;
    return {
      x: cx + rr * Math.cos(angle),
      y: cy + rr * Math.sin(angle),
    };
  };

  // polygone du profil
  const points = axes
    .map((k, i) => {
      const v = Math.max(0, Math.min(1, profile[k] as number));
      const { x, y } = pointFor(i, v);
      return `${x},${y}`;
    })
    .join(' ');

  // quadrillage (cercles + axes)
  const grids = [];
  if (showGrid) {
    for (let i = 1; i <= levels; i++) {
      const rr = (r / levels) * i;
      grids.push(
        <circle key={`c${i}`} cx={cx} cy={cy} r={rr} className="fill-none stroke-gray-200" />,
      );
    }
    // axes
    for (let i = 0; i < axes.length; i++) {
      const { x, y } = pointFor(i, 1);
      grids.push(<line key={`l${i}`} x1={cx} y1={cy} x2={x} y2={y} className="stroke-gray-200" />);
    }
  }

  // étiquettes
  const labelEls = axes.map((k, i) => {
    const { x, y } = pointFor(i, 0.92); // <— à l’intérieur, évite le clipping
    return (
      <text
        key={`t${k}`}
        x={x}
        y={y}
        className="fill-gray-700 text-[11px]"
        textAnchor={i === 1 ? 'start' : i === 3 ? 'end' : 'middle'}
        dominantBaseline={i === 0 ? 'auto' : i === 2 ? 'hanging' : 'middle'}
      >
        {labels[k]}
      </text>
    );
  });

  return (
    <svg
      width={size}
      height={size}
      className="block"
      role="img"
      aria-label="Radar Ikigaï"
      style={{ overflow: 'visible' }}
    >
      {/* fond */}
      <circle cx={cx} cy={cy} r={r} className="fill-white" />
      {/* quadrillage */}
      <g>{grids}</g>
      {/* polygone du profil */}
      <polygon points={points} className="fill-indigo-200/60 stroke-indigo-500" strokeWidth={2} />
      {/* points aux sommets */}
      {axes.map((k, i) => {
        const v = Math.max(0, Math.min(1, profile[k] as number));
        const { x, y } = pointFor(i, v);
        return <circle key={`p${i}`} cx={x} cy={y} r={3} className="fill-indigo-600" />;
      })}
      {/* labels */}
      <g>{labelEls}</g>
    </svg>
  );
}
