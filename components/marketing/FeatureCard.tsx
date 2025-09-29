import type { ReactNode } from "react";

export default function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: ReactNode }) {
  return (
    <article className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(56,189,248,0.12)] transition-transform duration-300 hover:-translate-y-2 hover:scale-105 hover:shadow-[0_0_45px_rgba(139,92,246,0.32)]">
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative z-10 mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-purple-500/30 bg-white/10 text-white transition-colors duration-300 group-hover:border-sky-300/60 group-hover:text-sky-200">
        {icon}
      </div>
      <h3 className="relative z-10 text-lg font-semibold text-white">{title}</h3>
      <p className="relative z-10 mt-3 text-sm leading-relaxed text-slate-300">{desc}</p>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-sky-400/0 opacity-0 transition duration-300 group-hover:opacity-100 group-hover:from-purple-500/10 group-hover:via-purple-500/10 group-hover:to-sky-400/10" />
    </article>
  );
}
