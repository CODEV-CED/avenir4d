// B3 — types/hybrid-project.schema.ts
import { z } from 'zod';
import { FORMATION_LABELS, ATTENDU_LABELS } from '@/data/parcoursup-vocabulary';

// ===============================
// Énums alignées avec l'UI
// ===============================
const DifficultyUIEnum = z.enum(['facile', 'medium', 'ambitieux']);
const DurationUIEnum = z.enum(['2 semaines', '3 semaines', '4 semaines', '1 mois']);
const FormationEnum = z.union(
  (Object.keys(FORMATION_LABELS) as string[]).map((k) => z.literal(k)) as [
    z.ZodLiteral<string>,
    ...z.ZodLiteral<string>[],
  ],
);
const AttenduEnum = z.union(
  (Object.keys(ATTENDU_LABELS) as string[]).map((k) => z.literal(k)) as [
    z.ZodLiteral<string>,
    ...z.ZodLiteral<string>[],
  ],
);
// ===============================
// (Optionnels) énums avancés
// ===============================
const DifficultyModelEnum = z.enum(['accessible', 'modere', 'ambitieux']).optional();
const DurationModelEnum = z
  .enum(['2 semaines', '3 semaines', '1 mois', '2 mois', '3 mois'])
  .optional();
const ProofTypeEnum = z.enum(['projet', 'experience', 'cours', 'engagement']).optional();
const AlignmentScore = z.number().min(0).max(1);

// ===============================
// Sous-schéma MiniProject (UI)
// ===============================
export const MiniProjectUISchema = z.object({
  // requis par l'UI actuelle
  difficulty: DifficultyUIEnum,
  duration: DurationUIEnum,
  steps: z.array(z.string().min(3).max(100)).min(3).max(6),
  expectedProofs: z.array(z.string().min(3).max(80)).min(2).max(4),

  // bonus: badge "long" si la source était > 1 mois
  longRun: z.boolean().optional().default(false),

  // champs libres (UI ne les consomme pas forcément)
  title: z.string().min(5).max(60).optional(),
  description: z.string().min(20).max(200).optional(),

  // pour compat future: si le générateur renvoie les énums "modèle"
  // on les accepte mais on ne les impose pas à l'UI
  _modelDifficulty: DifficultyModelEnum,
  _modelDuration: DurationModelEnum,
});

// ===============================
// (Optionnel) schémas avancés
// ===============================
const ParcoursupProofSchema = z
  .object({
    type: ProofTypeEnum,
    titre: z.string().min(5).max(80),
    description: z.string().min(20).max(250),
    alignement: AlignmentScore.optional(),
    duree: DurationModelEnum,
    tags: z.array(z.string().max(20)).max(5).optional(),
  })
  .optional();

const ProjectStepSchema = z
  .object({
    ordre: z.number().int().min(1).max(10),
    titre: z.string().min(3).max(50),
    actions: z.array(z.string().max(60)).min(2).max(5),
    duree: DurationModelEnum.default('2 semaines'),
    milestone: z.string().max(100).optional(),
  })
  .optional();

// ===============================
// Schéma principal aligné UI
// ===============================
export const HybridProjectSchema = z.object({
  // Identité
  id: z
    .string()
    .regex(/^[a-z0-9_-]+$/)
    .optional(),
  title: z
    .string()
    .min(10)
    .max(80)
    .transform((s) => s.trim().replace(/\s+/g, ' ')),
  punchline: z
    .string()
    .min(20) // UI affichait 20–150, garde souple (tu peux remettre 50–150 si tu veux)
    .max(150)
    .transform((s) => s.trim().replace(/\.$/, '')),
  rationale: z.string().min(50).max(300),

  // === Mapping Parcoursup — noms EXACTS attendus par l'UI ===
  suggestedFormations: z.array(FormationEnum).min(2).max(5),
  attendusLycee: z.array(AttenduEnum).min(2).max(6),

  // === Mini-projet UI ===
  miniProject: MiniProjectUISchema,

  // === Champs avancés (optionnels) — non requis pour l'UI ===
  preuves: z.array(ParcoursupProofSchema).max(4).optional(),
  etapes: z.array(ProjectStepSchema).max(6).optional(),

  // Métadonnées
  difficulty: DifficultyUIEnum.default('medium'), // score global de "niveau"
  alignmentScore: AlignmentScore.optional(),
  parcoursupFitScore: AlignmentScore.optional(),
  seedCareerId: z.string().optional(),
  tags: z.array(z.string().max(20)).max(10).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type HybridProject = z.infer<typeof HybridProjectSchema>;

// ===============================
// Schéma réponse API — aligné UI
// ===============================
export const HybridProjectGenerationResponseSchema = z.object({
  projects: z.array(HybridProjectSchema).length(5),
  metadata: z
    .object({
      cached: z.boolean(),
      cacheKey: z.string(),
      source: z.enum(['api', 'cache', 'fallback']).default('api'),
      generationTime: z.number().optional(),
      model: z.string().optional(),
    })
    .default({ cached: false, cacheKey: 'n/a', source: 'api' }),
  debug: z
    .object({
      promptTokens: z.number().optional(),
      completionTokens: z.number().optional(),
      totalCost: z.number().optional(),
    })
    .optional(),
});

export type HybridProjectGenerationResponse = z.infer<typeof HybridProjectGenerationResponseSchema>;

// ===============================
// Helpers validation
// ===============================
export function validateHybridProject(input: unknown) {
  const parsed = HybridProjectSchema.safeParse(input);
  return parsed.success
    ? { success: true, data: parsed.data }
    : { success: false, errors: parsed.error };
}

export function validateGenerationResponse(input: unknown) {
  const parsed = HybridProjectGenerationResponseSchema.safeParse(input);
  return parsed.success
    ? { success: true, data: parsed.data }
    : { success: false, errors: parsed.error };
}
