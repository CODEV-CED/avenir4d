// components/ui/NextYouCard.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Plus, Check, ThumbsUp, ThumbsDown, ExternalLink, School2 } from 'lucide-react';

type Props = {
  id: string;
  title: string; // ex: "BUT Informatique"
  subtitle?: string; // ex: "IUT Paris Rives de Seine • Paris"
  typeBadge?: string; // ex: "BUT", "BTS", ...
  tags?: string[]; // ex: ["algorithmique","projets","code"]
  score?: number; // 0..1 ou 0..100 (auto-normalisé en %)
  href?: string; // lien vers page détail
  inWishlist?: boolean; // true => bouton 'Retirer'
  wishlistLimit?: boolean; // true => 'Ajouter' désactivé
  onAdd?: (id: string) => void;
  onRemove?: (id: string) => void;
  onVote?: (id: string, v: 'up' | 'down') => void;
  imageUrl?: string; // optionnel (cover)
  className?: string;
};

export default function NextYouCard({
  id,
  title,
  subtitle,
  typeBadge,
  tags = [],
  score,
  href,
  inWishlist,
  wishlistLimit,
  onAdd,
  onRemove,
  onVote,
  imageUrl,
  className,
}: Props) {
  // Normalisation score -> %
  const pct = React.useMemo(() => {
    if (score == null) return undefined;
    const v = score <= 1 ? score * 100 : score;
    return Math.max(0, Math.min(100, Math.round(v)));
  }, [score]);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (href) {
      return (
        <Link
          href={href}
          className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/70"
        >
          {children}
        </Link>
      );
    }
    return <>{children}</>;
  };

  return (
    <Wrapper>
      <article
        className={[
          'relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur',
          'p-4 transition duration-200 hover:translate-y-[-1px] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_60px_-20px_rgba(120,60,255,0.35)] sm:p-5',
          'before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl',
          'before:bg-[radial-gradient(1200px_280px_at_10%_-20%,rgba(147,51,234,0.18),transparent),radial-gradient(800px_200px_at_90%_-30%,rgba(59,130,246,0.14),transparent)]',
          className || '',
        ].join(' ')}
      >
        {/* Cover optionnelle */}
        {imageUrl && (
          <div className="mb-3 overflow-hidden rounded-xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={title} className="h-32 w-full object-cover opacity-90" />
          </div>
        )}

        {/* Top row: badge type + score + external */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ny-muted,#1b1b24)] text-fuchsia-300">
              <School2 size={16} />
            </div>
            {typeBadge && (
              <span className="rounded-md border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-[2px] text-xs font-semibold text-fuchsia-200">
                {typeBadge}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {typeof pct === 'number' && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-[3px] text-xs text-white/80">
                <span
                  className="inline-flex h-2 w-2 rounded-full"
                  style={{ background: pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444' }}
                />
                {pct}% match
              </span>
            )}
            {href && <ExternalLink size={16} className="text-white/50" />}
          </div>
        </div>

        {/* Title & subtitle */}
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 6).map((t) => (
              <span
                key={t}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-[2px] text-xs text-white/70"
              >
                {t}
              </span>
            ))}
            {tags.length > 6 && (
              <span className="rounded-md border border-white/10 bg-white/5 px-2 py-[2px] text-xs text-white/50">
                +{tags.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {!inWishlist ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onAdd?.(id);
              }}
              disabled={wishlistLimit}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600/90 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-40"
            >
              <Plus size={16} /> Ajouter
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onRemove?.(id);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              <Check size={16} /> Dans mes vœux
            </button>
          )}

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-label="Pertinent"
              onClick={(e) => {
                e.preventDefault();
                onVote?.(id, 'up');
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15"
              title="Pertinent 👍"
            >
              <ThumbsUp size={16} />
            </button>
            <button
              type="button"
              aria-label="Pas pertinent"
              onClick={(e) => {
                e.preventDefault();
                onVote?.(id, 'down');
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15"
              title="Pas pertinent 👎"
            >
              <ThumbsDown size={16} />
            </button>
          </div>
        </div>
      </article>
    </Wrapper>
  );
}
