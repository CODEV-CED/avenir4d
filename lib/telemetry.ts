// /lib/telemetry.ts
const isBrowser = () => typeof window !== 'undefined';

// Respecte le DNT du navigateur
function shouldTrack() {
  if (!isBrowser()) return false;
  const n: any = navigator;
  return !(n.doNotTrack === '1' || n.msDoNotTrack === '1' || (window as any).doNotTrack === '1');
}

// ID anonyme stocké en localStorage (par session durable)
const ANON_KEY = 'a4d:anon';
function anonId(): string | null {
  if (!isBrowser() || !shouldTrack()) return null;
  try {
    let id = localStorage.getItem(ANON_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(ANON_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

type EventType =
  | 'view'
  | 'click'
  | 'feedback_up'
  | 'feedback_down'
  | 'perf_sorting'
  | 'perf_render';

type Meta = Record<string, unknown>;

// petit échantillonnage pour éviter le bruit
const SAMPLE_RATE = 0.4;

async function send(type: EventType, formationId?: string, meta?: Meta) {
  if (!isBrowser() || !shouldTrack()) return;
  if (Math.random() > SAMPLE_RATE) return;

  const id = anonId();
  if (!id) return;

  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ type, formationId, anonId: id, meta }),
    });
  } catch {
    // silencieux
  }
}

// API “haut niveau”
export const telemetry = {
  view: (formationId: string) => send('view', formationId),
  click: (formationId: string) => send('click', formationId),
  feedbackUp: (formationId: string) => send('feedback_up', formationId),
  feedbackDown: (formationId: string) => send('feedback_down', formationId),
};

// API perf utilisée par lib/matching.ts
export const perf = {
  sortingTime: (ms: number) => send('perf_sorting', undefined, { duration: Math.round(ms) }),
  renderTime: (ms: number) => send('perf_render', undefined, { duration: Math.round(ms) }),
};

// utilitaire si besoin pour “oublier” l’utilisateur anonyme
export function resetTelemetrySession() {
  if (isBrowser()) localStorage.removeItem(ANON_KEY);
}
