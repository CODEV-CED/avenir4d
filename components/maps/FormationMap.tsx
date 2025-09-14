// components/maps/FormationMap.tsx

type GeoJSONPoint = { type: 'Point'; coordinates: [number, number] }; // [lng, lat]

type FormationMapProps = {
  /** Chaîne toute faite si tu veux forcer la recherche (ex: "IUT Paris Rives de Seine, Paris"). */
  query?: string;
  /** Sinon on compose automatiquement la query à partir de ces champs. */
  etablissement?: string;
  ville?: string;
  code_postal?: string;

  /** Optionnel : coordonnées si disponibles. Accepte GeoJSON [lng, lat] ou tuple [lng, lat]. */
  coordinates?: GeoJSONPoint | [number, number];

  /** Apparence */
  height?: number; // px
  className?: string; // classes utilitaires
  zoom?: number; // utilisé si coordinates fourni (par défaut 13)
};

function buildSrc({
  query,
  etablissement,
  ville,
  code_postal,
  coordinates,
  zoom = 13,
}: Omit<FormationMapProps, 'height' | 'className'>) {
  // Case 1: coordonnées (prend le dessus si présentes)
  if (coordinates) {
    const arr = Array.isArray(coordinates)
      ? coordinates
      : (coordinates as GeoJSONPoint).coordinates;

    const [lng, lat] = arr; // GeoJSON = [lng, lat]
    const q = `${lat},${lng}`;
    // `q=` suffit pour centrer/marker, z=zoom
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=${zoom}&output=embed`;
  }

  // Case 2: query explicite
  if (query && query.trim().length > 0) {
    return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  // Case 3: on compose depuis les champs fournis
  const composed = [etablissement, ville, code_postal, 'France'].filter(Boolean).join(', ');

  return `https://www.google.com/maps?q=${encodeURIComponent(composed)}&output=embed`;
}

export default function FormationMap({
  query,
  etablissement,
  ville,
  code_postal,
  coordinates,
  height = 320,
  className = '',
  zoom,
}: FormationMapProps) {
  const src = buildSrc({ query, etablissement, ville, code_postal, coordinates, zoom });

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-black/10 ${className}`}
      style={{ height }}
    >
      <iframe
        title="Localisation de la formation"
        src={src}
        width="100%"
        height="100%"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
