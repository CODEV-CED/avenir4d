'use client';

import { useMemo } from 'react';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';
import { GAP, MIN_VIAB, type SliderKey } from '@/store/sliderConstraints';

const KEYS: SliderKey[] = ['passions', 'talents', 'utilite', 'viabilite'];

export default function SliderDebugPanel() {
  const v = useSweetSpotStore((s) => s.sliderValues);
  const set = useSweetSpotStore((s) => s.setSliderValue);
  const score = useSweetSpotStore((s) => s.sweetSpotScore);
  const conv = useSweetSpotStore((s) => s.convergences);

  const { sum, min, max, spread, sumOk, spreadOk, viabOk } = useMemo(() => {
    const vals = [v.passions, v.talents, v.utilite, v.viabilite];
    const s = vals.reduce((a, b) => a + b, 0);
    const mn = Math.min(...vals);
    const mx = Math.max(...vals);
    const sp = mx - mn;
    return {
      sum: s,
      min: mn,
      max: mx,
      spread: sp,
      sumOk: Math.abs(1 - s) <= 1e-6,
      spreadOk: sp <= GAP + 1e-9,
      viabOk: v.viabilite >= MIN_VIAB - 1e-9,
    };
  }, [v]);

  const push = (k: SliderKey, val: number) => set(k, val);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-3 text-sm shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-medium">🔎 Debug Sliders</div>
        <div className="flex gap-2">
          <Badge ok={sumOk} label={`Σ ${sum.toFixed(3)}`} />
          <Badge ok={spreadOk} label={`spread ${spread.toFixed(3)} ≤ ${GAP}`} />
          <Badge ok={viabOk} label={`viab ≥ ${MIN_VIAB}`} />
          <span className="ml-2 text-slate-500">score: {score.toFixed(3)}</span>
          <span className="text-slate-400">/ top conv: {conv?.[0]?.keyword ?? '—'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {KEYS.map((k) => (
          <div key={k} className="rounded-lg border border-slate-200 p-2">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-slate-700 capitalize">{k}</span>
              <span className="tabular-nums">{(v[k] * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-slate-100">
              <div
                className="h-2 rounded bg-slate-900/70"
                style={{ width: `${Math.max(0, Math.min(1, v[k])) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => push('passions', 1)}
          className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50"
        >
          Stress: passions = 1
        </button>
        <button
          onClick={() => push('viabilite', 0.05)}
          className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50"
        >
          Stress: viabilité = 0.05
        </button>
        <button
          onClick={() => push('utilite', 0)}
          className="rounded-md border border-slate-300 px-2 py-1 hover:bg-slate-50"
        >
          Stress: utilité = 0
        </button>
        <span className="ml-auto text-xs text-slate-400">
          tolérance Σ=±1e-6 • GAP={GAP} • MIN_VIAB={MIN_VIAB}
        </span>
      </div>
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        ok
          ? 'border border-emerald-200 bg-emerald-100 text-emerald-700'
          : 'border border-rose-200 bg-rose-100 text-rose-700',
      ].join(' ')}
      title={ok ? 'OK' : 'KO'}
    >
      {ok ? '✔︎' : '✖︎'}&nbsp;{label}
    </span>
  );
}
