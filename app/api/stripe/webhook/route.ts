// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); // no apiVersion → uses account default
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  // 1) Read raw body & verify signature
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[Stripe] Invalid signature:', err?.message);
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  // 2) Handle event types you care about
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Prefer metadata.user_id, fallback to client_reference_id
      const userId =
        (session.metadata?.user_id as string | undefined) ??
        (session.client_reference_id as string | undefined);

      if (!userId) {
        console.warn('[Stripe] session completed but no user_id in metadata/client_reference_id');
        return NextResponse.json({ ok: true }); // ack anyway
      }

      // 3) Mark user as premium with ADMIN client (bypass RLS)
      const admin = getSupabaseAdmin();
      const { error } = await admin
        .from('profiles') // ← keep table name consistent with checkout route
        .update({ is_premium: true, premium_since: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        console.error('[Stripe] Supabase update error:', error);
        // Return 200 so Stripe doesn't spam retries; you can add alerting here
        return NextResponse.json({ ok: true, updated: false });
      }

      return NextResponse.json({ ok: true, updated: true });
    }

    // Ignore other events for now
    return NextResponse.json({ ok: true, ignored: event.type });
  } catch (err) {
    console.error('[Stripe webhook] handler error', err);
    return NextResponse.json({ error: 'handler_failed' }, { status: 500 });
  }
}
