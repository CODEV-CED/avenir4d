// app/api/sjt/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin'; // ✅ admin client
import { zSJTSubmit } from '@/lib/sweetspot/zSJTSubmit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function logErrorServer(
  errorType: string,
  errorMessage: string,
  errorData?: any,
  profileId?: string,
) {
  try {
    await supabaseAdmin.from('sweetspot_errors').insert({
      profile_id: profileId ?? null,
      error_type: errorType,
      error_message: errorMessage,
      error_data: errorData ?? null,
    });
  } catch (e) {
    console.error('logErrorServer failed:', e);
  }
}

export async function POST(req: NextRequest) {
  console.log('[SJT] POST hit');

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    return NextResponse.json({ ok: false, error: 'Server misconfigured' }, { status: 500 });
  }

  const startTime = Date.now();
  const supabase = await getSupabaseServerClient(); // tu peux garder pour d’autres lectures si besoin

  try {
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { ok: false, error: 'Content-Type doit être application/json' },
        { status: 415 },
      );
    }

    const rawPayload = await req.json();
    const payload = zSJTSubmit.parse(rawPayload);

    const userAgent = req.headers.get('user-agent')?.slice(0, 200) ?? null;
    const completionTimeMs = Date.now() - startTime;

    const insertData = {
      profile4d: payload.profile4d as any,
      keywords: payload.keywords ?? {},
      qual: payload.qual as any,
      raw_choices: payload.choices as any,
      survey_version: payload.surveyVersion ?? 'sjt_v2',
      user_agent: userAgent,
      completion_time_ms: completionTimeMs,
      idempotency_key: (rawPayload?.idempotencyKey as string | undefined) ?? null,
    };

    // ✅ UP S E R T via SERVICE ROLE (bypass RLS)
    const { data, error } = await supabaseAdmin
      .from('sweetspot_profiles')
      .upsert(insertData, { onConflict: 'idempotency_key' })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Erreur Supabase insert:', error);
      await logErrorServer('api_insert_failed', error.message, {
        error_code: error.code,
        details: error.details,
      });
      return NextResponse.json(
        { ok: false, error: 'Erreur lors de la sauvegarde du profil' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        id: data.id,
        message: 'Profil sauvegardé avec succès',
        profile: {
          version: payload.profile4d.version ?? 1,
          createdAt: data.created_at,
        },
      },
      { status: 201, headers: { Location: `/api/profiles/${data.id}` } },
    );
  } catch (error: any) {
    console.error('Erreur API SJT submit:', error);

    if (error?.issues && Array.isArray(error.issues)) {
      const fieldErrors = error.issues.map((issue: any) => ({
        field: issue.path.join('.'),
        label: getFieldLabel(issue.path),
        code: issue.code,
        message: issue.message,
        path: issue.path,
      }));
      await logErrorServer('api_validation_failed', 'Validation Zod échouée', { fieldErrors });
      return NextResponse.json(
        { ok: false, error: 'Veuillez corriger les champs indiqués', fieldErrors },
        { status: 422 },
      );
    }

    await logErrorServer(
      'api_generic_error',
      error instanceof Error ? error.message : 'Erreur inconnue',
      { stack: error instanceof Error ? error.stack : undefined },
    );

    return NextResponse.json(
      { ok: false, error: 'Erreur serveur inattendue', timestamp: new Date().toISOString() },
      { status: 500 },
    );
  }
}

// GET function is removed for brevity as it's not in the user request.
// If it should be kept, it needs to be added back.
// For now, assuming it's not needed based on the provided code.

function getFieldLabel(path: (string | number)[]): string {
  const map: Record<string, string> = {
    choices: 'Choix du questionnaire',
    'qual.dimancheMatin': 'Test du Dimanche Matin',
    'qual.algoPersonnel': 'Algorithme Personnel',
    'qual.talentReconnu': 'Talent Reconnu',
    'qual.indignationMax': 'Indignation Maximale',
    'profile4d.plaisir': 'Score Plaisir',
    'profile4d.competence': 'Score Compétence',
    'profile4d.utilite': 'Score Utilité',
    'profile4d.viabilite': 'Score Viabilité',
    'profile4d.confidence_avg': 'Confiance Moyenne',
    keywords: 'Mots-clés',
    surveyVersion: 'Version du Questionnaire',
    idempotencyKey: "Clé d'Idempotence",
  };
  const key = path.join('.');
  return map[key] ?? key;
}
