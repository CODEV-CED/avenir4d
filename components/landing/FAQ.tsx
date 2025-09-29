'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type QA = { q: string; a: string };

type ItemProps = { q: string; a: string; idx: number };

const ITEMS: QA[] = [
  {
    q: "NextYou> c'est un test d'orientation ?",
    a: "C'est plus qu'un test : on combine un SJT, un Lab interactif et un moteur de convergences (Ikigaï + IA) pour te donner un plan d'action concret.",
  },
  {
    q: 'Combien de temps ça prend ?',
    a: '8 à 12 minutes pour le test enrichi. Le Lab est interactif et tu peux y revenir autant que tu veux.',
  },
  {
    q: 'Que débloque la version Premium ?',
    a: "Le rapport complet, l'animation Eurêka, les recommandations de formations/projets et l'export PDF.",
  },
  {
    q: 'Mes données sont-elles protégées ?',
    a: "Oui. Tes réponses restent privées. Nous n'utilisons aucune donnée sensible sans ton accord.",
  },
];

function Item({ q, a, idx }: ItemProps) {
  const [open, setOpen] = useState(false);
  const id = `faq-${idx}`;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md transition hover:border-white/20">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-white/90 md:text-base">{q}</span>
        <ChevronDown
          className={`h-5 w-5 text-white/60 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={id}
        className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="mt-3 text-sm leading-relaxed text-white/75">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section className="bg-[#05070f] py-16 text-white">
      <div className="mx-auto max-w-4xl px-6">
        <header className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Questions <span className="text-gradient">fréquentes</span>
          </h2>
        </header>
        <div className="space-y-4">
          {ITEMS.map((item, index) => (
            <Item key={index} q={item.q} a={item.a} idx={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
