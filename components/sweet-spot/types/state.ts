// components/sweet-spot/types/state.ts
import type { SliderValues, UserKeywords, UIKey, FilterMode } from './dimensions';
import type { UIConvergence } from './convergences';

export interface SweetSpotState {
  sliderValues: SliderValues;
  userKeywords: UserKeywords;
  selectedTags: string[];
  filterMode: FilterMode;
  convergences: UIConvergence[];
  sweetSpotScore: number;
  isLoading: boolean;
}

export interface PersistedData {
  completedSteps: number[];
  onboardingCompleted: boolean;
  activeTab: UIKey;
}

export const initialSweetSpotState: SweetSpotState = {
  sliderValues: { passions: 0.5, talents: 0.5, utilite: 0.5, viabilite: 0.5 },
  userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
  selectedTags: [],
  filterMode: 'union',
  convergences: [],
  sweetSpotScore: 0.5,
  isLoading: false,
};
