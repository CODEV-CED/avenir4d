// types/sjt.ts

// types/sjt.ts
// Removed duplicate Profile4D type declaration

export interface SJTQuestion {
  id: string;
  scenario: string;
  options: SJTOption[];
  dimensions: ('plaisir' | 'competence' | 'utilite' | 'viabilite')[];
}

export interface SJTOption {
  id: string;
  text: string;
  scores: {
    plaisir: number;
    competence: number;
    utilite: number;
    viabilite: number;
  };
  confidence: number; // 1..5 (fiabilité de l’option)
}

export interface SJTResponse {
  questionId: string;
  optionId: string;
  confidence: number; // 1..5 (confiance de l’utilisateur)
}

export interface Profile4D {
  plaisir: number;
  competence: number;
  utilite: number;
  viabilite: number;
  confidence_avg: number;
}

/** helpers UI */
export const DIMENSION_COLORS = {
  plaisir: 'blue',
  competence: 'green',
  utilite: 'purple',
  viabilite: 'orange',
} as const;

export const DIMENSION_LABELS = {
  plaisir: 'Plaisir',
  competence: 'Compétence',
  utilite: 'Utilité',
  viabilite: 'Viabilité',
} as const;
