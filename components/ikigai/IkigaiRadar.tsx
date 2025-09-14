'use client';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import type { Profile4D } from '@/types/sjt';

export default function IkigaiRadar({ profile }: { profile: Profile4D }) {
  const data = [
    { dim: 'Plaisir', value: profile.plaisir },
    { dim: 'Compétence', value: profile.competence },
    { dim: 'Utilité', value: profile.utilite },
    { dim: 'Viabilité', value: profile.viabilite },
  ];

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="65%">
          <PolarGrid />
          <PolarAngleAxis dataKey="dim" tick={{ fontSize: 12, fill: '#374151' }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 1]}
            tick={{ fontSize: 10, fill: '#6B7280' }}
            tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
          />
          <Radar name="Profil" dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.25} />
          <Legend />
          <Tooltip formatter={(v) => `${Math.round(Number(v) * 100)}%`} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
