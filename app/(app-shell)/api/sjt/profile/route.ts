import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server-next15";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, error: "Parametre id manquant" }, { status: 400 });
  }

  const supabase = await getServerSupabase();
  const userResult = await supabase.auth.getUser();
  const user = userResult.data?.user ?? null;
  if (!user) {
    return NextResponse.json({ ok: false, error: "Non authentifie" }, { status: 401 });
  }

  const profileResult = await supabase
    .from("sweetspot_profiles")
    .select("id, user_id, created_at, profile4d, keywords, qual, survey_version")
    .eq("id", id)
    .maybeSingle();

  if (profileResult.error) {
    return NextResponse.json({ ok: false, error: profileResult.error.message }, { status: 500 });
  }
  if (!profileResult.data) {
    return NextResponse.json(
      { ok: false, error: "Introuvable ou acces interdit" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, profile: profileResult.data });
}
