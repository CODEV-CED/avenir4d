'use client';
import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQuizSubmission } from '@/hooks/useQuizSubmission';

import { Question } from '@/lib/sjt/types';

export default function SJTQuizAdvanced({
  questions,
}: {
  questions: import('@/lib/sjt/types').Question[];
}) {
  const router = useRouter();
  const [idemKey] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // EXEMPLES de states à adapter :
  // const qcmAnswers = useSomething(); // { [questionId]: number|string }
  // const qual = { dimancheMatin, algoPersonnel, talentReconnu, indignationMax };
  // const profile4d = { plaisir, competence, utilite, viabilite, confidence_avg, version };

  const getAnswers = useCallback(
    () =>
      questions
        .map((q) => ({ questionId: q.id, answer: /* récupérer la réponse pour q.id */ 2 }))
        .filter((a) => a.answer !== undefined && a.answer !== null),
    [questions],
  );

  const getProfile4D = useCallback(
    () => ({
      plaisir: 0.6,
      competence: 0.5,
      utilite: 0.7,
      viabilite: 0.8,
      confidence_avg: 0.7,
      version: 2,
    }),
    [],
  );

  const getQual = useCallback(
    () => ({
      dimancheMatin: '...',
      algoPersonnel: '...',
      talentReconnu: '...',
      indignationMax: '...',
    }),
    [],
  );

  const getKeywords = useCallback(
    () => ({
      passions: ['design'],
      talents: ['design'],
      utilite: [],
      viabilite: [],
    }),
    [],
  );

  const { submitQuiz, loading, isSubmitting } = useQuizSubmission({
    getAnswers,
    getProfile4D,
    getQual,
    getKeywords,
    idempotencyKey: idemKey,
    onSuccess: () => {
      setError(null);
      setFieldErrors({});
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    },
  });

  const handleFinish = useCallback(async () => {
    const res = await submitQuiz();
    if (!res.ok) {
      const msg = res.message || 'Veuillez corriger les champs indiqués.';
      setError(msg);
      setFieldErrors(res.fieldErrors || {});
      toast.error('Soumission échouée', { description: msg });
      return;
    }
    const id = res.data?.id as string | undefined;
    if (!id) {
      const msg = 'Réponse serveur inattendue : identifiant manquant.';
      setError(msg);
      toast.error('Soumission échouée', { description: msg });
      return;
    }
    // pas de toast succès (tu ne le veux pas)
    localStorage.setItem('sjtProfileId', id);
    router.push(`/sweet-spot/lab?profile=${encodeURIComponent(id)}`);
  }, [submitQuiz, router]);

  return (
    <div>
      {/* ... ton UI (questions etc.) ... */}

      {error && <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Exemple d’affichage sous un champ : */}
      {/* <p className="mt-1 text-xs text-red-600">{fieldErrors['qual.dimancheMatin']}</p> */}

      <button
        onClick={handleFinish}
        disabled={loading || isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading || isSubmitting ? 'Envoi…' : 'Terminer'}
      </button>
    </div>
  );
}
