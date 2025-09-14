// data/sjt-questions.ts
// import type { SJTQuestion } from '@/types/sjt';

// data/sjt-questions.ts
export type SJTQuestion = {
  id: string;
  label: string;
  dimension: 'plaisir' | 'competence' | 'utilite' | 'viabilite';
};

export const BASIC_QUESTIONS: SJTQuestion[] = [
  { id: 'q1', label: 'Je prends du plaisir à résoudre des problèmes.', dimension: 'plaisir' },
  { id: 'q2', label: 'J’aime travailler en équipe.', dimension: 'plaisir' },

  { id: 'q3', label: 'Je me sens à l’aise avec des tâches techniques.', dimension: 'competence' },
  { id: 'q4', label: 'J’apprends vite de nouveaux outils.', dimension: 'competence' },

  { id: 'q5', label: 'Je veux un impact utile sur la société.', dimension: 'utilite' },
  { id: 'q6', label: 'Je recherche la stabilité d’emploi.', dimension: 'utilite' },

  { id: 'q7', label: 'Je peux financer mes études prévues.', dimension: 'viabilite' },
  { id: 'q8', label: 'J’ai un bon niveau d’accès aux écoles visées.', dimension: 'viabilite' },
];

export type SJTScenarioOption = {
  id: string;
  text: string;
  scores: { plaisir: number; competence: number; utilite: number; viabilite: number };
  confidence: number;
};

export type SJTScenario = {
  id: string;
  scenario: string;
  dimensions: Array<'plaisir' | 'competence' | 'utilite' | 'viabilite'>;
  options: SJTScenarioOption[];
};

export const QUESTIONS: SJTScenario[] = [
  {
    id: 'sjt_001',
    scenario:
      'En cours de mathématiques, ton professeur propose un exercice bonus difficile. Que fais-tu ?',
    dimensions: ['plaisir', 'competence'],
    options: [
      {
        id: 'a',
        text: "Je me lance immédiatement, j'adore les défis !",
        scores: { plaisir: 0.9, competence: 0.7, utilite: 0.3, viabilite: 0.2 },
        confidence: 4,
      },
      {
        id: 'b',
        text: "J'observe d'abord comment les autres s'y prennent",
        scores: { plaisir: 0.3, competence: 0.8, utilite: 0.6, viabilite: 0.7 },
        confidence: 5,
      },
      {
        id: 'c',
        text: 'Je demande si cela comptera dans la moyenne',
        scores: { plaisir: 0.1, competence: 0.4, utilite: 0.8, viabilite: 0.9 },
        confidence: 5,
      },
      {
        id: 'd',
        text: "Je passe, j'ai déjà assez de travail",
        scores: { plaisir: 0.2, competence: 0.3, utilite: 0.7, viabilite: 0.8 },
        confidence: 3,
      },
    ],
  },
  {
    id: 'sjt_002',
    scenario: 'Ton lycée organise une journée portes ouvertes. Comment participerais-tu ?',
    dimensions: ['plaisir', 'utilite'],
    options: [
      {
        id: 'a',
        text: "J'anime un stand sur ma passion pour la programmation",
        scores: { plaisir: 0.9, competence: 0.6, utilite: 0.7, viabilite: 0.4 },
        confidence: 4,
      },
      {
        id: 'b',
        text: 'Je guide les visiteurs dans les couloirs',
        scores: { plaisir: 0.5, competence: 0.7, utilite: 0.9, viabilite: 0.6 },
        confidence: 5,
      },
      {
        id: 'c',
        text: "Je m'occupe de l'organisation en coulisses",
        scores: { plaisir: 0.4, competence: 0.8, utilite: 0.8, viabilite: 0.7 },
        confidence: 4,
      },
      {
        id: 'd',
        text: 'Je préfère venir en visiteur un autre jour',
        scores: { plaisir: 0.6, competence: 0.5, utilite: 0.3, viabilite: 0.8 },
        confidence: 3,
      },
    ],
  },
  {
    id: 'sjt_012',
    scenario: 'Tu dois choisir tes spécialités pour la Terminale. Quelle est ta priorité ?',
    dimensions: ['competence', 'viabilite'],
    options: [
      {
        id: 'a',
        text: "Les matières où j'ai les meilleures notes",
        scores: { plaisir: 0.4, competence: 0.9, utilite: 0.5, viabilite: 0.8 },
        confidence: 5,
      },
      {
        id: 'b',
        text: 'Les matières les plus utiles pour mon projet',
        scores: { plaisir: 0.5, competence: 0.6, utilite: 0.9, viabilite: 0.9 },
        confidence: 5,
      },
      {
        id: 'c',
        text: "Les matières qui m'intéressent le plus",
        scores: { plaisir: 0.9, competence: 0.5, utilite: 0.6, viabilite: 0.4 },
        confidence: 4,
      },
      {
        id: 'd',
        text: 'Je demande conseil à mes parents et profs',
        scores: { plaisir: 0.3, competence: 0.7, utilite: 0.7, viabilite: 0.9 },
        confidence: 4,
      },
    ],
  },
];
