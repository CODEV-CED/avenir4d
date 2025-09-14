// components/maps/GoogleMapInline.tsx
// Pas besoin de 'use client' ici (aucun hook). OK en Server ou Client Component.

type Props = {
  query: string; // ex: "IUT Lyon 1, Villeurbanne"
  height?: number; // hauteur en px
  className?: string; // classes utilitaires (bordure, arrondis…)
};

export default function GoogleMapInline({ query, height = 260, className = '' }: Props) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className={`overflow-hidden rounded-2xl border ${className}`} style={{ height }}>
      <iframe
        title="Localisation"
        src={src}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
