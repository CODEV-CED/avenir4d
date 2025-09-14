'use client';

import dynamic from 'next/dynamic';

// On charge la vraie carte côté client uniquement
const FormationMap = dynamic(() => import('./FormationMap'), { ssr: false });

export default FormationMap;
