// components/sweet-spot/hooks/useSweetSpotWorker.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SliderValues, UserKeywords, WorkerResult } from '../utils/sweetspot-calculations';
import { calculateSweetSpotSync } from '../utils/sweetspot-calculations';

export function useSweetSpotWorker(
  sliders: SliderValues,
  keywords: UserKeywords,
  tags: string[],
  mode: 'union' | 'intersection',
  enabled = true,
) {
  const supported = typeof window !== 'undefined' && 'Worker' in window;
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<WorkerResult | null>(null);

  const readyRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);
  const lastMessageTime = useRef(0);
  const MIN_MESSAGE_INTERVAL = 100;

  // NB: chemin depuis /components/sweet-spot/hooks vers /components/sweet-spot/workers
  const workerUrl = useMemo(
    () => (supported ? new URL('../workers/sweetspot.worker.ts', import.meta.url) : null),
    [supported],
  );

  // Instanciation / teardown du worker (si support + enabled)
  useEffect(() => {
    if (!supported || !enabled || !workerUrl) return;

    if (!workerRef.current) {
      workerRef.current = new Worker(workerUrl, { type: 'module' });

      workerRef.current.onmessage = (e: MessageEvent<any>) => {
        const msg = e.data;
        if (msg?.type === 'PONG') {
          readyRef.current = true;
          return;
        }
        if (msg?.type === 'PRECOMPUTE_RESULT') {
          setData(msg.payload as WorkerResult);
          setBusy(false);
        }
      };

      // ping initial
      workerRef.current.postMessage({ type: 'PING' });
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      readyRef.current = false;
    };
  }, [supported, enabled, workerUrl]);

  // Fallback synchrone si pas de Worker (SSR / vieux navigateurs)
  useEffect(() => {
    if (supported || !enabled || typeof window === 'undefined') return;

    setBusy(true);

    // Polyfill local sans toucher aux types globaux
    const hasRIC = typeof (window as any).requestIdleCallback === 'function';
    const schedule = (cb: () => void): number =>
      hasRIC ? (window as any).requestIdleCallback(cb) : window.setTimeout(cb, 0);
    const cancel = (id: number) =>
      hasRIC ? (window as any).cancelIdleCallback(id) : window.clearTimeout(id);

    const id = schedule(() => {
      const result = calculateSweetSpotSync(sliders, keywords, tags, mode);
      setData(result);
      setBusy(false);
    });

    return () => cancel(id);
  }, [supported, enabled, sliders, keywords, tags, mode]);

  // Envoi throttlé des demandes au worker
  useEffect(() => {
    if (!supported || !enabled || !workerRef.current || !readyRef.current) return;

    const now = Date.now();
    if (now - lastMessageTime.current < MIN_MESSAGE_INTERVAL) return;
    lastMessageTime.current = now;

    setBusy(true);
    workerRef.current.postMessage({
      type: 'PRECOMPUTE',
      payload: { sliders, keywords, tags, mode },
    });
  }, [supported, enabled, sliders, keywords, tags, mode]);

  // Recalcul manuel (exposé à l’UI)
  const recalculate = useCallback(() => {
    if (supported && enabled && workerRef.current && readyRef.current) {
      setBusy(true);
      workerRef.current.postMessage({
        type: 'PRECOMPUTE',
        payload: { sliders, keywords, tags, mode },
      });
    } else if (!supported && enabled) {
      const result = calculateSweetSpotSync(sliders, keywords, tags, mode);
      setData(result);
    }
  }, [supported, enabled, sliders, keywords, tags, mode]);

  // Cleanup des données si disabled
  useEffect(() => {
    if (!enabled) {
      setData(null);
      setBusy(false);
    }
  }, [enabled]);

  return { supported, busy, data, recalculate };
}
