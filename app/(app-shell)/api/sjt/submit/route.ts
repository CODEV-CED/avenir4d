import type { ZodError } from 'zod';
import { NextResponse } from 'next/server';
import { zSJTSubmit } from '@/lib/sweetspot/zSJTSubmit';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildValidationError(error: ZodError) {
  const details: Record<string, string> = {};
  for (const issue of error.issues) {
    details[issue.path.join('.')] = issue.message;
  }
  return details;
}

export async function POST(req: Request) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Payload JSON invalide' }, { status: 400 });
  }

  const parsed = zSJTSubmit.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation echouee', details: buildValidationError(parsed.error) },
      { status: 422 },
    );
  }

  const payload = parsed.data;

  const insertData = {
    profile4d: payload.profile4d as unknown,
    keywords: payload.keywords ?? { passions: [], talents: [], utilite: [], viabilite: [] },
    qual: payload.qual as unknown,
    raw_choices: payload.choices as unknown,
    survey_version: payload.surveyVersion ?? 'sjt_v2',
    idempotency_key: payload.idempotencyKey ?? null,
    user_agent: req.headers.get('user-agent'),
    completion_time_ms: null,
  } as Record<string, unknown>;

  const upsert = await supabaseAdmin
    .from('sweetspot_profiles')
    .upsert(insertData, { onConflict: 'idempotency_key' })
    .select('id, created_at, idempotency_key')
    .single();

  if (upsert.error) {
    // Cas d'idempotence : on retrouve l'enregistrement existant et on le renvoie
    if (upsert.error.code === '23505' && payload.idempotencyKey) {
      const existing = await supabaseAdmin
        .from('sweetspot_profiles')
        .select('id, created_at, idempotency_key')
        .eq('idempotency_key', payload.idempotencyKey)
        .maybeSingle();

      if (!existing.error && existing.data) {
        return NextResponse.json(
          { ok: true, id: existing.data.id, profile: { createdAt: existing.data.created_at } },
          { status: 200, headers: { Location: `/api/sjt/profile?id=${existing.data.id}` } },
        );
      }
    }

    console.error('[sjt.submit] upsert error', upsert.error);
    return NextResponse.json(
      { ok: false, error: upsert.error.message || 'Erreur serveur' },
      { status: 500 },
    );
  }

  const profile = upsert.data;
  return NextResponse.json(
    { ok: true, id: profile.id, profile: { createdAt: profile.created_at } },
    { status: 201, headers: { Location: `/api/sjt/profile?id=${profile.id}` } },
  );
}
