// app/api/checkout/verify/route.ts
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    // Validation session_id
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ success: false, error: 'session_id_missing' }, { status: 400 });
    }

    // ✅ 1. Vérifier la session Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      console.error('Stripe session retrieval error:', stripeError);
      return NextResponse.json({ success: false, error: 'invalid_session' }, { status: 400 });
    }

    // ✅ 2. Vérifier que le paiement est bien confirmé
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ success: false, error: 'payment_not_completed' }, { status: 400 });
    }

    // ✅ 3. Vérifier l'authentification
    const supabase = await getSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 });
    }

    // ✅ 4. Vérifier que l'user_id correspond (sécurité)
    const userIdFromMetadata = session.metadata?.user_id;
    if (userIdFromMetadata && userIdFromMetadata !== user.id) {
      console.error('User ID mismatch:', {
        sessionUserId: userIdFromMetadata,
        currentUserId: user.id,
      });
      return NextResponse.json({ success: false, error: 'user_mismatch' }, { status: 403 });
    }

    // ✅ 5. Calculer le montant payé
    const amountPaid = session.amount_total ? session.amount_total / 100 : 49.99;

    // ✅ 6. Mettre à jour le profil dans Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_premium: true,
        premium_activated_at: new Date().toISOString(),
        stripe_customer_email: session.customer_email || session.customer_details?.email,
        price_paid: amountPaid,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ success: false, error: 'database_error' }, { status: 500 });
    }

    // ✅ 7. Log pour analytics (optionnel)
    console.log('Premium activation:', {
      userId: user.id,
      email: user.email,
      amount: amountPaid,
      context: session.metadata?.context,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      amount: amountPaid,
      email: user.email,
    });
  } catch (error) {
    console.error('Verify route error:', error);
    return NextResponse.json({ success: false, error: 'server_error' }, { status: 500 });
  }
}
