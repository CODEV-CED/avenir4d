import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
// Disable Framer Motion animations for stable tests
vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <>{children}</>,
  motion: { div: (props: any) => <div {...props} /> },
}));
import AutoAdjustBanner from '@/components/AutoAdjustBanner';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';

describe('AutoAdjustBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSweetSpotStore.setState({ autoAdjust: null });
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders message and auto-dismisses after ~1.2s', () => {
    render(<AutoAdjustBanner />);

    act(() => {
      useSweetSpotStore.setState({
        autoAdjust: {
          at: Date.now(),
          type: 'gap',
          adjusted: { key: 'passions', from: 0.2, to: 0.6 },
        },
      });
    });

    expect(screen.getByRole('status').textContent).toContain('Écart limité à 0.40');

    act(() => {
      vi.advanceTimersByTime(1300);
    });

    expect(screen.queryByRole('status')).toBeNull();
  });
});
