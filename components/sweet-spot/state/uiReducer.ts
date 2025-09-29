// components/sweet-spot/state/uiReducer.ts

import type { UIContextState, UIAction } from '@sweet-spot/types';
import { initialUIContextState } from '@sweet-spot/types';

export const uiReducer = (state: UIContextState = initialUIContextState, action: UIAction): UIContextState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_KEYWORD_INPUT':
      return { ...state, keywordInput: action.payload };

    case 'SET_ERROR':
      return { ...state, errorMsg: action.payload, successMsg: false };

    case 'SET_SUCCESS':
      return { ...state, successMsg: action.payload, errorMsg: null };

    case 'SET_ONBOARDING':
      return {
        ...state,
        showOnboarding: action.payload.show,
        onboardingStep: action.payload.step,
      };

    case 'SET_MOBILE':
      return { ...state, isMobile: action.payload };

    case 'SET_SCREEN_READER_MESSAGE':
      return { ...state, screenReaderMessage: action.payload };

    case 'RESET_MESSAGES':
      return { ...state, errorMsg: null, successMsg: false };

    default:
      return state;
  }
};
