import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import HeroVisual from '@/components/marketing/HeroVisual';

describe('HeroVisual', () => {
  it('renders the wrapper', () => {
    render(<HeroVisual />);
    expect(screen.getByTestId('herovisual-wrapper')).toBeInTheDocument();
  });

  it('shows pulsing rings when score > 0.7', () => {
    render(<HeroVisual score={0.75} />);
    expect(screen.getByTestId('herovisual-pulse-0')).toBeInTheDocument();
    expect(screen.getByTestId('herovisual-pulse-1')).toBeInTheDocument();
  });
});
