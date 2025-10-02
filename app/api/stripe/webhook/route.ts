// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server'; // server-side supabase
// ⚠️ Si vous écrivez côté serveur sans auth utilisateur, préférez un RPC sécurisé RLS.
// Ici on passe par l'utilisateur connecté via supabase.auth.getUser() seulement si vous avez un cookie de session.

export const config = {
  api: {
    bodyParser: false, // App Router n’utilise pas bodyParser; gardé pour info
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' });
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  let event: Stripe.Event;

  // 1) Lire le RAW body
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  try {
    event = stripe.webhooks.constructEvent(body, sig!, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[Stripe] Signature invalide', err?.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // 2) Gérer les events utiles
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Récupération de l'user_id stocké côté Checkout (recommandé)
      const userId = (session.metadata?.user_id || session.client_reference_id) as
        | string
        | undefined;
      if (!userId) {
        console.warn('[Stripe] checkout.session.completed sans user_id');
        return NextResponse.json({ ok: true });
      }

      // 3) Écriture en DB : is_premium = true
      const supabase = await createClient();
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_premium: true, premium_since: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('[Stripe] update user_profiles error', error);
        // on renvoie 200 pour éviter replays agressifs, mais on loggue l’erreur
      }
    }

    // (Optionnel) support d’autres events : invoice.paid, customer.subscription.updated, …
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Stripe webhook] handler error', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
