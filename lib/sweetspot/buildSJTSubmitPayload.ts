import { zSJTSubmit } from './zSJTSubmit';

type RawAnswer = { questionId: string; answer: string | number };

export type BuildParams = {
  answers: RawAnswer[]; // tes réponses SJT mises à plat
  profile4d: {
    plaisir: number | string;
    competence: number | string;
    utilite: number | string;
    viabilite: number | string;
    confidence_avg?: number | string;
    version?: number | string;
  };
  qual: {
    dimancheMatin: string;
    algoPersonnel: string;
    talentReconnu: string;
    indignationMax: string;
  };
  keywords?: {
    passions?: string[];
    talents?: string[];
    utilite?: string[];
    viabilite?: string[];
  };
  surveyVersion?: string;
  idempotencyKey?: string;
};

export function buildSJTSubmitPayload(input: BuildParams) {
  const raw = {
    choices: input.answers,
    profile4d: input.profile4d,
    qual: input.qual,
    keywords: input.keywords ?? {},
    surveyVersion: input.surveyVersion ?? 'sjt_v2',
    idempotencyKey: input.idempotencyKey,
  };

  // ✅ Validation côté client (facultative, utile pour messages immédiats)
  const parsed = zSJTSubmit.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join('.')] = issue.message;
    }
    return { ok: false as const, fieldErrors };
  }

  return { ok: true as const, payload: parsed.data };
}
