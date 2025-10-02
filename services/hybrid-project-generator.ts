// services/hybrid-project-generator.ts
import { anthropic, isAnthropicAvailable, CLAUDE_MODEL } from '@/lib/anthropic';
import { ProjectCache } from '@/services/cache/project-cache';
import { HybridProject, HybridProjectSchema } from '@/types/hybrid-project.schema';
import { EMERGING_CAREERS_BATCH3 } from '@/data/emerging-careers-batch3';
import {
  toFormationKeys,
  toAttenduKeys,
  normalizeDurationToSchema,
  normalizeDifficultyToSchema,
  sanitizeProjectTitle,
  generateProjectKey,
} from '@/lib/normalizers';
import type { FormationKey, AttenduKey } from '@/data/controlled-vocab';

const FALLBACK_STEPS = ['Découverte', 'Conception', 'Réalisation', 'Tests'];
const FALLBACK_PROOFS = ['Portfolio', 'Rapport', 'Présentation'];
const FALLBACK_KEYWORDS = ['innovation', 'impact', 'lycée'];

function safeHash(input: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires,import/no-extraneous-dependencies
    const crypto = require('crypto') as typeof import('crypto');
    return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
  } catch {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }
}

function toFormationEnum(values: string[]): FormationKey[] {
  return toFormationKeys(values);
}

function ensureArray<T>(candidate: T[] | undefined, fallback: T[], minLength: number): T[] {
  const base = Array.isArray(candidate) ? candidate : [];
  if (base.length >= minLength) return base.slice(0, Math.max(minLength, base.length));
  const padded = base.slice();
  let index = 0;
  while (padded.length < minLength) {
    padded.push(fallback[index % fallback.length]);
    index += 1;
  }
  return padded.slice(0, Math.max(minLength, padded.length));
}

function pickEmergingCareer(index: number, seeds: typeof EMERGING_CAREERS_BATCH3) {
  return seeds[index % seeds.length] ?? seeds[0];
}

export type EmergingCareerBatch3 = (typeof EMERGING_CAREERS_BATCH3)[number];

type Convergence = { keywords: string[]; strength: number };

type GenerationResult = {
  projects: HybridProject[];
  cached: boolean;
  cacheKey: string;
  source: 'api' | 'fallback' | 'cache';
};

export class HybridProjectGenerator {
  private cache = new ProjectCache<HybridProject[]>();

  async generate(
    userKeywords: Record<string, string[]>,
    convergences: Convergence[],
    seedCareers: EmergingCareerBatch3[],
  ): Promise<GenerationResult> {
    const cacheKey = this.generateCacheKey(userKeywords, convergences, seedCareers);
    const cachedProjects = this.cache.get(cacheKey);
    if (cachedProjects) {
      return { projects: cachedProjects, cached: true, cacheKey, source: 'cache' };
    }

    if (!isAnthropicAvailable()) {
      const projects = this.generateFallback(userKeywords, convergences, seedCareers);
      this.cache.set(cacheKey, projects);
      return { projects, cached: false, cacheKey, source: 'fallback' };
    }

    try {
      const projects = await this.generateViaAPI(userKeywords, convergences, seedCareers);
      this.cache.set(cacheKey, projects);
      return { projects, cached: false, cacheKey, source: 'api' };
    } catch (error) {
      console.error('[HybridProjectGenerator] API error -> fallback', error);
      const projects = this.generateFallback(userKeywords, convergences, seedCareers);
      this.cache.set(cacheKey, projects);
      return { projects, cached: false, cacheKey, source: 'fallback' };
    }
  }

  private async generateViaAPI(
    userKeywords: Record<string, string[]>,
    convergences: Convergence[],
    seedCareers: EmergingCareerBatch3[],
  ): Promise<HybridProject[]> {
    const client = anthropic;
    if (!client) {
      throw new Error('Anthropic client unavailable');
    }

    const prompt = this.buildPrompt(userKeywords, convergences, seedCareers);
    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 3000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const primary = response.content?.[0] as { text?: string } | undefined;
    const payload = primary?.text ?? '';
    return this.parseAndNormalize(payload, seedCareers);
  }

  private buildPrompt(
    userKeywords: Record<string, string[]>,
    convergences: Convergence[],
    seedCareers: EmergingCareerBatch3[],
  ): string {
    const lines: string[] = [];
    lines.push(
      "SYSTEM: Tu es un conseiller d'orientation expert pour lycéens français (16-18 ans).",
    );
    lines.push("NE REPONDS QU'EN JSON VALIDE. Pas de texte avant/après.");
    lines.push('');
    lines.push('CONTRAINTES:');
    lines.push('- EXACTEMENT 5 projets');
    lines.push('- AUCUNE donnée personnelle');
    lines.push('- Mini-projets réalisables en 2-4 semaines');
    lines.push('- Vocabulaire lycéen simple');
    lines.push('- Les clés JSON DOIVENT être:');
    lines.push('  title, punchline, rationale,');
    lines.push('  miniProject: { difficulty, duration, steps, expectedProofs },');
    lines.push('  suggestedFormations, attendusLycee');
    lines.push('');
    lines.push('CONTEXTE:');
    lines.push(`- Passions: ${(userKeywords.passions || []).join(', ') || 'non renseigne'}`);
    lines.push(`- Talents: ${(userKeywords.talents || []).join(', ') || 'non renseigne'}`);
    lines.push(`- Impact: ${(userKeywords.utilite || []).join(', ') || 'non renseigne'}`);
    lines.push(`- Potentiel: ${(userKeywords.viabilite || []).join(', ') || 'non renseigne'}`);
    lines.push(
      `- Convergences: ${
        convergences
          .slice(0, 3)
          .map((c) => c.keywords.join('+'))
          .join(', ') || 'aucune'
      }`,
    );
    lines.push('');
    lines.push("METIERS D'INSPIRATION:");
    seedCareers.forEach((career) => {
      lines.push(`- ${career.title}: ${career.description}`);
    });
    lines.push('');
    lines.push('FORMAT:');
    lines.push('```json');
    lines.push('{');
    lines.push('  "projects": [');
    lines.push('    {');
    lines.push('      "title": "string (10-80)",');
    lines.push('      "punchline": "string (50-150, sans point final)",');
    lines.push('      "rationale": "string (100-300)",');
    lines.push('      "miniProject": {');
    lines.push('        "difficulty": "facile|medium|ambitieux",');
    lines.push('        "duration": "2 semaines|3 semaines|1 mois",');
    lines.push('        "steps": ["etape 1", "etape 2", "etape 3", "etape 4"],');
    lines.push('        "expectedProofs": ["preuve 1", "preuve 2", "preuve 3"]');
    lines.push('      },');
    lines.push('      "suggestedFormations": ["BUT Informatique", "BUT GEII - Génie Électrique"],');
    lines.push('      "attendusLycee": ["créativité", "autonomie", "rigueur"]');
    lines.push('    }');
    lines.push('  ]');
    lines.push('}');
    lines.push('```');
    return lines.join('\n');
  }

  private parseAndNormalize(text: string, seedCareers: EmergingCareerBatch3[]): HybridProject[] {
    const cleaned = text.replace(/```json|```/g, '').trim();
    let raw: unknown;
    try {
      raw = JSON.parse(cleaned);
    } catch (error) {
      console.error('JSON parse failed, fallback used', error);
      return this.generateFallback({}, [], seedCareers);
    }

    const arr = Array.isArray((raw as any)?.projects) ? (raw as any).projects : [];
    const projects: HybridProject[] = [];

    for (const candidate of arr) {
      const normalized = this.remapKeysFromAI(candidate);
      const validated = HybridProjectSchema.safeParse(normalized);
      if (validated.success) {
        projects.push(validated.data);
      }
    }

    while (projects.length < 5) {
      const seed = seedCareers[projects.length % Math.max(seedCareers.length || 1, 1)];
      projects.push(this.genericProject(projects.length, seed));
    }

    return projects.slice(0, 5);
  }

  private remapKeysFromAI(payload: any): Partial<HybridProject> {
    const difficulty = normalizeDifficultyToSchema(String(payload?.miniProject?.difficulty ?? ''));
    const durationNormalized = normalizeDurationToSchema(
      String(payload?.miniProject?.duration ?? ''),
    );

    const formationKeys = toFormationEnum(
      Array.isArray(payload?.suggestedFormations) ? payload.suggestedFormations : [],
    );
    const attendusKeys = toAttenduKeys(
      Array.isArray(payload?.attendusLycee) ? payload.attendusLycee : [],
    );

    const steps = ensureArray(
      Array.isArray(payload?.miniProject?.steps)
        ? payload.miniProject.steps.map((step: unknown) => String(step))
        : [],
      FALLBACK_STEPS,
      3,
    ).slice(0, 6);

    const proofs = ensureArray(
      Array.isArray(payload?.miniProject?.expectedProofs)
        ? payload.miniProject.expectedProofs.map((proof: unknown) => String(proof))
        : [],
      FALLBACK_PROOFS,
      2,
    ).slice(0, 4);

    const fallbackFormations = toFormationEnum(['BUT Informatique', 'BUT MMI']);
    const suggestedFormations: FormationKey[] = ensureArray(
      formationKeys,
      fallbackFormations,
      2,
    ).slice(0, 5);
    const attendusLycee = ensureArray(
      attendusKeys,
      ['créativité', 'autonomie', 'rigueur'],
      2,
    ).slice(0, 6);

    const title = sanitizeProjectTitle(String(payload?.title ?? 'Projet hybride'));
    const punchline =
      String(payload?.punchline ?? '')
        .trim()
        .replace(/\.$/, '')
        .slice(0, 150) || 'Projet hybride pour valoriser tes preuves Parcoursup';
    const rationale =
      String(payload?.rationale ?? '')
        .trim()
        .slice(0, 300) ||
      'Projet hybride aligné avec tes forces et tes envies, avec des preuves concrètes pour ton dossier.';

    const projectId = generateProjectKey(title, suggestedFormations, difficulty);

    return {
      id: projectId,
      title,
      punchline,
      rationale,
      suggestedFormations,
      attendusLycee: attendusLycee as AttenduKey[],
      miniProject: {
        difficulty,
        duration: durationNormalized.duration,
        steps,
        expectedProofs: proofs,
        longRun: durationNormalized.longRun ?? false,
        title: title.slice(0, 60),
        description: rationale.slice(0, 200),
      },
      difficulty,
      alignmentScore: 0.75,
      parcoursupFitScore: 0.8,
    };
  }

  private generateFallback(
    userKeywords: Record<string, string[]>,
    convergences: Convergence[],
    seedCareers: EmergingCareerBatch3[],
  ): HybridProject[] {
    const seeds = seedCareers.length ? seedCareers : EMERGING_CAREERS_BATCH3;
    const projects: HybridProject[] = [];

    for (let i = 0; i < 5; i += 1) {
      const seed = pickEmergingCareer(i, seeds);
      projects.push(this.genericProject(i, seed, userKeywords, convergences));
    }

    return projects;
  }

  private genericProject(
    index: number,
    seed?: EmergingCareerBatch3,
    userKeywords: Record<string, string[]> = {},
    convergences: Convergence[] = [],
  ): HybridProject {
    const fallbackSeed = seed ?? pickEmergingCareer(index, EMERGING_CAREERS_BATCH3);
    const formationCandidates = fallbackSeed.formationsParcoursup ?? fallbackSeed.formations ?? [];
    const attendusCandidates = fallbackSeed.attendusParcoursup ?? fallbackSeed.attendus ?? [];

    const formations: FormationKey[] = ensureArray(
      toFormationEnum(formationCandidates),
      toFormationEnum(['BUT Informatique', 'BUT MMI']),
      2,
    ).slice(0, 5);
    const attendus = ensureArray(
      toAttenduKeys(attendusCandidates),
      ['créativité', 'autonomie', 'rigueur'],
      2,
    ).slice(0, 6);

    const difficulty = (index % 3 === 0 ? 'facile' : index % 3 === 1 ? 'medium' : 'ambitieux') as
      | 'facile'
      | 'medium'
      | 'ambitieux';
    const duration = normalizeDurationToSchema(index % 2 === 0 ? '3 semaines' : '2 semaines');

    const title = sanitizeProjectTitle(`${fallbackSeed.title} - mini-lab`);
    const rationale = (
      fallbackSeed.description ?? 'Projet hybride aligné avec tes centres d intérêt.'
    ).slice(0, 300);
    const punchline = (
      fallbackSeed.pitchEleve ?? 'Je transforme mes intérêts en projet concret pour Parcoursup'
    )
      .replace(/\.$/, '')
      .slice(0, 150);

    const keywords = Object.values(userKeywords || {}).flat();
    const convergenceTags = convergences.flatMap((c) => c.keywords || []);
    const tags = Array.from(new Set([...keywords, ...convergenceTags, ...FALLBACK_KEYWORDS])).slice(
      0,
      10,
    );

    const project: HybridProject = {
      id: generateProjectKey(title, formations, difficulty),
      title,
      punchline,
      rationale,
      suggestedFormations: formations,
      attendusLycee: attendus as AttenduKey[],
      miniProject: {
        difficulty,
        duration: duration.duration,
        steps: FALLBACK_STEPS,
        expectedProofs: FALLBACK_PROOFS,
        longRun: duration.longRun ?? false,
        title: `Mini-projet ${fallbackSeed.title}`.slice(0, 60),
        description: `Un projet court et concret inspiré de ${fallbackSeed.title}.`.slice(0, 200),
      },
      difficulty,
      alignmentScore: 0.75,
      parcoursupFitScore: 0.8,
      seedCareerId: fallbackSeed.id,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const validated = HybridProjectSchema.safeParse(project);
    return validated.success ? validated.data : project;
  }

  private generateCacheKey(
    keywords: Record<string, string[]>,
    convergences: Convergence[],
    careers: EmergingCareerBatch3[],
  ): string {
    const data = JSON.stringify({
      k: Object.values(keywords || {})
        .flat()
        .sort(),
      c: convergences
        .slice(0, 3)
        .map((c) => (c.keywords || []).join('+'))
        .sort(),
      m: careers.map((c) => c.id).sort(),
    });
    return safeHash(data);
  }
}
