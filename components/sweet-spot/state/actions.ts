// components/sweet-spot/state/actions.ts

import type { DimKey, SliderValues, TabKey, FilterMode, UserKeywords } from '@sweet-spot/types';

// UI Action Creators
export const uiActions = {
  setActiveTab: (tab: TabKey) => ({
    type: 'SET_ACTIVE_TAB' as const,
    payload: tab,
  }),

  setKeywordInput: (input: string) => ({
    type: 'SET_KEYWORD_INPUT' as const,
    payload: input,
  }),

  setError: (error: string | null) => ({
    type: 'SET_ERROR' as const,
    payload: error,
  }),

  setSuccess: (success: boolean) => ({
    type: 'SET_SUCCESS' as const,
    payload: success,
  }),

  setOnboarding: (show: boolean, step: number) => ({
    type: 'SET_ONBOARDING' as const,
    payload: { show, step },
  }),

  setMobile: (isMobile: boolean) => ({
    type: 'SET_MOBILE' as const,
    payload: isMobile,
  }),

  resetMessages: () => ({
    type: 'RESET_MESSAGES' as const,
  }),
};

// SweetSpot Action Creators
export const sweetSpotActions = {
  setSliderValue: (dim: DimKey, value: number) => ({
    type: 'SET_SLIDER_VALUE' as const,
    payload: { dim, value },
  }),

  setSliderValues: (values: SliderValues) => ({
    type: 'SET_SLIDER_VALUES' as const,
    payload: values,
  }),

  addKeyword: (dim: DimKey, keyword: string) => ({
    type: 'ADD_KEYWORD' as const,
    payload: { dim, keyword },
  }),

  removeKeyword: (dim: DimKey, keyword: string) => ({
    type: 'REMOVE_KEYWORD' as const,
    payload: { dim, keyword },
  }),

  setKeywords: (keywords: UserKeywords) => ({
    type: 'SET_KEYWORDS' as const,
    payload: keywords,
  }),

  addTag: (tag: string) => ({
    type: 'ADD_TAG' as const,
    payload: tag,
  }),

  removeTag: (tag: string) => ({
    type: 'REMOVE_TAG' as const,
    payload: tag,
  }),

  setFilterMode: (mode: FilterMode) => ({
    type: 'SET_FILTER_MODE' as const,
    payload: mode,
  }),

  setConvergences: (convergences: any[]) => ({
    type: 'SET_CONVERGENCES' as const,
    payload: convergences,
  }),

  setLoading: (loading: boolean) => ({
    type: 'SET_LOADING' as const,
    payload: loading,
  }),

  resetAll: () => ({
    type: 'RESET_ALL' as const,
  }),
};



