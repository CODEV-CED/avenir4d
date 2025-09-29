// components/sweet-spot/types/ia.ts

export type Project = {
  id: string;
  title: string;
  description: string;
  matchScore?: number; // optionnel si pas toujours renvoyé
  requiredSkills?: string[];
  timeHorizon?: string;
  difficulty?: 'Accessible' | 'Intermédiaire' | 'Avancé' | string;
  nextSteps?: string[];
};

export type SweetSpotResult = {
  score: number; // 0..1
  insights: string[];
  recommendations: string[];
};
