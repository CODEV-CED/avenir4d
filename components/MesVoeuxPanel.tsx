'use client';
import Link from 'next/link';
import { useVoeux } from '@/lib/voeux';

export function MesVoeuxPanel({
  formationsAll,
}: {
  formationsAll: Array<{
    id: string;
    nom: string;
    type: string;
    etablissement?: string;
    ville?: string;
  }>;
}) {
  const { ids, remove, max = 6 } = useVoeux();
  const lookup = new Map(formationsAll.map((f) => [f.id, f]));

  return (
    <aside className="ny-card sticky top-6 h-fit p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="ny-section-title">Mes vœux</h3>
        <span className="ny-chip">
          {ids.length}/{max}
        </span>
      </div>

      <ol className="space-y-2">
        {ids.map((id, idx) => {
          const f = lookup.get(id);
          return (
            <li
              key={id}
              className="flex items-start gap-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-muted)] px-3 py-2"
            >
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ny-indigo)] text-xs font-bold text-white select-none">
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="font-semibold">{f?.nom ?? id}</div>
                <div className="text-xs text-[var(--ny-subtext)]">
                  {f ? `${f.type} • ${f.etablissement ?? '—'} • ${f.ville ?? '—'}` : '—'}
                </div>
              </div>
              <button onClick={() => remove?.(id)} className="ny-chip hover:text-white">
                ×
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex items-center justify-between">
        <Link href="/voeux" className="ny-btn ny-btn-primary">
          Voir la fiche vœux
        </Link>
        {/* petit copier profil ? garde-le si tu l’utilises */}
      </div>
    </aside>
  );
}
