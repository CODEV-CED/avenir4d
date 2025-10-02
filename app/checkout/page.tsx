// app/checkout/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

type Status = 'loading' | 'redirecting' | 'error';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        // Récupérer les paramètres
        const isEarlyBird = searchParams.get('early_bird') === 'true';
        const context = searchParams.get('context') || 'pricing_page';
        const returnTo = searchParams.get('returnTo') || '/sweet-spot/lab';

        // Appel API pour créer la session
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isEarlyBird,
            context,
            returnTo,
          }),
        });

        const data = await response.json();

        if (data.error === 'unauthorized') {
          // User non connecté → redirection vers login
          setError('Tu dois être connecté pour continuer');
          setTimeout(() => {
            router.push(
              `/auth/login?redirect=${encodeURIComponent('/checkout?early_bird=' + isEarlyBird)}`,
            );
          }, 2000);
          return;
        }

        if (data.error === 'already_premium') {
          // Déjà premium → redirection
          setError('Tu es déjà premium !');
          setTimeout(() => {
            router.push('/sweet-spot/lab');
          }, 2000);
          return;
        }

        if (!data.url) {
          throw new Error('Invalid response from checkout API');
        }

        // Redirection vers Stripe
        setStatus('redirecting');
        window.location.href = data.url;
      } catch (err) {
        console.error('Checkout error:', err);
        setStatus('error');
        setError('Erreur lors de la création de la session de paiement');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    };

    createCheckoutSession();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05070f] p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900/50 to-black/50 p-8 text-center backdrop-blur-sm">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-purple-500" />
            <h1 className="mb-2 text-2xl font-bold text-white">Préparation du paiement...</h1>
            <p className="text-white/60">Création de ta session sécurisée</p>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-purple-500" />
            <h1 className="mb-2 text-2xl font-bold text-white">Redirection vers Stripe...</h1>
            <p className="text-white/60">Ne ferme pas cette page</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold text-white">Oops...</h1>
            <p className="mb-4 text-white/60">{error}</p>
            <p className="text-sm text-white/40">Redirection automatique...</p>
          </>
        )}
      </div>
    </div>
  );
}
