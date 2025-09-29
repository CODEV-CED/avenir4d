// components/sweet-spot/types/index.ts

// ---- dimensions ----
export type {
  UIKey,
  DimKey,
  TabKey,
  SliderValues,
  UserKeywords,
  SliderPercentages,
  FilterMode,
  CirclePosition,
  RGB,
  Circle,
} from './dimensions';
export { uiToEngine } from './dimensions';

// ---- convergences ----
export type { EngineConvergence, UIConvergence } from './convergences';

// ---- state ----
export type { SweetSpotState, PersistedData } from './state';
export { initialSweetSpotState } from './state';

// ---- ui ----
export type { UIContextState, UIAction } from './ui';
export { initialUIContextState } from './ui';

// ---- ia ----
export type { Project, SweetSpotResult } from './ia';
