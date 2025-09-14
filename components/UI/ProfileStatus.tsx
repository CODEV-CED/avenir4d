import { useRouter } from 'next/navigation';

interface ProfileStatusBannerProps {
  className?: string;
}

export function ProfileStatusBanner({ className = '' }: ProfileStatusBannerProps) {
  // TODO: wire to profile freshness selector if/when available
  const shouldSuggestUpdate = false;
  const ageLabel = '';
  const router = useRouter();

  if (!shouldSuggestUpdate) return null;

  return (
    <div className={`rounded-lg border border-amber-200 bg-amber-50 p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔄</span>
          <div>
            <h3 className="text-sm font-medium text-amber-900">Profil à rafraîchir</h3>
            <p className="mt-1 text-sm text-amber-700">
              Ton profil date de {ageLabel}. Veux-tu l'affiner pour des recommandations encore plus
              précises ?
            </p>
          </div>
        </div>
        <button
          onClick={() => router.push('/sjt')}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
        >
          Repasser le test
        </button>
      </div>
    </div>
  );
}

export function ProfileAgePill({ className = '' }: { className?: string }) {
  // Placeholder pill hidden until freshness data available
  const ageLabel = '';
  const lastUpdatedDate = undefined as Date | undefined;
  const isProfileFresh = false;

  if (!ageLabel || !lastUpdatedDate) return null;

  const pillColor = isProfileFresh
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-amber-100 text-amber-700 border-amber-200';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${pillColor} ${className}`}
      title={`Dernière mise à jour: ${lastUpdatedDate.toLocaleString('fr-FR')}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      Mis à jour {ageLabel}
    </span>
  );
}

export function ProfileErrorToast({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  if (!error) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 max-w-sm rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <span className="text-lg text-red-500">⚠️</span>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-red-900">Erreur</h4>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-400 transition-colors hover:text-red-600"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
