// components/marketing/FeatureRow.tsx
import * as React from 'react';

/** ---- TON COMPOSANT EXISTANT (on ne touche pas) ---- */
const items = ['Idées de jobs hybrides', 'Ta punchline perso', '3 parcours concrets'];

export default function FeatureRow() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {items.map((label) => (
        <div key={label} className="mk-card flex items-center gap-3 px-4 py-3">
          <div className="h-8 w-8 shrink-0 rounded-full bg-white/12 shadow-inner shadow-black/30" />
          <div className="text-sm font-medium text-white/90">{label}</div>
        </div>
      ))}
    </div>
  );
}

/** ---- NOUVEL EXPORT NOMMÉ : InfoRow (icône + titre + texte) ---- */
export type InfoRowProps = {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'card' | 'plain';
};

export function InfoRow({
  icon: Icon,
  title,
  children,
  className = '',
  variant = 'card',
}: InfoRowProps) {
  const wrap =
    variant === 'card'
      ? 'relative rounded-2xl border border-white/12 bg-white/[0.06] px-3.5 py-3 backdrop-blur-md shadow-sm hover:bg-white/[0.08] transition'
      : 'relative';
  return (
    <div className={`flex items-start gap-3 ${wrap} ${className}`}>
      {/* barre d'accent à gauche (dégradé brand) */}
      {variant === 'card' && (
        <span
          aria-hidden
          className="absolute top-2 bottom-2 left-0.5 w-[3px] rounded-full bg-gradient-to-b from-[#8b5cf6] to-[#38bdf8] opacity-90"
        />
      )}

      {/* pastille icône plus lisible */}
      <span
        aria-hidden
        className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 shadow-inner ring-1 shadow-black/30 ring-white/20"
      >
        <Icon className="h-4 w-4 text-white" />
      </span>

      <div>
        <div className="text-sm leading-tight font-semibold text-white">{title}</div>
        <p className="text-[13px] leading-relaxed text-white/90">{children}</p>
      </div>
    </div>
  );
}
