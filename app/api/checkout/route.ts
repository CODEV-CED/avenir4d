// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { stripe, appUrl } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    // ✅ 1. Vérifier l'authentification
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { context, isEarlyBird, returnTo } = await req.json();

    // ✅ 2. Vérifier que l'user n'est pas déjà premium
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', user.id)
      .single();

    if (profile?.is_premium) {
      return NextResponse.json({ error: 'already_premium' }, { status: 400 });
    }

    // ✅ 3. Sélectionner le prix
    const price = isEarlyBird ? process.env.STRIPE_PRICE_EARLY! : process.env.STRIPE_PRICE_REGULAR!;

    // ✅ 4. Créer la session Stripe sécurisée
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,

      // ✅ Metadata pour le webhook et vérification
      metadata: {
        user_id: user.id,
        context: String(context || 'unknown'),
        is_early_bird: String(isEarlyBird),
      },

      // ✅ Email pré-rempli
      customer_email: user.email,

      // ✅ URLs avec session_id pour validation
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&returnTo=${encodeURIComponent(returnTo || '/lab/sweet-spot')}`,
      cancel_url: `${appUrl}/lab/sweet-spot?canceled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('Checkout error:', e);
    return NextResponse.json({ error: 'checkout_failed' }, { status: 500 });
  }
}
