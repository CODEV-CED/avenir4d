'use client';

import { Check, Shield, Sparkles, Zap, Clock } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Button from '@/components/UI/button';

// Détection automatique Early Bird (jusqu'au 01 décembre 2025)
const isEarlyBirdActive = new Date() < new Date('2025-12-01T23:59:59');

type Feature = { label: string };
type Plan = {
  name: string;
  price: string;
  priceOriginal?: string;
  period?: string;
  badge?: string;
  highlight?: boolean;
  ctaLabel: string;
  ctaHref: string;
  features: Feature[];
};

const PLANS: Plan[] = [
  {
    name: 'Gratuit',
    price: '0 EUR',
    period: "/ à l'essai",
    ctaLabel: 'Commencer le test',
    ctaHref: '/sjt',
    features: [
      { label: '12 situations SJT personnalisées' },
      { label: 'Canvas Ikigaï interactif' },
      { label: '3 recommandations formations' },
      { label: '1 projet motivé généré' },
    ],
  },
  {
    name: 'Premium',
    price: isEarlyBirdActive ? '49,90 EUR' : '79,99 EUR',
    priceOriginal: isEarlyBirdActive ? '79,99 EUR' : undefined,
    badge: isEarlyBirdActive ? "Early Bird - Jusqu'au 01 déc" : undefined,
    period: '/ une fois',
    highlight: true,
    ctaLabel: 'Débloquer mon Sweet Spot',
    ctaHref: `/checkout?early_bird=${isEarlyBirdActive}&context=pricing_homepage`,
    features: [
      { label: 'SJT enrichi + profil 4D complet' },
      { label: 'Canvas Ikigaï avec détection convergences' },
      { label: 'Recommandations formations illimitées' },
      { label: "Co-écriture PFM jusqu'à 6 vœux Parcoursup" },
      { label: 'Export PDF "soirée parents"' },
      { label: 'Support prioritaire (email)' },
    ],
  },
];

function EarlyBirdCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      const deadline = new Date('2025-12-01T23:59:59');
      const now = new Date();
      const difference = deadline.getTime() - now.getTime();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-2 text-xs text-white/60">
        <Clock className="h-3 w-3" />
        <span>Chargement...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 text-xs font-medium text-white/70">
      <Clock className="h-3 w-3 animate-pulse" />
      <span>
        Plus que {timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}min
      </span>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={[
        'relative rounded-2xl border bg-white/[0.04] backdrop-blur-md',
        'border-white/10 p-6 shadow-xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(139,92,246,0.26)]',
        plan.highlight ? 'ring-primary/40 ring-2' : '',
      ].join(' ')}
    >
      {/* MODIFICATION 1: Badge Early Bird - fond gris foncé subtil au lieu d'orange */}
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-slate-600/40 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-4 py-1 text-xs font-bold whitespace-nowrap text-white shadow-[0_0_20px_rgba(168,85,247,0.6)]">
          {plan.badge}
        </div>
      )}

      {/* MODIFICATION 2: Badge "Populaire" - gradient identique au mot "accès" */}
      {plan.highlight && (
        <div className="from-primary to-secondary absolute -top-3 right-4 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white shadow">
          Populaire
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        {plan.highlight ? (
          <Sparkles className="text-primary" size={18} />
        ) : (
          <Shield className="text-white/60" size={18} />
        )}
        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
      </div>

      <div className="mb-6">
        {/* MODIFICATION 4: Prix barré plus visible avec badge pourcentage */}
        {plan.priceOriginal && (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-lg font-bold text-white/50 line-through">
              {plan.priceOriginal}
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
              -37%
            </span>
          </div>
        )}

        <span className="text-4xl font-extrabold tracking-tight text-white">{plan.price}</span>
        {plan.period ? <span className="ml-2 text-sm text-white/60">{plan.period}</span> : null}
      </div>

      {/* Countdown si Early Bird */}
      {plan.badge && (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-2">
          <EarlyBirdCountdown />
        </div>
      )}

      <ul className="mb-6 space-y-3">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-white/85">
            <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
            <span className="text-sm leading-relaxed">{feature.label}</span>
          </li>
        ))}
      </ul>

      {/* Boutons avec gradient identique au badge "Populaire" */}
      <Link href={plan.ctaHref} className="block">
        <Button variant={plan.highlight ? 'gradient' : 'gradient'} size="lg" className="w-full">
          {plan.highlight ? <Zap className="mr-2 h-4 w-4" /> : null}
          {plan.ctaLabel}
        </Button>
      </Link>

      <div className="via-primary/40 pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent to-transparent" />
    </div>
  );
}

export default function Pricing() {
  return (
    <section className="relative overflow-hidden bg-[#05070f] py-20 text-white">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 60% at 80% 20%, rgba(56,189,248,.12) 0%, rgba(139,92,246,.18) 35%, rgba(0,0,0,0) 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <header className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Choisis ton <span className="text-gradient">accès</span>
          </h2>
          <p className="mt-3 text-sm text-white/70 md:text-base">
            Commence gratuitement. Passe en Premium quand tu veux débloquer ton rapport complet.
          </p>

          {/* Bandeau Early Bird */}
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-purple-200">
              <Sparkles className="h-4 w-4" />
              <span>Prix de lancement : 37,5% de réduction jusqu'au 01 décembre</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* Footer info enrichi */}
        <div className="mt-12 text-center">
          <p className="text-xs text-white/60">
            💳 Paiement sécurisé • ✅ Satisfaction garantie • 📧 Support réactif
          </p>
          <p className="mt-2 text-xs text-white/50">
            Étudiants et lycéens : tarifs groupe disponibles sur demande →{' '}
            <a href="mailto:contact@nextyou.com" className="underline hover:text-white/70">
              contact@nextyou.com
            </a>
          </p>
        </div>

        {/* Social proof */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/70">200+</span>
            <span>lycéens accompagnés</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/70">4.8/5</span>
            <span>satisfaction parents</span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/70">95%</span>
            <span>trouvent leur voie</span>
          </div>
        </div>
      </div>
    </section>
  );
}
