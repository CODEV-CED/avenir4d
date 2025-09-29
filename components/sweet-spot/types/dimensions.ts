// components/sweet-spot/types/dimensions.ts

export type UIKey = 'passions' | 'talents' | 'impact' | 'potentiel';
export type DimKey = 'passions' | 'talents' | 'utilite' | 'viabilite';

// TabKey est maintenant simplement un alias de UIKey
export type TabKey = UIKey;

export type SliderValues = Record<DimKey, number>;
export type UserKeywords = Record<DimKey, string[]>;
export type SliderPercentages = Record<UIKey, number>;

export type FilterMode = 'union' | 'intersection';

export const uiToEngine: Record<UIKey, DimKey> = {
  passions: 'passions',
  talents: 'talents',
  impact: 'utilite',
  potentiel: 'viabilite',
} as const;

// Types pour les positions et couleurs des cercles
export type CirclePosition = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

// Changé pour être mutable par défaut
export type RGB = [number, number, number];

export interface Circle {
  pos: { top?: string; right?: string; bottom?: string; left?: string };
  rgb: [number, number, number];
  dim: UIKey;
}
