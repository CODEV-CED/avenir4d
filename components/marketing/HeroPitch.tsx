// components/marketing/HeroPitch.tsx
import Link from 'next/link';
import BrandLogo from '@/components/shell/BrandLogo';
import { H1, Paragraph } from '@/components/UI/Typography';
import { SparklesIcon, RocketLaunchIcon, CubeTransparentIcon } from '@heroicons/react/24/outline';

export default function HeroPitch() {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-6 py-20 sm:py-28">
      {/* Titre avec logo inline à gauche */}
      <div className="flex items-center justify-center gap-4 text-center sm:gap-6">
        <div className="hidden sm:block">
          <BrandLogo size="xl" />
        </div>
        <H1 className="text-3xl text-balance sm:text-5xl">
          <span className="text-white/80">Découvre </span>
          <span className="bg-gradient-to-r from-fuchsia-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            NextYou&gt;
          </span>
        </H1>
      </div>

      {/* Paragraphe */}
      <Paragraph className="mx-auto mt-6 max-w-2xl leading-8 text-white/70">
        Choisir quoi faire après le bac, c’est comme ouvrir Netflix sans savoir quoi regarder : trop
        de choix, zéro aide, et tu finis bloqué. Avec Parcoursup, c’est encore pire — NextYou te
        simplifie la vie. On mixe l’<strong>Ikigaï</strong> (méthode japonaise) avec une IA qui ne
        sort pas trois métiers clichés au hasard. Tu comprends ce qui te motive vraiment, sans juste
        cocher une case pour rassurer.{' '}
        <strong>
          Bref : NextYou&gt;, ce n’est pas un test bidon, c’est la boussole qui t’aide à avancer
          sans paniquer.
        </strong>
      </Paragraph>

      {/* Points clés */}
      <ul className="mt-8 inline-grid gap-x-8 gap-y-4 text-left sm:grid-cols-3 md:gap-x-12">
        <li className="flex items-start gap-3">
          <SparklesIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-fuchsia-400" />
          <span>
            Idées de <b>jobs hybrides</b> (parfois pas encore “officiels”).
          </span>
        </li>
        <li className="flex items-start gap-3">
          <RocketLaunchIcon
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300"
          />
          <span>
            Ta <b>punchline perso</b> qui résume ton projet.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <CubeTransparentIcon
            aria-hidden="true"
            className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300"
          />
          <span>
            <b>3 parcours concrets</b> pour passer du stress au plan d’action.
          </span>
        </li>
      </ul>

      {/* CTA */}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/sjt"
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 ease-in-out hover:scale-105 hover:bg-indigo-500"
        >
          Commencer le questionnaire
        </Link>
        <a
          href="#reco"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-white/10"
        >
          Voir des exemples
        </a>
      </div>
    </section>
  );
}
