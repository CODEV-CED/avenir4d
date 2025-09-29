// app/resultats/[id]/page.tsx
import Link from 'next/link';
import { H1, Paragraph } from '@/components/UI/Typography';
import { notFound } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// Next 15: `params` can be a Promise; await it for typed route params
export default async function ResultatProfilPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  type SweetspotProfile = {
    id: string;
    created_at: string;
    survey_version?: string;
    profile4d?: Record<string, number | string>;
    keywords?: Record<string, string[]>;
    qual?: string;
    completion_time_ms?: number;
  };

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from('sweetspot_profiles')
    .select('id, created_at, survey_version, profile4d, keywords, qual, completion_time_ms')
    .eq('id', id)
    .single();

  if (error || !data) return notFound();

  const p4d = (data.profile4d ?? {}) as Record<string, number | string>;
  const rows = [
    { label: 'Plaisir', key: 'plaisir', color: 'bg-fuchsia-500' },
    { label: 'Compétence', key: 'competence', color: 'bg-cyan-400' },
    { label: 'Utilité', key: 'utilite', color: 'bg-lime-400' },
    { label: 'Viabilité', key: 'viabilite', color: 'bg-amber-400' },
  ] as const;

  const pct = (v: unknown) => {
    const n = typeof v === 'number' ? v : 0;
    return Math.round(Math.max(0, Math.min(1, n)) * 100);
  };

  return (
    <main className="mx-auto max-w-4xl p-6 text-white">
      <H1 className="mb-1 text-3xl">Ton profil NextYou&gt;</H1>
      <Paragraph className="mb-6 text-sm text-white/70">
        Profil #{id.slice(0, 8)} • {new Date(data.created_at).toLocaleString()} • source{' '}
        {String(p4d.source ?? data.survey_version ?? 'sjt_v2')}
      </Paragraph>

      {/* Scores 4D */}
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((r) => {
          const value = pct(p4d[r.key]);
          return (
            <div key={r.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex justify-between text-sm text-white/70">
                <span>{r.label}</span>
                <span className="text-white">{value}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10">
                <div className={`h-2 rounded-full ${r.color}`} style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}

        {/* Confiance */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm font-semibold text-white/80">Confiance</div>
          <div className="text-2xl font-bold">
            {p4d.confidence_avg ? `${Math.round(Number(p4d.confidence_avg) * 20)}%` : '—'}
          </div>
          <div className="mt-1 text-xs text-white/60">
            durée:{' '}
            {data.completion_time_ms ? `${Math.round(data.completion_time_ms / 1000)}s` : '—'}
          </div>
        </div>
      </div>

      {/* Keywords */}
      {data.keywords && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 text-sm font-semibold text-white/80">Mots-clés</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.keywords as Record<string, string[]>).flatMap(([k, arr]) =>
              (arr ?? []).map((kw) => (
                <span
                  key={`${k}-${kw}`}
                  className="rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs text-white/80"
                >
                  {kw}
                </span>
              )),
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
        >
          Explorer les formations
        </Link>
        <Link
          href="/voeux"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
        >
          Voir mes vœux
        </Link>
        <Link
          href="/sjt"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10"
        >
          Recalibrer SJT
        </Link>
      </div>
    </main>
  );
}
