import { describe, it, expect } from 'vitest';
import { arrayEqual, shallowEqual } from '../__utils__/equality';

// On décrit un groupe de tests pour la fonction "shallowEqual"
describe('shallowEqual', () => {
  // Chaque "it" est un scénario de test spécifique
  it('retourne true pour la même référence', () => {
    const a = { x: 1, y: 2 };
    // On s'attend à ce que shallowEqual(a, a) soit vrai
    expect(shallowEqual(a, a)).toBe(true);
  });

  it('retourne true pour deux objets différents mais identiques', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 1, y: 2 };
    expect(shallowEqual(a, b)).toBe(true);
  });

  it('retourne false si une valeur diffère', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 1, y: 3 };
    expect(shallowEqual(a, b)).toBe(false);
  });

  it('retourne false si le nombre de clés diffère', () => {
    const a = { x: 1 };
    const b = { x: 1, y: 2 };
    expect(shallowEqual(a, b)).toBe(false);
  });
});

// On décrit un autre groupe de tests pour "arrayEqual"
describe('arrayEqual', () => {
  it('retourne true pour la même référence', () => {
    const a = [1, 2, 3];
    expect(arrayEqual(a, a)).toBe(true);
  });

  it('retourne true pour des tableaux identiques', () => {
    expect(arrayEqual([1, 2], [1, 2])).toBe(true);
  });

  it("retourne false si l'ordre diffère", () => {
    expect(arrayEqual([1, 2], [2, 1])).toBe(false);
  });

  it('retourne false si la longueur diffère', () => {
    expect(arrayEqual([1], [1, 2])).toBe(false);
  });
});
