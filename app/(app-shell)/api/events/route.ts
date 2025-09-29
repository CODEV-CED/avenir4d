// /app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// --- Compteurs en mémoire (dev) ---
const counters = {
  formation: new Map<string, { views: number; clicks: number; fb_up: number; fb_down: number }>(),
  perf: {
    sorting: new Map<number, number>(), // bucket(ms) -> count
    render: new Map<number, number>(),
  },
};

// --- Rate limiting basique (par minute) ---
const rl = new Map<string, { ts: number; hits: number }>();
const LIMIT_PER_MIN = 120;

function rateLimited(anonId: string) {
  const now = Date.now();
  const key = `${anonId}:${Math.floor(now / 60000)}`;
  const entry = rl.get(key);
  if (!entry) {
    rl.set(key, { ts: now, hits: 1 });
    return false;
  }
  entry.hits++;
  return entry.hits > LIMIT_PER_MIN;
}

// Bucket perf (50ms)
function bucket(ms: number) {
  const PERF_BUCKET_MS = 50;
  const clamped = Math.max(0, Math.min(5000, Math.round(ms)));
  return Math.round(clamped / PERF_BUCKET_MS) * PERF_BUCKET_MS;
}

// --- POST: ingestion d'événements ---
export async function POST(req: NextRequest) {
  try {
    const { type, formationId, anonId, meta } = await req.json();
    if (!anonId || typeof type !== 'string') {
      return NextResponse.json({ error: 'bad payload' }, { status: 400 });
    }
    if (rateLimited(anonId)) {
      return NextResponse.json({ ok: false, rateLimited: true }, { status: 429 });
    }

    if (['view', 'click', 'feedback_up', 'feedback_down'].includes(type)) {
      const key = formationId || 'none';
      const row = counters.formation.get(key) || { views: 0, clicks: 0, fb_up: 0, fb_down: 0 };
      if (type === 'view') row.views++;
      if (type === 'click') row.clicks++;
      if (type === 'feedback_up') row.fb_up++;
      if (type === 'feedback_down') row.fb_down++;
      counters.formation.set(key, row);
      return NextResponse.json({ ok: true });
    }

    if (type === 'perf_sorting' || type === 'perf_render') {
      const d = Number(meta?.duration ?? 0);
      if (Number.isFinite(d)) {
        const b = bucket(d);
        const map = type === 'perf_sorting' ? counters.perf.sorting : counters.perf.render;
        map.set(b, (map.get(b) || 0) + 1);
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

// --- GET: snapshot pour /admin/events ---
export async function GET() {
  const formation = Array.from(counters.formation.entries()).map(([id, r]) => ({
    id,
    ...r,
    total: r.views + r.clicks + r.fb_up + r.fb_down,
  }));

  const perfSorting = Array.from(counters.perf.sorting.entries())
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((a, b) => a.bucket - b.bucket);

  const perfRender = Array.from(counters.perf.render.entries())
    .map(([bucket, count]) => ({ bucket, count }))
    .sort((a, b) => a.bucket - b.bucket);

  const totals = {
    formation: formation.reduce(
      (acc, r) => {
        acc.views += r.views;
        acc.clicks += r.clicks;
        acc.fb_up += r.fb_up;
        acc.fb_down += r.fb_down;
        acc.total += r.total;
        return acc;
      },
      { views: 0, clicks: 0, fb_up: 0, fb_down: 0, total: 0 },
    ),
    perf: {
      sorting: perfSorting.reduce((s, r) => s + r.count, 0),
      render: perfRender.reduce((s, r) => s + r.count, 0),
    },
  };

  return NextResponse.json({ formation, perfSorting, perfRender, totals }, { status: 200 });
}

// --- DELETE: reset (utile en dev) ---
export async function DELETE() {
  counters.formation.clear();
  counters.perf.sorting.clear();
  counters.perf.render.clear();
  return NextResponse.json({ ok: true, reset: true });
}
