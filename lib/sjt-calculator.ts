// lib/sjt-calculator.ts
import type { Profile4D } from '@/types/sjt';
import { QUESTIONS } from '@/data/sjt-questions';

// 1..5 Likert per question id (e.g. { q1: 4, q2: 2, ... })
export type SJTRawAnswers = Record<string, number>;

export function calculateProfile4D(answers: SJTRawAnswers): Profile4D {
  // we expect each question to have a "dimension" pointing to one of the 4 keys
  type Dim = 'plaisir' | 'competence' | 'utilite' | 'viabilite';

  const sums: Record<Dim, { sum: number; count: number }> = {
    plaisir: { sum: 0, count: 0 },
    competence: { sum: 0, count: 0 },
    utilite: { sum: 0, count: 0 },
    viabilite: { sum: 0, count: 0 },
  };

  for (const q of QUESTIONS as Array<{ id: string; dimension?: Dim }>) {
    const v = Number(answers[q.id] ?? 0);
    const dim = q.dimension as Dim | undefined;
    if (!dim || !Number.isFinite(v)) continue;
    sums[dim].sum += v; // v is 1..5
    sums[dim].count += 1;
  }

  const to01 = (sum: number, count: number) => {
    if (!count) return 0.6; // neutral default
    const avg = sum / count; // 1..5
    return Math.max(0, Math.min(1, (avg - 1) / 4)); // -> 0..1
  };

  return {
    plaisir: to01(sums.plaisir.sum, sums.plaisir.count),
    competence: to01(sums.competence.sum, sums.competence.count),
    utilite: to01(sums.utilite.sum, sums.utilite.count),
    viabilite: to01(sums.viabilite.sum, sums.viabilite.count),
    confidence_avg: 0.7,
  };
}
