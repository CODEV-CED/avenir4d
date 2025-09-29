// components/sweet-spot/types.ts

import type { DimKey, SliderValues, UserKeywords, FilterMode } from './types/dimensions';

export * from './types/index';

export interface UIState {
  sliderValues: SliderValues;
  userKeywords: UserKeywords;
  selectedTags: string[];
  sweetSpotScore: number;
  filterMode: FilterMode;
}

export const initialUIState: UIState = {
  sliderValues: { passions: 0.25, talents: 0.25, utilite: 0.25, viabilite: 0.25 },
  userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
  selectedTags: [],
  sweetSpotScore: 0,
  filterMode: 'union',
};
