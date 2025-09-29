// components/sweet-spot/types/ui.ts

import type { TabKey } from './dimensions';

export interface UIContextState {
  activeTab: TabKey;
  keywordInput: string;
  errorMsg: string | null;
  successMsg: boolean;
  showOnboarding: boolean;
  onboardingStep: number;
  isMobile: boolean;
  screenReaderMessage: string;
}

export type UIAction =
  | { type: 'SET_ACTIVE_TAB'; payload: TabKey }
  | { type: 'SET_KEYWORD_INPUT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: boolean }
  | { type: 'SET_ONBOARDING'; payload: { show: boolean; step: number } }
  | { type: 'SET_MOBILE'; payload: boolean }
  | { type: 'SET_SCREEN_READER_MESSAGE'; payload: string }
  | { type: 'RESET_MESSAGES' };

export const initialUIContextState: UIContextState = {
  activeTab: 'passions',
  keywordInput: '',
  errorMsg: null,
  successMsg: false,
  showOnboarding: false,
  onboardingStep: 0,
  isMobile: false,
  screenReaderMessage: '',
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
