// lib/utils/assertHasChoices.ts
import type { SJTChoice } from '@/lib/sweetspot/types';

/**
 * Assure que params.rawChoices existe et contient au moins `min` éléments.
 * Affine le type (type guard) pour éliminer le undefined ensuite.
 */
export function assertHasChoices<T extends { rawChoices?: SJTChoice[] }>(
  params: T,
  min = 1,
): asserts params is T & { rawChoices: SJTChoice[] } {
  if (!Array.isArray((params as any).rawChoices)) {
    throw new Error('Aucun choix fourni - questionnaire incomplet (aucun tableau)');
  }
  const len = (params as any).rawChoices.length;
  if (len < min) {
    throw new Error(`Aucun choix fourni - questionnaire incomplet (len=${len}, attendu>=${min})`);
  }
}

/** Transforme les choix internes → payload API (fields camelCase attendus). */
export function toSubmitChoices(choices: SJTChoice[]) {
  return choices.map((c) => {
    const confidence = (c as any).confidence;
    return {
      questionId: c.questionId,
      optionId: c.optionId,
      ...(typeof confidence === 'number' ? { confidence } : {}),
    };
  });
}
