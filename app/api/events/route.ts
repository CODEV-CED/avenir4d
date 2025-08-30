// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';

// échantillonnage (ex: 50% en dev)
const SAMPLE_RATE = Number(process.env.TELEMETRY_SAMPLE_RATE ?? 0.5);
const PERF_BUCKET_MS = 50;
const PERF_MAX_MS = 5000;

// petits “stores” mémoire (redémarrent à zéro si tu relances `npm run dev`)
const rateHits = new Map<string, number>();
const formationCounts = new Map<
  string,
  { views: number; clicks: number; fb_up: number; fb_down: number }
>();
const perfHist = {
  sorting: new Map<string, number>(),
  render: new Map<string, number>(),
};
const cacheCounts = { hit: 0, miss: 0 };

function bucketize(ms: number) {
  const clamped = Math.max(0, Math.min(PERF_MAX_MS, Math.round(ms)));
  return Math.round(clamped / PERF_BUCKET_MS) * PERF_BUCKET_MS; // 0, 50, 100...
}

export async function POST(req: NextRequest) {
  try {
    if (Math.random() > SAMPLE_RATE) {
      return NextResponse.json({ ok: true, sampledOut: true });
    }

    const body = await req.json();
    const { type, formationId, anonId, meta } = body ?? {};
    if (!type || !anonId) {
      return NextResponse.json({ error: 'bad payload' }, { status: 400 });
    }

    // rate limiting simple (120/min par anonId)
    const minuteKey = `rl:${anonId}:${Math.floor(Date.now() / 60000)}`;
    const hits = (rateHits.get(minuteKey) ?? 0) + 1;
    rateHits.set(minuteKey, hits);
    setTimeout(() => rateHits.delete(minuteKey), 65_000);
    if (hits > 120) {
      return NextResponse.json({ ok: false, rateLimited: true }, { status: 429 });
    }

    // contenu formations
    if (['view', 'click', 'feedback_up', 'feedback_down'].includes(type)) {
      const key = formationId ?? 'none';
      const rec = formationCounts.get(key) ?? { views: 0, clicks: 0, fb_up: 0, fb_down: 0 };
      if (type === 'view') rec.views++;
      if (type === 'click') rec.clicks++;
      if (type === 'feedback_up') rec.fb_up++;
      if (type === 'feedback_down') rec.fb_down++;
      formationCounts.set(key, rec);
      // log sympa en dev
      console.log('[events] formation', key, rec);
      return NextResponse.json({ ok: true });
    }

    // performance
    if (type === 'perf_sorting' || type === 'perf_render') {
      const duration = Number(meta?.duration ?? 0);
      if (Number.isFinite(duration)) {
        const bucket = `b_${bucketize(duration)}`;
        const map = type === 'perf_sorting' ? perfHist.sorting : perfHist.render;
        map.set(bucket, (map.get(bucket) ?? 0) + 1);
      }
      return NextResponse.json({ ok: true });
    }

    // cache
    if (type === 'cache') {
      const outcome = meta?.outcome === 'hit' ? 'hit' : 'miss';
      cacheCounts[outcome as 'hit' | 'miss']++;
      console.log('[events] cache', cacheCounts);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[events] error', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
