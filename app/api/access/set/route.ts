// app/api/access/set/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, isPremium = true, source = 'stripe' } = body;

  // Vérification du secret selon la source
  if (source === 'stripe') {
    // Pour Stripe, on utilisera stripe.webhooks.constructEvent() plus tard
    const sig = req.headers.get('stripe-signature');
    if (!sig) {
      return NextResponse.json({ ok: false, error: 'missing_stripe_signature' }, { status: 400 });
    }
    // TODO: Implémenter la validation Stripe webhook
    // const event = stripe.webhooks.constructEvent(...)
  } else {
    // Pour les tests manuels, on utilise un simple secret
    const SECRET = process.env.WEBHOOK_SECRET;
    const sig = req.headers.get('x-webhook-secret');

    if (!sig || sig !== SECRET) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
  }

  if (!userId) {
    return NextResponse.json({ ok: false, error: 'missing_user' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from('user_profiles').upsert(
    {
      id: userId,
      is_premium: !!isPremium,
      premium_since: isPremium ? new Date().toISOString() : null,
      premium_source: source,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  );

  if (error) {
    console.error('[set] Update failed:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
