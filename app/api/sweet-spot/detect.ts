// app/api/sweet-spot/detect/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { detectConvergences, type SweetSpotInput } from '@/lib/sweetSpotEngine';
// Si l'alias @/ n'est pas configuré, remplace par: '../../../lib/sweetSpotEngine'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ✅ Schéma explicite (évite les pièges de z.record)
const zInput = z
  .object({
    weights: z.object({
      passions: z.number().min(0).max(1),
      talents: z.number().min(0).max(1),
      utilite: z.number().min(0).max(1),
      viabilite: z.number().min(0).max(1),
    }),
    keywords: z.object({
      passions: z.array(z.string()).default([]),
      talents: z.array(z.string()).default([]),
      utilite: z.array(z.string()).default([]),
      viabilite: z.array(z.string()).default([]),
    }),
    boostTags: z.array(z.string()).optional(),
    boostEnabled: z.boolean().optional(), // envoyé mais non requis côté moteur
  })
  .strict();

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = zInput.parse(raw);

    // Adapter au type attendu par le moteur
    const input: SweetSpotInput = {
      weights: parsed.weights,
      keywords: parsed.keywords,
      boostTags: parsed.boostTags,
      // Si ton moteur supporte aussi boostEnabled, ajoute-le dans son type puis décommente:
      // boostEnabled: parsed.boostEnabled,
    } as any;

    const result = detectConvergences(input);
    return NextResponse.json(result);
  } catch (err: any) {
    // Erreurs Zod
    if (err?.issues && Array.isArray(err.issues)) {
      const fieldErrors = err.issues.map((i: any) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return NextResponse.json(
        { ok: false, error: 'Payload invalide', fieldErrors },
        { status: 422 },
      );
    }
    console.error('Detect API error:', err);
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
