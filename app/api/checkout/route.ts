// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { stripe, appUrl } from '@/lib/stripe';

const ALLOWED_RETURN_TO = new Set<string>([
  '/lab/sweet-spot',
  '/lab/projects',
  '/checkout/success',
]);

function sanitizeReturnTo(path?: string) {
  if (!path || !path.startsWith('/')) return '/lab/sweet-spot';
  // enlève query/hash et ne garde que le path de base
  const base = path.split('?')[0].split('#')[0];
  return ALLOWED_RETURN_TO.has(base) ? base : '/lab/sweet-spot';
}

export async function POST(req: Request) {
  try {
    // 1) Auth
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // 2) Payload
    const { context, isEarlyBird, returnTo } = await req.json().catch(() => ({}));
    const safeReturnTo = sanitizeReturnTo(returnTo);

    // 3) Déjà premium ?
    // ⚠️ Garde la même table que ton webhook : ici c'est "profiles"
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    if (profile?.is_premium) {
      return NextResponse.json({ error: 'already_premium' }, { status: 400 });
    }

    // 4) Prix
    const price = isEarlyBird ? process.env.STRIPE_PRICE_EARLY! : process.env.STRIPE_PRICE_REGULAR!;
    if (!price) {
      console.error('Missing STRIPE_PRICE_EARLY/REGULAR env');
      return NextResponse.json({ error: 'price_not_configured' }, { status: 500 });
    }

    // 5) Session Stripe
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,

      // 🔐 Identité côté Stripe pour le webhook (deux canaux)
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        context: String(context || 'unknown'),
        is_early_bird: String(!!isEarlyBird),
      },

      // Email utile si tu n’attaches pas de customer Stripe
      customer_email: user.email ?? undefined,

      // URLs
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&returnTo=${encodeURIComponent(safeReturnTo)}`,
      cancel_url: `${appUrl}${safeReturnTo}?canceled=1`,

      // (Optionnel) Anti-fraude / compliance / debug
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          flow: 'avenir4d_mvp',
        },
      },
      custom_text: {
        submit: { message: 'Avenir 4D – accès Premium jusqu’à Parcoursup' },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('Checkout error:', e);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
