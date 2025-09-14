// lib/matching.test.ts
import { describe, it, expect } from 'vitest';
import { calculateCompatibility, sortFormations } from './matching';
import type { FormationStatic } from '@/types/formation';
import type { Profile4D } from '@/types/sjt';

const profile: Profile4D = {
  plaisir: 0.8,
  competence: 0.7,
  utilite: 0.6,
  viabilite: 0.5,
  confidence_avg: 0.8,
};

const formation: FormationStatic = {
  id: 'test1',
  nom: 'Test Formation',
  type: 'BUT',
  duree: 3,
  etablissement: 'IUT',
  ville: 'Paris',
  attendus: [],
  plaisir_tags: ['projet'],
  competence_tags: ['maths'],
  utilite_tags: ['emploi'],
  viabilite_data: { taux_acces: 0.7, cout: 'gratuit' },
  confidence: 0.9,
};

describe('matching', () => {
  it('calculateCompatibility returns a number between 0 and 1', () => {
    const score = calculateCompatibility(profile, formation);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('sortFormations returns sorted array', () => {
    const list = sortFormations(profile, [formation]);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('test1');
  });
});
