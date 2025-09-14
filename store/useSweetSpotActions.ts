// store/useSweetSpotActions.ts (legacy stub)
// This file is kept to avoid breaking legacy imports. It no longer
// connects to the store and returns no-op actions.

export const useSweetSpotActions = () => {
  const noop = () => {};
  return {
    setProfile: noop,
    setQual: noop,
    setLoading: noop,
    setError: noop,
    reset: noop,
  } as const;
};
