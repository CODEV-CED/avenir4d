// components/sweet-spot/utils/telemetry.ts
export async function trackEvent(event: string, data?: Record<string, any>): Promise<void> {
  try {
    await fetch('/api/sweetspot/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        ...data,
        // côté client: pas besoin d'IP/userAgent, la route le fait déjà
      }),
      cache: 'no-store',
      keepalive: true,
    });
  } catch {
    // on ne casse jamais l'UI pour de la télémétrie
  }
}
