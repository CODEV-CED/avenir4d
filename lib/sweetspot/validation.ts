import { z } from 'zod';
import { DIMS } from './types';

const dimEnum = z.enum(DIMS);

// Normalisation texte avec validation APRES normalisation
const normalizedText = z
  .string()
  .transform((s) => s.normalize('NFKC'))
  .transform((s) => s.trim().replace(/\s+/g, ' '))
  .pipe(z.string().min(10).max(2000));

const keywordArray = z
  .array(z.string().trim().min(1).max(100))
  .max(20)
  .transform((arr) => {
    const normalized = arr
      .map((k) => k.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('fr'))
      .filter(Boolean);
    return Array.from(new Set(normalized));
  });

export const zSJTSubmit = z
  .object({
    choices: z
      .array(
        z
          .object({
            questionId: z.string().min(1).max(50),
            optionId: z.string().min(1).max(50),
            confidence: z.number().int().min(1).max(5).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(50)
      .superRefine((choices, ctx) => {
        const seen = new Set<string>();
        for (const c of choices) {
          if (seen.has(c.questionId)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Questions dupliquées détectées: ${c.questionId}`,
            });
            break;
          }
          seen.add(c.questionId);
        }
      }),

    qual: z
      .object({
        dimancheMatin: normalizedText,
        algoPersonnel: normalizedText,
        talentReconnu: normalizedText,
        indignationMax: normalizedText,
      })
      .strict(),

    profile4d: z
      .object({
        plaisir: z.number().min(0).max(1),
        competence: z.number().min(0).max(1),
        utilite: z.number().min(0).max(1),
        viabilite: z.number().min(0).max(1),
        confidence_avg: z.number().min(1).max(5),
        version: z.literal(1).optional(),
        source: z.enum(['sjt_v2', 'import', 'manual']).optional(),
      })
      .strict(),

    keywords: z
      .object({
        plaisir: keywordArray.optional(),
        competence: keywordArray.optional(),
        utilite: keywordArray.optional(),
        viabilite: keywordArray.optional(),
      })
      .strict()
      .optional(),

    surveyVersion: z.literal('sjt_v2').optional(),
  })
  .strict();

export type ValidatedSJTSubmit = z.infer<typeof zSJTSubmit>;

import { NextResponse } from 'next/server';
import type { ZodError, ZodIssue } from 'zod';

type FieldLabels = Record<string, string>;

type ZodIssueDTO = {
  field: string;
  label: string;
  code: ZodIssue['code'];
  message: string;
  path: (string | number)[];
};

const joinPath = (path: (string | number)[]) =>
  path
    .map((p) => (typeof p === 'number' ? `[${p}]` : (p as string)))
    .reduce<string>((acc, seg, i) => acc + (i && !seg.startsWith('[') ? '.' : '') + seg, '');

const defaultLabel = (key: string) => key.split('.').slice(-1)[0];

function translateIssue(issue: ZodIssue): string {
  switch (issue.code) {
    case 'too_small': {
      // Zod v3: .type n'existe plus, il faut tester .minimum et .inclusive
      if ('minimum' in issue && issue.path) {
        if ((issue as any).type === 'string' || (issue as any).validation === 'string')
          return `Au moins ${issue.minimum} caractères requis.`;
        if ((issue as any).type === 'array' || (issue as any).validation === 'array')
          return `Au moins ${issue.minimum} éléments requis.`;
        if ((issue as any).type === 'number' || (issue as any).validation === 'number')
          return `La valeur doit être ≥ ${issue.minimum}.`;
      }
      return 'Valeur trop petite.';
    }
    case 'too_big': {
      if ('maximum' in issue && issue.path) {
        if ((issue as any).type === 'string' || (issue as any).validation === 'string')
          return `Maximum ${issue.maximum} caractères autorisés.`;
        if ((issue as any).type === 'array' || (issue as any).validation === 'array')
          return `Maximum ${issue.maximum} éléments autorisés.`;
        if ((issue as any).type === 'number' || (issue as any).validation === 'number')
          return `La valeur doit être ≤ ${issue.maximum}.`;
      }
      return 'Valeur trop grande.';
    }
    case 'invalid_type': {
      // .received et .expected existent sur invalid_type
      if ((issue as any).received === 'undefined') return 'Champ requis.';
      return `Type invalide (attendu ${(issue as any).expected}).`;
    }
    case 'custom':
      return issue.message || 'Valeur invalide.';
    case 'unrecognized_keys':
      return 'Champs non autorisés.';
    case 'invalid_format':
      return 'Format invalide.';
    case 'not_multiple_of':
      return 'La valeur doit être un multiple autorisé.';
    case 'invalid_union':
      return 'Aucune des valeurs proposées n’est valide.';
    case 'invalid_key':
      return 'Clé non valide.';
    case 'invalid_element':
      return 'Élément non valide.';
    case 'invalid_value':
      return 'Valeur non valide.';
    default:
      return 'Donnée invalide.';
  }
}

export function formatZodIssues(
  error: ZodError,
  opts?: { fieldLabels?: FieldLabels },
): ZodIssueDTO[] {
  const labels = opts?.fieldLabels ?? {};
  return error.issues.map((iss) => {
    // Cast path to (string|number)[] for compatibility
    const path = iss.path as (string | number)[];
    const fieldKey = joinPath(path);
    const label = labels[fieldKey] ?? labels[path[0] as string] ?? defaultLabel(fieldKey);
    return {
      field: fieldKey,
      label,
      code: iss.code,
      message: translateIssue(iss),
      path,
    };
  });
}

export function zodErrorResponse(
  error: ZodError,
  opts?: {
    fieldLabels?: FieldLabels;
    status?: 400 | 422;
    topMessage?: string;
  },
) {
  const details = formatZodIssues(error, { fieldLabels: opts?.fieldLabels });
  const status = opts?.status ?? 400;
  const topMessage = opts?.topMessage ?? 'Données invalides';

  return NextResponse.json({ ok: false, error: topMessage, details }, { status });
}

export const errorMessages = {
  'choices.duplicated': 'Certaines questions ont été répondues plusieurs fois',
  'qual.too_short': 'Les réponses qualitatives doivent contenir au moins 10 caractères',
  'profile4d.out_of_range': 'Les scores du profil doivent être entre 0 et 1',
  'confidence.invalid_scale': 'La confiance doit être entre 1 et 5',
  unknown_fields: 'Des champs non autorisés ont été détectés',
} as const;
