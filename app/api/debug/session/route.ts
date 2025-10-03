// app/api/debug/session/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // Always return JSON
    return NextResponse.json({
      ok: true,
      user: user ? { id: user.id, email: user.email } : null,
      error: error ? String(error.message || error) : null,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        user: null,
        error: e?.message ?? 'unexpected_error',
      },
      { status: 200 },
    );
  }
}
