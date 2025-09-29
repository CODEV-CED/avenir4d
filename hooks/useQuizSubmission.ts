'use client';
import { useCallback, useState } from 'react';
import { buildSJTSubmitPayload } from '@/lib/sweetspot/buildSJTSubmitPayload';

type SubmitResult =
  | { ok: true; data: any }
  | { ok: false; message?: string; fieldErrors?: Record<string, string> };

type Options = {
  getAnswers: () => { questionId: string; answer: string | number }[]; // ← fournis par ton composant
  getProfile4D: () => {
    plaisir: number | string;
    competence: number | string;
    utilite: number | string;
    viabilite: number | string;
    confidence_avg?: number | string;
    version?: number | string;
  };
  getQual: () => {
    dimancheMatin: string;
    algoPersonnel: string;
    talentReconnu: string;
    indignationMax: string;
  };
  getKeywords?: () => {
    passions?: string[];
    talents?: string[];
    utilite?: string[];
    viabilite?: string[];
  };
  idempotencyKey?: string;
  onSuccess?: (data: any) => void;
  onError?: (err: unknown) => void;
};

export function useQuizSubmission(opts: Options) {
  const { getAnswers, getProfile4D, getQual, getKeywords, idempotencyKey, onSuccess, onError } =
    opts;
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuiz = useCallback(async (): Promise<SubmitResult> => {
    if (loading || isSubmitting) return { ok: false };

    setLoading(true);
    setIsSubmitting(true);

    try {
      // 1) Construire & valider côté client
      const built = buildSJTSubmitPayload({
        answers: getAnswers(),
        profile4d: getProfile4D(),
        qual: getQual(),
        keywords: getKeywords?.(),
        idempotencyKey: idempotencyKey,
      });

      if (!built.ok) {
        return {
          ok: false,
          message: 'Veuillez corriger les champs indiqués.',
          fieldErrors: built.fieldErrors,
        };
      }

      // 2) Envoyer
      // Use relative path to avoid origin mismatches in dev/proxy setups
      const url = `/api/sjt/submit`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials utile si tu relies l’auth (cookies)
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify(built.payload),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        const message =
          data?.error ||
          data?.message ||
          (res.status === 422 ? 'Veuillez corriger les champs indiqués.' : `Erreur ${res.status}`);
        onError?.(new Error(message));
        return { ok: false, message, fieldErrors: data?.fieldErrors || data?.details };
      }

      onSuccess?.(data);
      return { ok: true, data };
    } catch (err) {
      console.error('useQuizSubmission error:', err);
      onError?.(err);
      if (err instanceof TypeError && /Failed to fetch/i.test(err.message)) {
        return {
          ok: false,
          message: 'Connexion impossible au serveur. Vérifie que l’app tourne et l’URL.',
        };
      }
      return { ok: false, message: 'Erreur réseau/serveur.' };
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  }, [
    getAnswers,
    getProfile4D,
    getQual,
    getKeywords,
    idempotencyKey,
    loading,
    isSubmitting,
    onError,
    onSuccess,
  ]);

  return { submitQuiz, loading, isSubmitting };
}
