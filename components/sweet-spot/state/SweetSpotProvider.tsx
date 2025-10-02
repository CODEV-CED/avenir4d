// components/sweet-spot/state/SweetSpotProvider.tsx

import React, { createContext, useReducer, ReactNode, useMemo } from 'react';
import { sweetSpotReducer } from './sweetSpotReducer';
import { uiReducer } from './uiReducer';
import { sweetSpotActions, uiActions } from './actions';
import type {
  SweetSpotState,
  UIContextState,
  DimKey,
  TabKey,
  FilterMode,
  SliderValues,
  UserKeywords,
} from '@sweet-spot/types';
import { initialSweetSpotState, initialUIContextState } from '@sweet-spot/types';

interface SweetSpotContextType {
  state: SweetSpotState;
  uiState: UIContextState;
  actions: {
    // SweetSpot actions
    setSliderValue: (dim: DimKey, value: number) => void;
    setSliderValues: (values: SliderValues) => void;
    addKeyword: (dim: DimKey, keyword: string) => void;
    removeKeyword: (dim: DimKey, keyword: string) => void;
    setKeywords: (keywords: UserKeywords) => void;
    addTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    setFilterMode: (mode: FilterMode) => void;
    setConvergences: (convergences: any[]) => void;
    setLoading: (loading: boolean) => void;
    resetAll: () => void;

    // UI actions
    setActiveTab: (tab: TabKey) => void;
    setKeywordInput: (input: string) => void;
    setError: (error: string | null) => void;
    setSuccess: (success: boolean) => void;
    setOnboarding: (show: boolean, step: number) => void;
    setMobile: (isMobile: boolean) => void;
    setScreenReaderMessage: (message: string) => void;
    resetMessages: () => void;
  };
}

export const SweetSpotContext = createContext<SweetSpotContextType | undefined>(undefined);

interface SweetSpotProviderProps {
  children: ReactNode;
  initialState?: Partial<SweetSpotState>;
  initialUIState?: Partial<UIContextState>;
}

export const SweetSpotProvider: React.FC<SweetSpotProviderProps> = ({
  children,
  initialState = {},
  initialUIState: initialUI = {}, // renamed initialUI to avoid confusion
}) => {
  const [state, dispatch] = useReducer(sweetSpotReducer, {
    ...initialSweetSpotState,
    ...initialState,
  });

  const [uiState, uiDispatch] = useReducer(
    uiReducer,
    { ...initialUIContextState, ...initialUI }, // merge provided overrides with defaults
  );

  const actions = useMemo(
    () => ({
      // SweetSpot actions
      setSliderValue: (dim: DimKey, value: number) => {
        dispatch(sweetSpotActions.setSliderValue(dim, value));
      },
      setSliderValues: (values: SliderValues) => {
        dispatch(sweetSpotActions.setSliderValues(values));
      },
      addKeyword: (dim: DimKey, keyword: string) => {
        dispatch(sweetSpotActions.addKeyword(dim, keyword));
      },
      removeKeyword: (dim: DimKey, keyword: string) => {
        dispatch(sweetSpotActions.removeKeyword(dim, keyword));
      },
      setKeywords: (keywords: UserKeywords) => {
        dispatch(sweetSpotActions.setKeywords(keywords));
      },
      addTag: (tag: string) => {
        dispatch(sweetSpotActions.addTag(tag));
      },
      removeTag: (tag: string) => {
        dispatch(sweetSpotActions.removeTag(tag));
      },
      setFilterMode: (mode: FilterMode) => {
        dispatch(sweetSpotActions.setFilterMode(mode));
      },
      setConvergences: (convergences: any[]) => {
        dispatch(sweetSpotActions.setConvergences(convergences));
      },
      setLoading: (loading: boolean) => {
        dispatch(sweetSpotActions.setLoading(loading));
      },
      resetAll: () => {
        dispatch(sweetSpotActions.resetAll());
        uiDispatch(uiActions.resetMessages());
      },

      // UI actions
      setActiveTab: (tab: TabKey) => {
        uiDispatch(uiActions.setActiveTab(tab));
      },
      setKeywordInput: (input: string) => {
        uiDispatch(uiActions.setKeywordInput(input));
      },
      setError: (error: string | null) => {
        uiDispatch(uiActions.setError(error));
      },
      setSuccess: (success: boolean) => {
        uiDispatch(uiActions.setSuccess(success));
      },
      setOnboarding: (show: boolean, step: number) => {
        uiDispatch(uiActions.setOnboarding(show, step));
      },
      setMobile: (isMobile: boolean) => {
        uiDispatch(uiActions.setMobile(isMobile));
      },
      setScreenReaderMessage: (message: string) => {
        uiDispatch({ type: 'SET_SCREEN_READER_MESSAGE', payload: message });
      },
      resetMessages: () => {
        uiDispatch(uiActions.resetMessages());
      },
    }),
    [],
  );

  const value = useMemo(
    () => ({
      state,
      uiState,
      actions,
    }),
    [state, uiState, actions],
  );

  return <SweetSpotContext.Provider value={value}>{children}</SweetSpotContext.Provider>;
};







