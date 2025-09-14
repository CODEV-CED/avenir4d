// lib/feedback.test.ts
import { describe, it, expect } from 'vitest';
import { applyFeedbackBoost } from './feedback';

describe('feedback', () => {
  it('boost +5%', () => {
    expect(applyFeedbackBoost(0.5, 'id', { id: 1 })).toBeCloseTo(0.525);
  });
  it('penalise -5%', () => {
    expect(applyFeedbackBoost(0.5, 'id', { id: -1 })).toBeCloseTo(0.475);
  });
});
