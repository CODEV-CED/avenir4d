import { z } from 'zod';

// ✅ tolère les nombres envoyés en string ("0.7") via z.coerce.number()
const zScore01 = z.coerce.number().min(0).max(1);

export const zChoice = z.object({
  questionId: z.string().min(1),
  // ✅ réponse numérique OU textuelle (selon ton SJT)
  answer: z.union([z.string().min(1), z.coerce.number()]),
});

export const zProfile4D = z.object({
  plaisir: zScore01,
  competence: zScore01,
  utilite: zScore01,
  viabilite: zScore01,
  confidence_avg: zScore01.optional(),
  version: z.coerce.number().optional(),
});

export const zQual = z.object({
  dimancheMatin: z.string().min(1),
  algoPersonnel: z.string().min(1),
  talentReconnu: z.string().min(1),
  indignationMax: z.string().min(1),
});

const zKeywordsRaw = z.record(z.string(), z.array(z.string()));
// ✅ garantit la présence des 4 clés attendues (même vides)
export const zKeywords = zKeywordsRaw.default({}).transform((kw) => ({
  passions: kw.passions ?? [],
  talents: kw.talents ?? [],
  utilite: kw.utilite ?? [],
  viabilite: kw.viabilite ?? [],
}));

export const zSJTSubmit = z
  .object({
    choices: z.array(zChoice).min(1, 'Au moins 1 réponse est requise'),
    profile4d: zProfile4D,
    qual: zQual,
    keywords: zKeywords.optional(),
    surveyVersion: z.string().default('sjt_v2'),
    idempotencyKey: z.string().optional(),
  })
  .strict();
