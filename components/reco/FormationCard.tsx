'use client';
import Link from 'next/link';

export type FormationCardProps = {
  id: string;
  title: string;
  type: string;
  school?: string;
  city?: string;
  tags: string[];
  score?: number;
  inWishlist?: boolean;
  wishlistLimit?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  onVote?: (v: 'up' | 'down') => void | Promise<void>;
};

export function FormationCard(props: FormationCardProps) {
  const {
    id,
    title,
    type,
    school = '',
    city = '',
    tags,
    score = 0,
    inWishlist,
    wishlistLimit,
    onAdd,
    onRemove,
    onVote,
  } = props;

  return (
    <article className="ny-card p-4 sm:p-5">
      {/* En-tête */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="ny-badge">{type}</span>
          <span className="ny-chip">Pertinence {Math.round(score * 100)}%</span>
        </div>

        <div className="flex items-center gap-2">
          {inWishlist ? (
            <button onClick={onRemove} className="ny-btn ny-btn-ghost">
              Retirer
            </button>
          ) : (
            <button
              onClick={onAdd}
              disabled={!!wishlistLimit}
              className="ny-btn ny-btn-primary disabled:opacity-50"
            >
              {wishlistLimit ? 'Limite atteinte' : 'Ajouter'}
            </button>
          )}
          <Link href={`/formations/${id}`} className="ny-btn ny-btn-ghost">
            Détails
          </Link>
        </div>
      </div>

      {/* Titre + sous-titre */}
      <h3 className="text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-0.5 text-sm text-[var(--ny-subtext)]">
        {school}
        {school && city ? ' • ' : ''}
        {city}
      </p>

      {/* Tags */}
      {tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 10).map((t, i) => (
            <span key={t + i} className="ny-chip">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Feedback */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-[var(--ny-subtext)]">Cette recommandation :</span>
        <button
          onClick={() => onVote?.('up')}
          className="ny-chip hover:border-white/20 hover:text-white"
        >
          👍 Pertinente
        </button>
        <button
          onClick={() => onVote?.('down')}
          className="ny-chip hover:border-white/20 hover:text-white"
        >
          👎 Pas pertinente
        </button>
      </div>
    </article>
  );
}
