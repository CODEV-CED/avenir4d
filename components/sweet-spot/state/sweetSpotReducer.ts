// components/sweet-spot/state/sweetSpotReducer.ts

import type { SweetSpotState, SliderValues, DimKey, UserKeywords } from '@sweet-spot/types';
import { calculateSweetSpotScore } from '@sweet-spot/utils';
import { initialSweetSpotState } from '@sweet-spot/types';

export type SweetSpotAction =
  | { type: 'SET_SLIDER_VALUE'; payload: { dim: DimKey; value: number } }
  | { type: 'SET_SLIDER_VALUES'; payload: SliderValues }
  | { type: 'ADD_KEYWORD'; payload: { dim: DimKey; keyword: string } }
  | { type: 'REMOVE_KEYWORD'; payload: { dim: DimKey; keyword: string } }
  | { type: 'SET_KEYWORDS'; payload: UserKeywords }
  | { type: 'ADD_TAG'; payload: string }
  | { type: 'REMOVE_TAG'; payload: string }
  | { type: 'SET_FILTER_MODE'; payload: 'union' | 'intersection' }
  | { type: 'SET_CONVERGENCES'; payload: any[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_ALL' };

export const sweetSpotReducer = (
  state: SweetSpotState,
  action: SweetSpotAction,
): SweetSpotState => {
  switch (action.type) {
    case 'SET_SLIDER_VALUE': {
      const newSliderValues = {
        ...state.sliderValues,
        [action.payload.dim]: action.payload.value,
      };
      return {
        ...state,
        sliderValues: newSliderValues,
        sweetSpotScore: calculateSweetSpotScore(newSliderValues, state.filterMode),
      };
    }

    case 'SET_SLIDER_VALUES': {
      return {
        ...state,
        sliderValues: action.payload,
        sweetSpotScore: calculateSweetSpotScore(action.payload, state.filterMode),
      };
    }

    case 'ADD_KEYWORD': {
      return {
        ...state,
        userKeywords: {
          ...state.userKeywords,
          [action.payload.dim]: [...state.userKeywords[action.payload.dim], action.payload.keyword],
        },
      };
    }

    case 'REMOVE_KEYWORD': {
      return {
        ...state,
        userKeywords: {
          ...state.userKeywords,
          [action.payload.dim]: state.userKeywords[action.payload.dim].filter(
            (k) => k !== action.payload.keyword,
          ),
        },
      };
    }

    case 'SET_KEYWORDS': {
      return {
        ...state,
        userKeywords: { ...action.payload },
      };
    }

    case 'ADD_TAG': {
      return {
        ...state,
        selectedTags: [...state.selectedTags, action.payload],
      };
    }

    case 'REMOVE_TAG': {
      return {
        ...state,
        selectedTags: state.selectedTags.filter((t) => t !== action.payload),
      };
    }

    case 'SET_FILTER_MODE': {
      return {
        ...state,
        filterMode: action.payload,
        sweetSpotScore: calculateSweetSpotScore(state.sliderValues, action.payload),
      };
    }

    case 'SET_CONVERGENCES': {
      return {
        ...state,
        convergences: action.payload,
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case 'RESET_ALL': {
      return initialSweetSpotState;
    }

    default:
      return state;
  }
};
