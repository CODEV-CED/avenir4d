'use client';

import FeatureCard from './FeatureCard';
import { Radar, Sparkles, SlidersHorizontal, GraduationCap } from 'lucide-react';

const features = [
  {
    title: 'Formations recommandées',
    desc: 'BTS, BUT, Licences, grandes écoles : suggestions adaptées à ton profil (durée, prérequis, liens utiles).',
    icon: <GraduationCap className="h-5 w-5" />,
  },
  {
    title: 'Ta punchline perso',
    desc: 'Une phrase claire pour te présenter (oraux, dossiers, LinkedIn).',
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    title: '3 parcours concrets',
    desc: 'Études, alternance, projet hybride\u202F: choisis un cap actionnable.',
    icon: <SlidersHorizontal className="h-5 w-5" />,
  },
  {
    title: 'Idées de jobs hybrides',
    desc: 'Des pistes inattendues, alignées à ce que tu aimes et sais faire.',
    icon: <Radar className="h-5 w-5" />,
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="relative overflow-hidden py-20 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-12 -left-24 h-72 w-72 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center md:text-left">
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            Ce que tu obtiens avec <span className="text-gradient">NextYou&gt;</span>
          </h2>
          <p className="mt-3 text-sm text-white/60 md:max-w-xl">
            Une sélection d'outils pour clarifier ton projet et lancer ton plan d'action.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
