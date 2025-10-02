//app/api/sweet-spot/projects/route.ts
import { NextResponse } from 'next/server';
import {
  HybridProjectGenerationResponseSchema,
  HybridProjectSchema,
  type HybridProject,
} from '@/types/hybrid-project.schema';
import {
  generateProjectKey,
  normalizeDifficultyToSchema,
  normalizeDurationToSchema,
  sanitizeProjectTitle,
  toFormationKeys,
  toAttenduKeys,
} from '@/lib/normalizers';
import type { EmergingCareerBatch3 } from '@/data/emerging-careers-batch3';
import type { FormationKey, AttenduKey } from '@/data/controlled-vocab';

type Keywords4D = {
  passions: string[];
  talents: string[];
  utilite: string[];
  viabilite: string[];
};

type IncomingConvergence = {
  keywords: string[];
  strength: number;
};

type IncomingPayload = {
  profile?: { keywords4D?: Partial<Keywords4D> };
  convergences?: IncomingConvergence[];
  seedCareers?: EmergingCareerBatch3[];
};

const DEFAULT_SEED_FORMATIONS: FormationKey[] = [
  'BUT_MMI',
  'BTS_COM',
  'LICENCE_INFO_COM',
  'BACHELOR_DESIGN_GRAPH',
];
const DEFAULT_SEED_ATTENDUS: AttenduKey[] = [
  'creativite',
  'organisation',
  'sens_relationnel',
  'esprit_entrepreneurial',
];
const DEFAULT_SEED_MINI_PROJECTS = [
  {
    title: 'Atelier IA applique au lycee',
    description:
      'Programme de trois semaines pour initier une classe aux outils IA et produire un prototype utile.',
    duration: '3 semaines',
    difficulty: 'medium',
    competences: ['animation', 'design thinking', 'prototypage', 'communication'],
    livrables: ['Prototype fonctionnel', 'Journal de bord', 'Restitution publique'],
    long_run: false,
  },
];

const DEFAULT_SEED: EmergingCareerBatch3 = {
  id: 'creative-ai-mentor',
  title: 'Mentor IA Creative',
  category: 'tech_creative',
  emoji: '[robot]',
  description:
    'Projet mixant design, IA generative et accompagnement des lyceens pour creer des solutions locales.',
  formations: [...DEFAULT_SEED_FORMATIONS],
  formationsParcoursup: [...DEFAULT_SEED_FORMATIONS],
  attendus: [...DEFAULT_SEED_ATTENDUS],
  attendusParcoursup: [...DEFAULT_SEED_ATTENDUS],
  prerequisLycee: ['NSI', 'Arts', 'SES'],
  miniProjets: DEFAULT_SEED_MINI_PROJECTS.map((mini) => ({ ...mini })),
  miniProjetsLycee: DEFAULT_SEED_MINI_PROJECTS.map((mini) => ({ ...mini })),
  pitchEleve:
    'Je combine creativite et technologies pour resoudre des problemes concrets du quotidien avec l IA.',
  parcoursupReady: true,
  salaireDebut: '30k-35k eur',
  horizonMetier: '2025-2028',
  entreprisesCibles: ['Collectifs EdTech', 'Startups IA locale', 'Fablabs'],
};

const FALLBACK_STEPS = [
  'Explorer les besoins concrets',
  'Co concevoir une solution avec les utilisateurs',
  'Prototyper et tester en conditions reelles',
  'Mesurer les preuves impact',
];

const FALLBACK_PROOFS = ['Prototype documente', 'Journal de bord detaille', 'Presentation finale'];

function safeArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value): value is string => value.length > 0);
}

function buildKeywords(bodyKeywords?: Partial<Keywords4D>): Keywords4D {
  const base: Keywords4D = { passions: [], talents: [], utilite: [], viabilite: [] };
  if (!bodyKeywords) return base;
  return {
    passions: safeArray(bodyKeywords.passions),
    talents: safeArray(bodyKeywords.talents),
    utilite: safeArray(bodyKeywords.utilite),
    viabilite: safeArray(bodyKeywords.viabilite),
  };
}

function safeConvergences(items: IncomingConvergence[] | undefined): IncomingConvergence[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => ({
      keywords: safeArray(item?.keywords),
      strength: typeof item?.strength === 'number' ? Math.min(Math.max(item.strength, 0), 1) : 0.6,
    }))
    .filter((item) => item.keywords.length > 0);
}

function ensureSeedCareers(seeds: EmergingCareerBatch3[] | undefined): EmergingCareerBatch3[] {
  if (!Array.isArray(seeds) || seeds.length === 0) return [DEFAULT_SEED];
  return seeds.filter((seed) => !!seed && typeof seed === 'object');
}

function formatSentence(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function padList(list: string[], fallback: string[], minimum: number): string[] {
  const clone = [...list];
  let index = 0;
  while (clone.length < minimum) {
    clone.push(fallback[index % fallback.length]);
    index += 1;
  }
  return clone;
}

function pickKeyword(keywords: string[], index: number, fallback: string): string {
  if (!keywords.length) return fallback;
  return keywords[index % keywords.length];
}

function buildProject(
  seed: EmergingCareerBatch3,
  index: number,
  baseKeywords: string[],
  convergences: IncomingConvergence[],
): ReturnType<typeof HybridProjectSchema.parse> {
  const topKeyword = pickKeyword(baseKeywords, index, seed.category.replace(/_/g, ' '));
  const pairingKeyword = pickKeyword(baseKeywords.slice().reverse(), index + 1, 'impact local');
  const convergence = convergences[index % Math.max(convergences.length, 1)]?.strength ?? 0.65;

  const seedMiniProjects =
    seed.miniProjetsLycee && seed.miniProjetsLycee.length > 0
      ? seed.miniProjetsLycee
      : seed.miniProjets && seed.miniProjets.length > 0
        ? seed.miniProjets
        : DEFAULT_SEED.miniProjetsLycee;

  const projectMini =
    seedMiniProjects[index % Math.max(seedMiniProjects.length, 1)] ??
    DEFAULT_SEED.miniProjetsLycee[0];

  const normalizedDifficulty = normalizeDifficultyToSchema(projectMini?.difficulty ?? 'medium');
  const normalizedDuration = normalizeDurationToSchema(projectMini?.duration ?? '3 semaines');

  const rawSteps = safeArray(projectMini?.competences ?? []).map((step) => formatSentence(step));
  const steps = padList(rawSteps, FALLBACK_STEPS, 3).slice(0, 6);

  const rawProofs = safeArray(projectMini?.livrables ?? []).map((proof) => formatSentence(proof));
  const expectedProofs = padList(rawProofs, FALLBACK_PROOFS, 2).slice(0, 4);

  const sourceSeedFormations =
    seed.formationsParcoursup && seed.formationsParcoursup.length > 0
      ? seed.formationsParcoursup
      : seed.formations && seed.formations.length > 0
        ? seed.formations
        : DEFAULT_SEED.formationsParcoursup;

  const normalizedSeedFormations = toFormationKeys(
    (sourceSeedFormations ?? []).map((value) => String(value ?? '')).filter(Boolean),
  );

  const fallbackFormations = toFormationKeys(
    (DEFAULT_SEED.formationsParcoursup ?? DEFAULT_SEED.formations ?? []).map((value) =>
      String(value ?? ''),
    ),
  ).slice(0, 5);

  const baseFormations =
    normalizedSeedFormations.length >= 2 ? normalizedSeedFormations : fallbackFormations;

  const suggestedFormations: FormationKey[] = baseFormations.slice(0, 5);

  const sourceAttendus =
    seed.attendusParcoursup && seed.attendusParcoursup.length > 0
      ? seed.attendusParcoursup
      : seed.attendus && seed.attendus.length > 0
        ? seed.attendus
        : DEFAULT_SEED.attendusParcoursup;

  const normalizedAttendus = toAttenduKeys(
    (sourceAttendus ?? []).map((value) => String(value ?? '')).filter(Boolean),
  );

  const fallbackAttendus = toAttenduKeys(
    (DEFAULT_SEED.attendusParcoursup ?? DEFAULT_SEED.attendus ?? []).map((value) =>
      String(value ?? ''),
    ),
  );

  const baseAttendus = normalizedAttendus.length >= 2 ? normalizedAttendus : fallbackAttendus;

  const attendusLycee: AttenduKey[] = baseAttendus.slice(0, 6);

  const titleBase = sanitizeProjectTitle(`${seed.title} - ${formatSentence(topKeyword)}`);
  const title =
    titleBase.length >= 10 ? titleBase : `${seed.title} - Experience ${formatSentence(topKeyword)}`;

  const punchlineBase = (
    seed.pitchEleve ??
    `Je veux transformer ${formatSentence(topKeyword)} en opportunites concretes pour mon lycee.`
  )
    .trim()
    .replace(/\.$/, '');
  const punchline =
    punchlineBase.length >= 20
      ? punchlineBase
      : `${punchlineBase} et en faire un levier durable pour notre communaute`.slice(0, 150);

  const rationaleBase = [
    seed.description?.trim() ??
      'Ce parcours hybride combine technologie, creativite et accompagnement pour un lyceen engage.',
    `Le projet capitalise sur ${topKeyword} et les forces ${pairingKeyword} pour creer une trajectoire alignee sur tes envies.`,
    `Chaque etape t'aide a ${steps[0].toLowerCase()} puis ${steps[1].toLowerCase()} avant de livrer ${expectedProofs[0].toLowerCase()}.`,
  ]
    .join(' ')
    .slice(0, 300);
  const rationale =
    rationaleBase.length >= 50
      ? rationaleBase
      : `${rationaleBase} Ce parcours detaille te permet de prouver tes competences et de construire un dossier solide.`;

  const id = generateProjectKey(title, suggestedFormations, normalizedDifficulty);
  const nowIso = new Date().toISOString();

  const flatTags = Array.from(
    new Set([...baseKeywords, ...expectedProofs, ...steps, seed.category.replace(/_/g, ' ')]),
  )
    .map((tag) =>
      tag
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, '')
        .trim(),
    )
    .filter((tag) => tag.length > 0)
    .map((tag) => tag.slice(0, 20))
    .slice(0, 10);

  return HybridProjectSchema.parse({
    id,
    title,
    punchline,
    rationale,
    suggestedFormations,
    attendusLycee,
    miniProject: {
      difficulty: normalizedDifficulty,
      duration: normalizedDuration.duration,
      steps,
      expectedProofs,
      longRun: normalizedDuration.longRun ?? projectMini?.long_run ?? false,
      description: projectMini?.description?.slice(0, 200),
      title: projectMini?.title?.slice(0, 60),
    },
    difficulty: normalizedDifficulty,
    alignmentScore: Number(Math.min(1, Math.max(0.45, convergence + 0.15)).toFixed(2)),
    parcoursupFitScore: Number(Math.min(1, Math.max(0.4, convergence + 0.2)).toFixed(2)),
    seedCareerId: seed.id,
    tags: flatTags,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
}

export async function POST(req: Request) {
  const startedAt = Date.now();

  let body: IncomingPayload = {};
  try {
    body = (await req.json()) as IncomingPayload;
  } catch (error) {
    console.error('generate-projects::invalid-json', error);
  }

  const keywords4D = buildKeywords(body.profile?.keywords4D);
  const convergences = safeConvergences(body.convergences);
  const seedCareers = ensureSeedCareers(body.seedCareers);

  const baseKeywords = Array.from(
    new Set([
      ...keywords4D.passions,
      ...keywords4D.talents,
      ...keywords4D.utilite,
      ...keywords4D.viabilite,
      ...convergences.flatMap((item) => item.keywords),
    ]),
  );

  const projects: HybridProject[] = [];
  const required = 5;

  for (let index = 0; index < required; index += 1) {
    const seed = seedCareers[index % seedCareers.length] ?? DEFAULT_SEED;
    try {
      projects.push(buildProject(seed, index, baseKeywords, convergences));
    } catch (error) {
      console.error('generate-projects::build-error', error);
      projects.push(buildProject(DEFAULT_SEED, index, baseKeywords, convergences));
    }
  }

  const cacheFormations: FormationKey[] =
    (projects[0]?.suggestedFormations as FormationKey[] | undefined) ?? DEFAULT_SEED.formations;

  const payload = {
    projects,
    metadata: {
      cached: false,
      cacheKey: generateProjectKey(
        `${seedCareers.map((seed) => seed.id).join('-')}-${baseKeywords.join('-')}` ||
          'default-profile',
        cacheFormations,
        projects[0]?.difficulty ?? 'medium',
      ),
      source: 'api' as const,
      generationTime: Date.now() - startedAt,
    },
  };

  const validation = HybridProjectGenerationResponseSchema.safeParse(payload);
  if (!validation.success) {
    console.error('generate-projects::validation-error', validation.error);
    return NextResponse.json(
      {
        projects: projects.slice(0, 5),
        metadata: payload.metadata,
      },
      { status: 200 },
    );
  }

  return NextResponse.json(validation.data);
}
