'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/UI/button';

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#05070f] py-20 text-white">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-14 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-64 w-64 rounded-full bg-indigo-500/18 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Prêt à trouver ton <span className="text-gradient">Sweet Spot</span> ?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/75 md:text-base">
          Passe le test, active le Lab et repars avec un plan d'action clair en quelques minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/sjt">
            <Button variant="gradient" size="lg">
              Commencer gratuitement <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">
              Voir les offres
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-white/70">+1 200 profils analysés - Aucune carte requise</p>
      </div>
    </section>
  );
}
