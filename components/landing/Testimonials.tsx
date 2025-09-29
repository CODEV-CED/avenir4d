'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

type Testimonial = {
  name: string;
  role: string;
  quote: string;
  avatar?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

type Props = {
  title?: string;
  subtitle?: string;
  items?: Testimonial[];
  className?: string;
};

const DEFAULTS: Testimonial[] = [
  {
    name: 'Lina, 17 ans',
    role: 'Terminale - Spe Maths',
    quote:
      "J'étais perdue avec Parcoursup. En 8 minutes, j'ai compris mes forces et surtout quoi faire après. Le moment Eureka est réel.",
    rating: 5,
  },
  {
    name: 'Adam, 18 ans',
    role: 'Bac Pro SN',
    quote:
      "Le Lab m'a montré une idée de projet mêlant audio + IA. Je savais pas que c'était 'un métier'. Ça motive fort.",
    rating: 5,
  },
  {
    name: 'Sarah, 16 ans',
    role: 'Premiere - STI2D',
    quote:
      "Les sliders + l'animation m'ont aidée à visualiser mon Ikigaï. C'est pas un test bidon, c'est une boussole.",
    rating: 4,
  },
  {
    name: 'Yanis, 17 ans',
    role: 'Terminale - Spe Physique',
    quote:
      "Les convergences clés s'affichent direct. J'ai partagé à mes potes : on a tous eu un plan d'action différent.",
    rating: 5,
  },
];

const Stars = ({ n = 5 }: { n?: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < n ? 'text-amber-300' : 'text-white/20'}
        fill={i < n ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
    ))}
  </div>
);

export default function Testimonials({
  title = 'Ils ont testé NextYou>',
  subtitle = 'Des lycéens bloqués -> un plan clair en quelques minutes.',
  items = DEFAULTS,
  className = '',
}: Props) {
  return (
    <section className={`relative overflow-hidden bg-[#05070f] py-20 text-white ${className}`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-1/3 right-16 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <header className="mb-12 text-center md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {title.replace('NextYou>', '')}
            <span className="text-gradient"> NextYou&gt;</span>
          </h2>
          <p className="mt-4 text-sm text-white/70 md:text-base">{subtitle}</p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, idx) => (
            <motion.article
              key={`${t.name}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(56,189,248,0.12)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_45px_rgba(139,92,246,0.32)]"
            >
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <Quote className="absolute top-4 right-4 h-5 w-5 text-white/20" aria-hidden="true" />

              <p className="text-sm leading-relaxed text-slate-200 md:text-base">"{t.quote}"</p>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {t.avatar ? (
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80">
                      {t.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-white/60">{t.role}</div>
                  </div>
                </div>
                {typeof t.rating === 'number' && <Stars n={t.rating} />}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
