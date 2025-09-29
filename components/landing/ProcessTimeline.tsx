import { CheckCircle } from 'lucide-react';

const steps = [
  { title: 'Découverte', desc: 'Comprends qui tu es et ce que tu veux.' },
  { title: 'Test NextYou>', desc: "Passe un test intelligent pour t'orienter." },
  { title: 'Lab Sweet Spot', desc: 'Explore tes convergences perso/pro.' },
  { title: "Plan d'action", desc: 'Repars avec des formations adaptées.' },
];

export default function ProcessTimeline() {
  return (
    <section className="relative overflow-hidden bg-[#05070f] py-20 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute bottom-8 left-12 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute right-10 bottom-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6">
        {' '}
        <h2 className="mb-16 text-left text-3xl font-bold md:text-4xl">
          Ton parcours avec <span className="text-gradient">NextYou&gt;</span>
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {steps.map((step) => (
            <article
              key={step.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(56,189,248,0.12)] transition-transform duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_45px_rgba(139,92,246,0.32)]"
            >
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/80 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative z-10 mb-6 flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-purple-300 transition group-hover:text-sky-300" />
              </div>
              <h3 className="relative z-10 mb-3 text-lg font-semibold text-white">{step.title}</h3>
              <p className="relative z-10 text-sm leading-relaxed text-slate-300">{step.desc}</p>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-sky-400/0 opacity-0 transition group-hover:from-purple-500/10 group-hover:via-purple-500/10 group-hover:to-sky-400/10 group-hover:opacity-100" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
