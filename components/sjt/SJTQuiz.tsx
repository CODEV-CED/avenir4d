'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QCM, type SJTScenario } from '@/data/sjt-questions-advanced';
import { useQuizSubmission } from '@/hooks/useQuizSubmission';
import { useSJTProgressStore } from '@/store/useSJTProgressStore';
import { toast } from 'sonner';
import type { QualInputs } from '@/lib/sweetspot/types';
import { QcmStep } from './QcmStep';
import { QualitativeStep } from './QualitativeStep';

export default function SJTQuiz() {
  // Marqueur perf au mount (évite l’erreur measure)
  useEffect(() => {
    try {
      if (performance.getEntriesByName('sjt:start').length === 0) {
        performance.mark('sjt:start');
      }
    } catch {}
  }, []);

  // Store progression
  const currentIndex = useSJTProgressStore((s) => s.currentIndex);
  const qcmAnswers = useSJTProgressStore((s) => s.qcmAnswers);
  const qualAnswers = useSJTProgressStore((s) => s.qualAnswers);
  const setCurrentIndex = useSJTProgressStore((s) => s.setCurrentIndex);
  const setQcmAnswer = useSJTProgressStore((s) => s.setQcmAnswer);
  const setQualAnswer = useSJTProgressStore((s) => s.setQualAnswer);
  const resetProgress = useSJTProgressStore((s) => s.reset);

  // local error helper
  const setError = useCallback((msg: string) => {
    console.error(msg);
  }, []);
  const router = useRouter();
  const getAnswers = useCallback(
    () => Object.entries(qcmAnswers).map(([questionId, answer]) => ({ questionId, answer })),
    [qcmAnswers],
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

  const getQual = useCallback(() => qualAnswers, [qualAnswers]);

  const { submitQuiz, isSubmitting } = useQuizSubmission({
    getAnswers,
    getProfile4D,
    getQual,
    onSuccess: (data) => {
      // optional side-effects on success; navigation handled after submit
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
      toast.error('Soumission échouée', { description: msg });
    },
  });

  // Données absentes ? Panneau d’erreur utile
  if (!Array.isArray(QCM) || (QCM as unknown[]).length === 0) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
        <div className="font-semibold">Aucune question chargée</div>
        <div className="text-sm">
          Vérifie l’import de <code>QCM</code> depuis <code>@/data/sjt-questions-advanced</code>.
        </div>
      </div>
    );
  }

  const isQcmPhase = currentIndex < QCM.length;
  const currentQuestion: SJTScenario | null = isQcmPhase ? (QCM as any)[currentIndex] : null;

  // Normalisation pour QcmStep (attend title/subtitle + options.label)
  const normalizedQuestion = useMemo(() => {
    if (!currentQuestion) return null;
    return {
      id: currentQuestion.id,
      title: currentQuestion.scenario,
      subtitle: undefined as string | undefined,
      options: currentQuestion.options.map((o) => ({
        id: o.id,
        label: o.text,
        description: undefined as string | undefined,
      })),
    };
  }, [currentQuestion]);

  function handleQcmChoice(questionId: string, optionId: string) {
    setQcmAnswer(questionId, optionId);
  }
  function handleQualChange(field: keyof QualInputs, value: string) {
    setQualAnswer(field, value);
  }
  function goNext() {
    setCurrentIndex(Math.min(currentIndex + 1, QCM.length));
  }
  function goPrevious() {
    setCurrentIndex(Math.max(currentIndex - 1, 0));
  }

  const canProceedFromQcm = useCallback((): boolean => {
    return currentQuestion ? !!qcmAnswers[currentQuestion.id] : false;
  }, [currentQuestion, qcmAnswers]);

  async function handleFinish() {
    try {
      const res = await submitQuiz();
      if (!res.ok) {
        const msg = res.message || 'Veuillez corriger les champs indiqués.';
        setError(msg);
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

      // Télémétrie légère (avec garde-fous)
      try {
        performance.mark('sjt:submit');
        const hasStart = performance.getEntriesByName('sjt:start').length > 0;
        if (hasStart) {
          performance.measure('sjt:timeToSubmit', 'sjt:start', 'sjt:submit');
          const m = performance.getEntriesByName('sjt:timeToSubmit').at(-1);
          if (m) {
            navigator.sendBeacon?.(
              '/api/metrics',
              JSON.stringify({
                name: 'sjt_time_to_submit_ms',
                value: Math.round(m.duration),
              }),
            );
          }
        }
      } catch {}

      resetProgress();
      localStorage.setItem('sjtProfileId', id);
      router.push(`/sweet-spot/lab?profile=${encodeURIComponent(id)}`);
    } catch (error) {
      console.error('Erreur lors de la finalisation:', error);
      setError('Une erreur est survenue. Vos réponses ont été sauvegardées localement.');
    }
  }

  return (
    <div id="sjt-root" tabIndex={-1} className="outline-none">
      {isQcmPhase && currentQuestion ? (
        <QcmStep
          questionIndex={currentIndex}
          totalQuestions={QCM.length}
          question={normalizedQuestion as any}
          selectedOption={qcmAnswers[currentQuestion.id]}
          onSelectOption={(optionId: string) => handleQcmChoice(currentQuestion.id, optionId)}
          onNext={goNext}
          onPrevious={goPrevious}
          canProceed={canProceedFromQcm()}
          isFirstQuestion={currentIndex === 0}
        />
      ) : (
        <QualitativeStep
          answers={qualAnswers}
          onChange={handleQualChange}
          onPrevious={goPrevious}
          onFinish={handleFinish}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
