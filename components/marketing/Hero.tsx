'use client';
import { motion } from 'framer-motion';
import AnimatedGradientBG from './AnimatedGradientBG';
import OrganicBlob from './OrganicBlob';
import ChevronMark from './ChevronMark';

type HeroProps = {
  showMiniBrand?: boolean;
};

export default function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-20">
      <AnimatedGradientBG variant="left-only" />
      <OrganicBlob />

      <div className="relative flex flex-col items-center justify-between gap-10 md:flex-row">
        {/* Colonne gauche : texte */}
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white md:text-7xl">
            Découvre{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
              NextYou&gt;
            </span>
          </h1>

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
              NextYou&gt; combine l'Ikigaï et une IA pour te donner un plan d'action concret en
              quelques minutes.
            </motion.p>
          </div>
          {/* ▲▲▲ FIN DE LA MODIFICATION ▲▲▲ */}

          <motion.div
            className="mt-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.55 }}
          >
            <div className="text-[clamp(40px,5.2vw,56px)] leading-none font-extrabold text-white drop-shadow-[0_0_10px_rgba(255,255,255,.18)]">
              Bref.
            </div>

            {/* Barre blanche avec dégradé, comme avant */}
            <div className="mt-1 h-[2px] w-16 bg-gradient-to-r from-white via-white/70 to-transparent opacity-90 [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.28))]" />

            <p className="mt-2 max-w-2xl text-[18px] leading-relaxed text-white">
              NextYou&gt; ce n'est pas un test bidon, c'est la boussole qui t'aide à avancer sans
              stress.
            </p>
          </motion.div>
        </div>

        {/* Colonne droite : chevron animé (marque) */}
        <div className="-mt-6 flex w-full justify-center overflow-visible md:-mt-12 md:w-1/2 md:justify-end md:pr-6 lg:pr-8 xl:pr-10">
          <ChevronMark />
        </div>
      </div>
    </section>
  );
}
