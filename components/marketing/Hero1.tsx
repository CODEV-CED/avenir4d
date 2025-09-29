'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import HeroVisual from './HeroVisual';
import FeatureRow from './FeatureRow';
import AnimatedGradientBG from './AnimatedGradientBG';
import OrganicBlob from './OrganicBlob';

type HeroProps = {
  showMiniBrand?: boolean;
};

export default function Hero({ showMiniBrand = false }: HeroProps) {
  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden px-6 pt-10 pb-16">
      <AnimatedGradientBG />
      <OrganicBlob />
      {showMiniBrand && (
        <div className="mb-6 flex items-center gap-3 text-white/80">
          <span className="text-sm font-semibold">NextYou&gt;</span>
          <span className="text-xs text-white/60">Ton futur, version toi</span>
        </div>
      )}
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-28 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <motion.h1
            className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-[72px] lg:leading-[0.95]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Découvre <span className="mk-grad-text">NextYou&gt;</span>
          </motion.h1>

          {/* ▼▼▼ DÉBUT DE LA MODIFICATION ▼▼▼ */}
          <div className="mt-6 max-w-2xl space-y-4 text-xl text-[color:var(--mk-sub)]">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.55 }}
            >
              Choisir quoi faire après le bac, c'est comme ouvrir Netflix sans idée : trop de choix,
              zéro aide et tu finis bloqué.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55 }}
            >
              Avec Parcoursup et ses 20 000 formations, c'est encore pire.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.55 }}
            >
              NextYou&gt; combine l'Ikigaï et une IA pour te donner un plan d'action concret, en
              quelques minutes.
            </motion.p>
          </div>
          {/* ▲▲▲ FIN DE LA MODIFICATION ▲▲▲ */}

          <motion.p
            className="mt-4 text-lg font-semibold text-white"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.55 }} // J'ai ajusté le délai ici aussi
          >
            Bref: NextYou&gt; n'est pas un test bidon, c'est la boussole qui t'aide à avancer sans
            stress.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.55 }} // Et ici
          >
            <Link
              href="/sjt"
              className="rounded-xl bg-white px-6 py-3 text-base font-semibold !text-slate-900 shadow-[0_20px_50px_rgba(124,58,237,0.35)] transition hover:translate-y-[-2px] hover:opacity-90"
            >
              Démarrer gratuitement
            </Link>
            <Link
              href="/sweet-spot/lab"
              className="rounded-xl border border-white/20 px-6 py-3 text-base font-semibold text-white/90 transition hover:border-white/40"
            >
              Voir le Lab
            </Link>
          </motion.div>

          <div className="mt-4 text-sm text-[color:var(--mk-sub)]">
            +1 200 profils analyses • Aucune carte requise
          </div>
          <FeatureRow />

          <details className="mt-6 text-sm text-white/80">
            <summary className="underline/30 cursor-pointer text-white/90 hover:underline">
              En savoir plus
            </summary>
            <p className="mt-2 max-w-xl text-white/80">
              NextYou&gt; simplifie Parcoursup: Ikigai + données + IA explicable pour révéler ton
              Sweet Spot avec des convergences puissantes et un plan d'action motivant.
            </p>
          </details>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}
