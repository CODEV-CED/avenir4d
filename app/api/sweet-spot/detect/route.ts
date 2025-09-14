// app/api/sweet-spot/detect/route.ts
import { NextResponse } from 'next/server';
import { detectConvergences, SweetSpotInput } from '@/lib/sweetSpotEngine'; // <- ajuste le chemin si besoin

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SweetSpotInput;
    const result = detectConvergences(body);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erreur serveur' }, { status: 500 });
  }
}
