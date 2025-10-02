// components/paywall/PaywallModal.tsx
'use client';

import { useAccessStore } from '@/store/useAccessStore';
import { useEffect, useState } from 'react';
import { X, Sparkles, Lock, RefreshCw, MessageCircle } from 'lucide-react';

const EARLY_BIRD_END = new Date('2025-01-31T23:59:59');
const EARLY_PRICE = 49.99;
const REGULAR_PRICE = 79.99;

export function PaywallModal() {
  const { paywallOpen, paywallContext, closePaywall } = useAccessStore();
  const [isEarly, setIsEarly] = useState(true);
  const [countdown, setCountdown] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const price = isEarly ? EARLY_PRICE : REGULAR_PRICE;
  const discount = Math.round(((REGULAR_PRICE - EARLY_PRICE) / REGULAR_PRICE) * 100);

  // ✅ Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Countdown avec meilleure précision
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const isEarlyBird = now < EARLY_BIRD_END;
      setIsEarly(isEarlyBird);

      if (isEarlyBird) {
        const diff = EARLY_BIRD_END.getTime() - now.getTime();
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);

        setCountdown(days > 0 ? `${days}j ${hours}h` : `${hours}h ${minutes}min`);
      } else {
        setCountdown('');
      }
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60000); // Toutes les minutes
    return () => clearInterval(intervalId);
  }, []);

  // ✅ Fermeture avec Escape
  useEffect(() => {
    if (!paywallOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePaywall();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [paywallOpen, closePaywall]);

  // ✅ Bloquer scroll du body quand modal ouverte
  useEffect(() => {
    if (paywallOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [paywallOpen]);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      const returnTo = `${window.location.pathname}${window.location.search}#hybrid-projects-section`;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: paywallContext || 'paywall_modal',
          isEarlyBird: isEarly,
          returnTo,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur création session Stripe');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('URL Stripe manquante');
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
      alert('Une erreur est survenue. Réessayez dans quelques instants.');
      setIsLoading(false);
    }
  };

  // ✅ Hydration guard
  if (!mounted || !paywallOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm transition-opacity"
        onClick={closePaywall}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
      >
        <div
          className="animate-fadeInUp relative w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 to-black p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={closePaywall}
            className="absolute top-4 right-4 rounded-full p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Early bird badge */}
          {isEarly && countdown && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-1 text-sm font-bold whitespace-nowrap text-white shadow-lg">
              🔥 Offre limitée – plus que {countdown}
            </div>
          )}

          {/* Header */}
          <div className="mb-6 text-center">
            <Sparkles className="mx-auto mb-4 h-12 w-12 text-purple-400" />
            <h2 id="paywall-title" className="mb-2 text-3xl font-bold text-white">
              🎯 Débloque ton Projet Pro
            </h2>
            <p className="text-lg text-white/70">
              Projets détaillés, formations alignées, export Parcoursup.
            </p>
          </div>

          {/* Prix */}
          <div className="mb-6 rounded-xl bg-white p-6 text-center shadow-xl">
            {isEarly && (
              <div className="mb-2 text-xl">
                <span className="text-gray-500 line-through">{REGULAR_PRICE}€</span>
                <span className="ml-2 inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-600">
                  -{discount}%
                </span>
              </div>
            )}
            <div className="mb-2 text-5xl font-bold text-gray-900">{price.toFixed(2)}€</div>
            <p className="text-sm text-gray-600">Paiement unique • Accès jusqu'à Parcoursup 2026</p>
          </div>

          {/* Features */}
          <div className="mb-6 space-y-2">
            {[
              '✨ Projets hybrides IA personnalisés',
              '🎯 Formations alignées avec ton profil',
              '📄 Export PDF pour Parcoursup',
              '🔄 Mise à jour des données formations',
              '💬 Support prioritaire',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20">
                  <div className="h-2 w-2 rounded-full bg-purple-400" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Redirection...
                </span>
              ) : (
                'Débloquer maintenant →'
              )}
            </button>

            <button
              onClick={closePaywall}
              disabled={isLoading}
              className="rounded-xl border border-white/20 px-6 py-4 text-white transition-all hover:bg-white/10 disabled:opacity-50"
            >
              Plus tard
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-white/40">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Paiement sécurisé
            </span>
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Garantie 7 jours
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Support inclus
            </span>
          </div>

          {/* Context debug (dev only) */}
          {process.env.NODE_ENV === 'development' && paywallContext && (
            <div className="mt-4 rounded-lg bg-yellow-500/10 p-2 text-center text-xs text-yellow-300">
              Context: {paywallContext}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
