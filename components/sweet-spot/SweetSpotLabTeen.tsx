// components/sweet-spot/SweetSpotLabTeen.tsx

'use client';

import React, { useEffect, useRef, useCallback, useState, Suspense, lazy } from 'react';
import { useSearchParams } from 'next/navigation';

import { ChevronRight, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Card } from './ui/shared/Card';

import { CanvasLoader, ConvergencesLoader } from './ui/shared/LoadingSpinner';

import { ProgressIndicator, QuickSteps } from './ui/components/ProgressIndicator';

import { OnboardingModal } from './ui/components/OnboardingModal';

import { SlidersSection } from './ui/sections/SlidersSection';

import { KeywordsSection } from './ui/sections/KeywordsSection';

import { TagsSection } from './ui/sections/TagsSection';

import { useLocalStorage, useSweetSpot } from '@sweet-spot/hooks';
import { useKeyboardHeight } from '@sweet-spot/hooks/useKeyboardHeight';

import { UI_CLASSES, SWEETSPOT_CONFIG } from './constants';

import type { PersistedData } from './types';

import { useSweetSpotWorker } from '@sweet-spot/hooks/useSweetSpotWorker';
import { usePostPaymentAutoplay } from '@/hooks/usePostPaymentAutoplay';
import { useAccessStore } from '@/store/useAccessStore';
import ProjectPreview from '@/components/projects/ProjectPreview';
import { EMERGING_CAREERS_BATCH3 } from '@/data/emerging-careers-batch3';
import { useSweetSpotStore } from '@/store/useSweetSpotStore';

// Lazy loading pour les sections lourdes

const CanvasSection = lazy(() => import('./ui/sections/CanvasSection'));

const ConvergencesSection = lazy(() => import('./ui/sections/ConvergencesSection'));

// Export du composant SANS les wrappers (ils sont dans index.tsx)

const clamp01 = (value: unknown, fallback = 0.5) => {
  const numeric =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number.parseFloat(value)
        : Number.NaN;
  if (Number.isFinite(numeric)) {
    return Math.min(1, Math.max(0, numeric));
  }
  return Math.min(1, Math.max(0, fallback));
};

const sanitizeKeywords = (input: unknown): string[] => {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of input) {
    if (typeof item !== 'string') continue;
    const normalized = item.trim().replace(/\s+/g, ' ');
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized.slice(0, 60));
    if (result.length >= 12) break;
  }
  return result;
};

const SweetSpotLabTeen = () => {
  const { state, uiState, actions } = useSweetSpot();
  const { setSliderValues, setKeywords, setLoading, setError, resetAll } = actions;

  const searchParams = useSearchParams();
  const profileParam = (searchParams?.get('profile') ?? '').trim();
  const loadedProfileIdRef = useRef<string | null>(null);

  usePostPaymentAutoplay();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedId = window.localStorage.getItem('sjtProfileId') ?? '';
    const targetId = profileParam || storedId;

    if (!targetId) {
      loadedProfileIdRef.current = null;
      return;
    }

    if (loadedProfileIdRef.current === targetId) {
      return;
    }

    loadedProfileIdRef.current = targetId;

    if (profileParam) {
      try {
        window.localStorage.setItem('sjtProfileId', profileParam);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SweetSpotLabTeen] impossible de stocker sjtProfileId', error);
        }
      }
    }

    const controller = new AbortController();
    const { signal } = controller;

    const loadProfile = async () => {
      resetAll();
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sjt/profile?id=${encodeURIComponent(targetId)}`, {
          cache: 'no-store',
          signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || json?.ok === false) {
          throw new Error(json?.error || `Erreur ${res.status}`);
        }
        if (signal.aborted) return;

        const profile = json.profile ?? {};
        const profile4d = profile.profile4d ?? {};

        setSliderValues({
          passions: clamp01(profile4d.plaisir),
          talents: clamp01(profile4d.competence),
          utilite: clamp01(profile4d.utilite),
          viabilite: Math.max(0.15, clamp01(profile4d.viabilite)),
        });

        const keywordsSource = profile.keywords ?? {};

        setKeywords({
          passions: sanitizeKeywords(keywordsSource.passions),
          talents: sanitizeKeywords(keywordsSource.talents),
          utilite: sanitizeKeywords(keywordsSource.utilite),
          viabilite: sanitizeKeywords(keywordsSource.viabilite),
        });
      } catch (error) {
        if (signal.aborted) return;
        const message =
          error instanceof Error ? error.message : 'Erreur lors du chargement du profil';
        setError(message);
        toast.error('Chargement du profil échoué', { description: message });
        loadedProfileIdRef.current = null;
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, [profileParam, resetAll, setError, setKeywords, setLoading, setSliderValues]);
  const keyboardHeight = useKeyboardHeight();

  // Badge "Eureka local?? (pré-calcul Worker)

  const { data: wData } = useSweetSpotWorker(
    state.sliderValues,

    state.userKeywords,

    state.selectedTags,

    state.filterMode,

    true,
  );

  // État persisté dans localStorage

  const [persistedData, setPersistedData] = useLocalStorage<PersistedData>(
    SWEETSPOT_CONFIG.STORAGE.KEY,

    {
      completedSteps: [],

      onboardingCompleted: false,

      activeTab: 'passions',
    },
  );

  // Références pour le scroll

  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Hydratation guard

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Gestion du responsive

  useEffect(() => {
    const checkMobile = () => {
      actions.setMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, [actions]);

  // Gestion de l'onboarding

  useEffect(() => {
    if (!persistedData.onboardingCompleted && mounted) {
      actions.setOnboarding(true, 0);
    }
  }, [persistedData.onboardingCompleted, mounted, actions]);

  // Mise à jour de la progression

  useEffect(() => {
    const updateProgress = (stepIndex: number) => {
      if (!persistedData.completedSteps.includes(stepIndex)) {
        setPersistedData((prev) => ({
          ...prev,

          completedSteps: [...prev.completedSteps, stepIndex],
        }));
      }
    };

    // Vérifier les conditions pour chaque étape

    if (Object.values(state.sliderValues).some((v) => v !== 0.5)) {
      updateProgress(0); // Sliders modifiés
    }

    if (state.filterMode !== 'union') {
      updateProgress(1); // Mode changé
    }

    if (Object.values(state.userKeywords).some((keywords) => keywords.length > 0)) {
      updateProgress(2); // Mots-clés ajoutés
    }

    if (state.selectedTags.length > 0) {
      updateProgress(3); // Tags sélectionnés
    }

    if (state.sweetSpotScore >= SWEETSPOT_CONFIG.THRESHOLDS.EUREKA_SCORE) {
      updateProgress(4); // Eureka atteint
    }
  }, [state, persistedData.completedSteps, setPersistedData]);

  // Synchroniser l'onglet actif avec localStorage

  useEffect(() => {
    if (uiState.activeTab !== persistedData.activeTab) {
      setPersistedData((prev) => ({ ...prev, activeTab: uiState.activeTab }));
    }
  }, [uiState.activeTab, persistedData.activeTab, setPersistedData]);

  // Callbacks

  const scrollToCard = useCallback((index: number) => {
    cardRefs.current[index]?.scrollIntoView({
      behavior: 'smooth',

      block: 'center',
    });
  }, []);

  const skipOnboarding = useCallback(() => {
    actions.setOnboarding(false, 0);

    setPersistedData((prev) => ({ ...prev, onboardingCompleted: true }));
  }, [actions, setPersistedData]);

  const nextOnboardingStep = useCallback(() => {
    if (uiState.onboardingStep >= 3) {
      skipOnboarding();
    } else {
      actions.setOnboarding(true, uiState.onboardingStep + 1);
    }
  }, [uiState.onboardingStep, actions, skipOnboarding]);

  const handleReset = useCallback(() => {
    if (typeof window !== 'undefined' && window.confirm('Veux-tu vraiment repartir de zéro ?')) {
      actions.resetAll();

      setPersistedData({
        completedSteps: [],

        onboardingCompleted: persistedData.onboardingCompleted,

        activeTab: 'passions',
      });

      actions.setActiveTab('passions');

      actions.setKeywordInput('');

      actions.setScreenReaderMessage('Réinitialisation complète effectuée');

      try {
        localStorage.removeItem('sweetspot-state');
      } catch {}
    }
  }, [actions, persistedData.onboardingCompleted, setPersistedData]);

  // Ne pas rendre avant l'hydratation

  if (!mounted) {
    return <div className="min-h-screen bg-black" />;
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-black p-5 text-white"
      style={{ fontFamily: 'Satoshi Variable, Inter, ui-sans-serif, system-ui' }}
    >
      {/* Screen reader announcements */}

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {uiState.screenReaderMessage}
      </div>

      {/* Background effects */}

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[700px] bg-white/[0.03] blur-3xl" />

        <div className="absolute bottom-[-10%] left-[-10%] h-[420px] w-[560px] bg-white/[0.02] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <header className="relative mb-10 pt-12 text-center">
          <ProgressIndicator
            completedSteps={persistedData.completedSteps}
            isMobile={uiState.isMobile}
          />

          {!!wData?.isEureka && (
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
              ✨ Eureka (local): {Math.round((wData.sweetSpotScore ? 0.8 : 0) * 100)}%
            </div>
          )}

          <h1
            className={`mb-4 font-black ${uiState.isMobile ? 'text-3xl leading-tight' : 'text-5xl'}`}
          >
            Sweet Spot{' '}
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
              Lab
            </span>
          </h1>

          <p
            className={`mx-auto max-w-2xl ${uiState.isMobile ? 'px-4 text-sm' : 'text-lg'} ${UI_CLASSES.SUBTITLE}`}
          >
            Découvre le point d'équilibre entre ce que tu aimes, ce qui te rend unique, l'impact que
            tu veux avoir et ce qui peut marcher pour toi.
          </p>
        </header>
        {/* Quick steps */}
        <QuickSteps
          completedSteps={persistedData.completedSteps}
          isMobile={uiState.isMobile}
          onStepClick={scrollToCard}
        />
        {/* Cards */}
        <div className="space-y-6">
          {/* Card 1: Sliders */}

          <Card
            ref={(el) => {
              cardRefs.current[0] = el;
            }}
            number={1}
            title="Ajuste tes curseurs"
          >
            <SlidersSection />
          </Card>

          {/* Card 2: Canvas Ikigaï */}

          <Card
            ref={(el) => {
              cardRefs.current[1] = el;
            }}
            number={2}
            title="Observe ton Ikigaï"
          >
            <Suspense fallback={<CanvasLoader />}>
              <CanvasSection />
            </Suspense>
          </Card>

          {/* Card 3: Keywords */}

          <Card
            ref={(el) => {
              cardRefs.current[2] = el;
            }}
            number={3}
            title="Ajoute tes mots-clés"
          >
            <KeywordsSection />
          </Card>

          {/* Card 4: Tags */}

          <Card number={4} title="Boost avec des tags">
            <TagsSection />
          </Card>

          {/* Card 5: Convergences */}
          <Card number={5} title="Tes pistes prometteuses">
            <Suspense fallback={<ConvergencesLoader />}>
              <ConvergencesSection />
            </Suspense>
          </Card>

          {/* Card 6: Projets Preview - NOUVEAU */}
          <ProjectPreview
            title="Tes Projets Pros"
            max={3}
            onPrimaryCta={() => {
              window.location.href = '/formations';
            }}
          />
        </div>{' '}
        {/* Fin du space-y-6 */}
        {/* Reset button */}
        <button
          onClick={handleReset}
          className={`fixed bottom-8 flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-6 py-3 text-white/90 transition-all hover:-translate-y-0.5 hover:bg-black/80 ${
            uiState.isMobile ? 'right-4 px-4 py-2 text-sm' : 'right-8'
          }`}
        >
          <RotateCcw className={`${uiState.isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />

          {uiState.isMobile ? 'Reset' : 'Repartir de zéro'}
        </button>
        {/* Onboarding modal */}
        <div style={{ height: keyboardHeight ? keyboardHeight * 0.4 : 0 }} aria-hidden />
        <OnboardingModal
          isOpen={uiState.showOnboarding}
          step={uiState.onboardingStep}
          onSkip={skipOnboarding}
          onNext={nextOnboardingStep}
        />
      </div>

      {/* Styles CSS pour les sliders et animations */}
    </div>
  );
};

export default SweetSpotLabTeen;
