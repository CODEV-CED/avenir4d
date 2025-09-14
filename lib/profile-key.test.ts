import { describe, it, expect } from 'vitest';
import { profileKey } from './profile-key';

describe('profileKey', () => {
  it('produit une clé déterministe et concise', () => {
    const k1 = profileKey({
      plaisir: 0.8,
      competence: 0.65,
      utilite: 0.72,
      viabilite: 0.58,
      confidence_avg: 0.7,
    });
    const k2 = profileKey({
      plaisir: 0.8,
      competence: 0.65,
      utilite: 0.72,
      viabilite: 0.58,
      confidence_avg: 0.7,
    });
    expect(k1).toBe(k2);
    expect(k1.startsWith('a4d:voeux:')).toBe(true);
  });

  it('diffère quand le profil change', () => {
    const a = profileKey({
      plaisir: 0.8,
      competence: 0.65,
      utilite: 0.72,
      viabilite: 0.58,
      confidence_avg: 0.7,
    });
    const b = profileKey({
      plaisir: 0.81,
      competence: 0.65,
      utilite: 0.72,
      viabilite: 0.58,
      confidence_avg: 0.7,
    });
    expect(a).not.toBe(b);
  });
});
