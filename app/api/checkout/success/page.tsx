// app/checkout/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAccessStore } from '@/store/useAccessStore'; // ← Sans "s" !
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

type Status = 'verifying' | 'success' | 'error';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPremium, executePendingAction } = useAccessStore();

  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('Vérification du paiement...');

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      const returnTo = searchParams.get('returnTo') || '/lab/sweet-spot';

      // ✅ Validation du session_id
      if (!sessionId) {
        setStatus('error');
        setMessage('Session invalide - Redirection...');
        setTimeout(() => router.replace('/lab/sweet-spot'), 2000);
        return;
      }

      try {
        // ✅ Appel API sécurisé pour vérifier le paiement
        const response = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (data.success) {
          // ✅ Paiement confirmé
          setStatus('success');
          setMessage('Paiement confirmé ! 🎉');

          // ✅ Activer premium localement
          setPremium(true, data.amount);

          // ✅ Exécuter l'action en attente (génération projets, etc.)
          executePendingAction();

          // ✅ Gestion du seed pour génération projets
          const pendingSeed = localStorage.getItem('a4d.pendingSeed');

          if (pendingSeed) {
            localStorage.removeItem('a4d.pendingSeed');
            const url = new URL(returnTo, window.location.origin);
            url.searchParams.set('genSeed', pendingSeed);

            setTimeout(() => {
              router.replace(url.pathname + url.search + url.hash);
            }, 1500);
          } else {
            setTimeout(() => {
              router.replace(returnTo);
            }, 1500);
          }
        } else {
          // ❌ Erreur de vérification
          setStatus('error');
          setMessage(
            data.error === 'payment_not_completed'
              ? 'Paiement non finalisé'
              : 'Erreur de vérification',
          );
          setTimeout(() => router.replace('/lab/sweet-spot'), 3000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Erreur de connexion');
        setTimeout(() => router.replace('/lab/sweet-spot'), 3000);
      }
    };

    verifyPayment();
  }, [router, searchParams, setPremium, executePendingAction]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 to-black p-8 text-center">
        {status === 'verifying' && (
          <>
            <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-purple-500" />
            <h1 className="mb-2 text-2xl font-bold text-white">Vérification...</h1>
            <p className="text-white/60">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-2 text-2xl font-bold text-white">Paiement confirmé !</h1>
            <p className="mb-4 text-white/60">Ton accès premium est activé</p>
            <p className="text-sm text-white/40">Redirection en cours...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold text-white">Oops...</h1>
            <p className="mb-4 text-white/60">{message}</p>
            <p className="text-sm text-white/40">Redirection vers l'app...</p>
          </>
        )}
      </div>
    </div>
  );
}
