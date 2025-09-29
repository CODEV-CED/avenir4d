import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server-next15";
import { zSJTSubmit } from "@/lib/sweetspot/zSJTSubmit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const supabase = await getServerSupabase();

  const userResult = await supabase.auth.getUser();
  const user = userResult.data?.user ?? null;
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non authentifie" }, { status: 401 });
  }

  const raw = (await req.json()) as Record<string, unknown>;
  const payload = zSJTSubmit.parse(raw);

  const insertData = {
    user_id: user.id,
    profile4d: payload.profile4d as unknown,
    keywords: payload.keywords ?? {},
    qual: payload.qual as unknown,
    raw_choices: payload.choices as unknown,
    survey_version: payload.surveyVersion ?? "sjt_v2",
    idempotency_key: (raw?.idempotencyKey as string | undefined) ?? null,
  };

  const upsertResult = await supabase
    .from("sweetspot_profiles")
    .upsert(insertData, { onConflict: "idempotency_key" })
    .select("id, created_at")
    .single();

  if (upsertResult.error) {
    return NextResponse.json({ ok: false, error: upsertResult.error.message }, { status: 500 });
  }

  const profileRow = upsertResult.data;

  return NextResponse.json(
    { ok: true, id: profileRow.id, profile: { createdAt: profileRow.created_at } },
    { status: 201, headers: { Location: `/api/sjt/profile?id=${profileRow.id}` } },
  );
}
