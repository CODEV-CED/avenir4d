'use client';

import { Check, Shield, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/UI/button';

type Feature = { label: string };
type Plan = {
  name: string;
  price: string;
  period?: string;
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
    ctaLabel: 'Essayer le test',
    ctaHref: '/sjt',
    features: [
      { label: 'SJT 12 questions' },
      { label: 'Visualisation Ikigaï de base' },
      { label: 'Score Sweet Spot (limité)' },
      { label: 'Accès au Lab (découverte)' },
    ],
  },
  {
    name: 'Premium',
    price: '49,90 EUR',
    period: '/ une fois',
    highlight: true,
    ctaLabel: 'Débloquer mon Sweet Spot',
    ctaHref: '/checkout',
    features: [
      { label: 'SJT enrichi + 4 questions qualitatives' },
      { label: 'étection auto des convergences' },
      { label: 'Moment Eurêka + rapport détaillé' },
      { label: 'Recommandations formations et projets IA' },
      { label: 'Export PDF et support prioritaire' },
    ],
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={[
        'relative rounded-2xl border bg-white/[0.04] backdrop-blur-md',
        'border-white/10 p-6 shadow-xl transition-transform duration-300 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(139,92,246,0.26)]',
        plan.highlight ? 'ring-primary/40 ring-2' : '',
      ].join(' ')}
    >
      {plan.highlight && (
        <div className="from-primary to-secondary absolute -top-3 left-4 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white shadow">
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
        <span className="text-4xl font-extrabold tracking-tight text-white">{plan.price}</span>
        {plan.period ? <span className="ml-2 text-sm text-white/60">{plan.period}</span> : null}
      </div>

      <ul className="mb-6 space-y-3">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3 text-white/85">
            <Check className="mt-0.5 h-4 w-4 text-emerald-400" />
            <span className="text-sm leading-relaxed">{feature.label}</span>
          </li>
        ))}
      </ul>

      <Link href={plan.ctaHref} className="block">
        <Button variant={plan.highlight ? 'gradient' : 'outline'} size="lg" className="w-full">
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
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PLANS.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-white/60">
          Étudiants et lycéens : tarifs groupe disponibles sur demande.
        </p>
      </div>
    </section>
  );
}
