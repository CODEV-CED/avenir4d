import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import SweetSpotLabStep from '@/components/SweetSpotLabStep';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import { TooltipProvider } from '@/components/UI/tooltip';

// Basic smoke test to ensure the Lab UI renders

describe('SweetSpotLabStep smoke', () => {
  it('renders key sections without crashing', () => {
    // Ensure store exists/initializes
    expect(useSweetSpotStore.getState).toBeTruthy();

    // Stub fetchConvergences to avoid network calls and set stable state
    useSweetSpotStore.setState({
      isLoading: false,
      convergences: [],
      sweetSpotScore: 0.42,
      baselineUsed: false,
      fetchConvergences: async () => {},
    } as any);
    render(
      <TooltipProvider delayDuration={0}>
        <SweetSpotLabStep />
      </TooltipProvider>,
    );

    expect(screen.getByText(/Sweet Spot Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/Ajustez vos priorités/i)).toBeInTheDocument();
    expect(screen.getByText(/Réinitialiser/i)).toBeInTheDocument();
  });
});
