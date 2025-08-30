// /lib/telemetry.ts — stub no-op pour Batch 0
export const telemetry = {
  view: (_id?: string) => {},
  click: (_id?: string) => {},
  feedbackUp: (_id?: string) => {},
  feedbackDown: (_id?: string) => {},
  cache: (_outcome?: 'hit' | 'miss') => {},
};

export const perf = {
  sortingTime: (_ms?: number) => {},
  renderTime: (_ms?: number) => {},
};
