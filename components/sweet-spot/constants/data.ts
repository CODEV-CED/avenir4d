// components/sweet-spot/constants/data.ts

import type { UIKey, Circle } from '@sweet-spot/types';
import type { UIConvergence } from '@sweet-spot/types/convergences';

export const sliderEntries = [
  { key: 'passions' as UIKey, emoji: '🔥', label: 'Passions', tone: 'red' as const },
  { key: 'talents' as UIKey, emoji: '🧠', label: 'Talents', tone: 'blue' as const },
  { key: 'impact' as UIKey, emoji: '🌍', label: 'Impact', tone: 'green' as const },
  { key: 'potentiel' as UIKey, emoji: '🚀', label: 'Potentiel', tone: 'yellow' as const },
] as const;

export const keywordTabMeta = {
  passions: {
    emoji: '🔥',
    placeholder: 'Ex: création, sport, musique, voyage...',
  },
  talents: {
    emoji: '🧠',
    placeholder: 'Ex: écoute, organisation, analyse, leadership...',
  },
  impact: {
    emoji: '🌍',
    placeholder: 'Ex: environnement, éducation, santé, égalité...',
  },
  potentiel: {
    emoji: '🚀',
    placeholder: 'Ex: tech, business, innovation, freelance...',
  },
} as const;

export const TAG_POOL = [
  '🎨 Créatif',
  '📊 Analytique',
  '🤝 Social',
  '🔬 Scientifique',
  '💼 Entrepreneurial',
  '🌱 Écologique',
  '🏗️ Technique',
  '✏️ Littéraire',
  '🎭 Artistique',
  '⚕️ Santé',
  '📱 Digital',
  '🏃 Sportif',
];

// Solution : Créer les objets avec des arrays mutables dès le départ
export const SAMPLE_CONVERGENCES: UIConvergence[] = [
  {
    id: '1',
    formula: ['Design', 'IA', 'Éducation'] as string[], // Cast explicite en string[]
    result: "Coach d'app créatives pour lycéens",
    description:
      "Créer des expériences d'apprentissage visuelles et interactives qui utilisent l'IA.",
    example: "Développe une app qui aide les lycéens à créer leur portfolio numérique avec l'IA.",
  },
  {
    id: '2',
    formula: ['Écologie', 'Tech', 'Social'] as string[], // Cast explicite en string[]
    result: 'Innovateur impact environnemental',
    description: 'Développer des solutions tech pour mobiliser des communautés autour du climat.',
    example: 'Plateforme collaborative pour les initiatives écologiques locales.',
  },
  {
    id: '3',
    formula: ['Gaming', 'Psycho', 'Impact'] as string[], // Cast explicite en string[]
    result: 'Game designer thérapeutique',
    description: 'Concevoir des jeux qui aident à développer des compétences émotionnelles.',
    example: 'Serious games pour la gestion du stress.',
  },
];

export const LEGEND_ITEMS = [
  { name: 'Passions', color: '#ff0050' },
  { name: 'Talents', color: '#0080ff' },
  { name: 'Impact', color: '#00ff80' },
  { name: 'Potentiel', color: '#ffc800' },
] as const;

// Définition des cercles pour le canvas
export const CANVAS_CIRCLES: Circle[] = [
  {
    pos: { top: '30px', left: '30px' },
    rgb: [255, 0, 80],
    dim: 'passions',
  },
  {
    pos: { top: '30px', right: '30px' },
    rgb: [0, 128, 255],
    dim: 'talents',
  },
  {
    pos: { bottom: '30px', left: '30px' },
    rgb: [0, 255, 128],
    dim: 'impact',
  },
  {
    pos: { bottom: '30px', right: '30px' },
    rgb: [255, 200, 0],
    dim: 'potentiel',
  },
];
