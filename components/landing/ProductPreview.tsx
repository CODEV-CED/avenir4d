'use client';
import HeroVisual from '@/components/landing/HeroVisual';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import { Sparkles, Layers, Sliders } from 'lucide-react';
import { InfoRow } from '@/components/marketing/FeatureRow';

const DIM = [
  { key: 'passions', label: 'Passions', color: '#ef4444' }, // 🔴
  { key: 'talents', label: 'Talents', color: '#22c55e' }, // 🟢
  { key: 'utilite', label: 'Utilité', color: '#3b82f6' }, // 🔵
  { key: 'viabilite', label: 'Viabilité', color: '#eab308' }, // 🟡
];

export default function ProductPreview() {
  const { sliderValues } = useSweetSpotStore();
  const sliders = DIM.map((d) => ({
    ...d,
    val: Math.round(((sliderValues as any)?.[d.key] ?? 0.75) * 100),
  }));

  // Réglages simples
  const CARD_MAX_W = 560;
  const CARD_MIN_H = 520;
  const HV_WRAP = 340; // taille du groupe de cercles
  const HV_DIAM = 220; // diamètre d’un cercle
  const HV_OFFSET = 68; // distance entre centres

  return (
    <section className="bg-background relative py-24">
      {/* fond discret */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(60% 60% at 80% 20%, rgba(56,189,248,.10) 0%, rgba(139,92,246,.16) 35%, rgba(0,0,0,0) 70%)',
        }}
      />

      {/* ✅ garde les 2 colonnes DANS la même grille */}
      <div className="mx-auto grid max-w-6xl grid-cols-12 items-start gap-x-8 gap-y-12 px-6">
        {/* Colonne gauche */}
        <div className="order-2 col-span-12 lg:order-1 lg:col-span-5">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Aperçu du <span className="text-gradient">Sweet Spot Lab</span>
          </h2>

          <DefinitionStrip className="mt-3" />

          <div className="mt-4 space-y-2 leading-relaxed text-gray-300">
            <p>
              Ton Sweet Spot, c’est l’endroit où tes passions, tes talents, tes envies et ce qui est
              réaliste pour toi se rencontrent.
            </p>
            <p>Ici, tu vois direct ce qui fait tilt chez toi.</p>
            <p>
              En 3 secondes tu vois ton profil… et ton score clignote quand tu tapes dans le mille.
            </p>
          </div>

          {/* ✅ une seule version : InfoRow avec icônes */}
          <div className="mt-6 space-y-4">
            <InfoRow icon={Sparkles} title="Moment Eurêka ✨">
              Quand ton score dépasse 70%, les anneaux s’illuminent : c’est le déclic.
            </InfoRow>
            <InfoRow icon={Layers} title="Convergences visibles">
              Quand tes forces se superposent, les couleurs s’entrecroisent et ton Sweet Spot
              apparaît.
            </InfoRow>
            <InfoRow icon={Sliders} title="Ajuste en temps réel">
              Chaque choix que tu fais ajuste direct ton profil sur les 4 axes.
            </InfoRow>
          </div>
        </div>

        {/* Colonne droite — CARD DEMO */}
        <div className="order-1 col-span-12 lg:order-2 lg:col-span-7">
          <div className="relative lg:sticky lg:top-20 lg:self-start">
            <div
              className="relative mx-auto w-full overflow-hidden rounded-[18px] border border-white/12 bg-white/[0.04] p-4 shadow-2xl backdrop-blur-md"
              style={{ maxWidth: CARD_MAX_W }}
            >
              {/* Header */}
              <div className="mb-3 flex items-center justify-between px-4 pt-3">
                <span className="text-xs tracking-wide text-white/60">Sweet Spot Lab</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
                  demo
                </span>
              </div>

              {/* Contenu : sliders TOP-RIGHT + visuel BOTTOM-LEFT */}
              <div
                className="relative rounded-[14px] bg-gradient-to-b from-black/20 to-black/0"
                style={{ minHeight: CARD_MIN_H }}
              >
                {/* Sliders TOP-RIGHT (avec puces) */}
                <div
                  className="absolute top-5 right-5 w-56 space-y-2"
                  style={
                    {
                      ['--slider-progress' as any]: 'linear-gradient(to right, #8b5cf6, #38bdf8)',
                    } as React.CSSProperties
                  }
                >
                  {sliders.map((s) => (
                    <div key={s.label}>
                      <div className="mb-1 flex items-center justify-between text-[11px] text-white/80">
                        <span className="flex items-center gap-2 truncate">
                          <span
                            aria-hidden
                            className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white/30"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.label}
                        </span>
                        <span className="tabular-nums">{s.val}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${s.val}%`, background: 'var(--slider-progress)' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visuel BOTTOM-LEFT (unique) */}
                <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
                  <HeroVisual mode="demo" wrap={HV_WRAP} diam={HV_DIAM} offset={HV_OFFSET} />
                </div>
              </div>
              {/* Fin contenu */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** ---------- Barre définition ---------- */
function DefinitionStrip({ className = '' }: { className?: string }) {
  const chips = [
    { label: 'Passions', color: '#ef4444' },
    { label: 'Talents', color: '#22c55e' },
    { label: 'Utilité', color: '#3b82f6' },
    { label: 'Viabilité', color: '#eab308' },
  ];
  return (
    <div className={`flex flex-wrap items-center gap-2 text-[13px] text-white/90 ${className}`}>
      {chips.map((c) => (
        <span
          key={c.label}
          className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-2 py-1 ring-1 ring-white/10"
        >
          <span
            className="h-2.5 w-2.5 rounded-full ring-1 ring-white/30"
            style={{ backgroundColor: c.color }}
          />
          {c.label}
        </span>
      ))}
      <span className="opacity-60">=</span>
      <span className="rounded-full bg-white/10 px-2 py-1 ring-1 ring-white/10">
        Ton Sweet Spot
      </span>
    </div>
  );
}
