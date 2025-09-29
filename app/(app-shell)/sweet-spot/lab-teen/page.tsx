// app/(app-shell)/sweet-spot/lab-teen/page.tsx

import { Metadata } from 'next';
import SweetSpotLabClient from './client';

export const metadata: Metadata = {
  title: 'Sweet Spot Lab Teen - Trouve ton équilibre',
  description: 'Découvre ton Sweet Spot entre passions, talents, impact et potentiel',
};

export default function SweetSpotLabTeenPage() {
  return <SweetSpotLabClient />;
}
