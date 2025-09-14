import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock next/navigation to avoid router usage blowing up in tests
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock toast to avoid DOM noise
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

// Import real data and component
import { QCM } from '@/data/sjt-questions-advanced';
import SJTQuiz from './SJTQuiz';

// Ensure a clean store between tests (optional depending on zustand impl)
beforeEach(() => {
  // Reset localStorage and performance entries guards
  localStorage.clear();
});

describe('SJTQuiz smoke', () => {
  it('renders first scenario text and its options', async () => {
    // Sanity of fixture
    expect(QCM.length).toBeGreaterThan(0);
    const first = QCM[0];
    expect(first.scenario).toBeTruthy();
    expect(first.options.length).toBeGreaterThan(1);

    render(<SJTQuiz />);

    // Scenario text should map to QcmStep title
    expect(await screen.findByText(first.scenario)).toBeInTheDocument();

    // Each option.text should map to option label
    for (const opt of first.options) {
      expect(screen.getByText(opt.text)).toBeInTheDocument();
    }
  });
});
