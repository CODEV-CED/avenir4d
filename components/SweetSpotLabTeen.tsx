'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { ChevronRight, RotateCcw, Info, Sparkles } from 'lucide-react';

// ============= CONFIGURATION =============
const SWEETSPOT_CONFIG = {
  STORAGE: {
    KEY: 'sslTeen.v1',
    ONBOARDING_KEY: 'sweetspot-visited',
  },

  LIMITS: {
    MAX_KEYWORDS_PER_TAB: 12,
    MIN_SLIDER_VALUE: 0,
    MAX_SLIDER_VALUE: 100,
    MAX_KEYWORD_LENGTH: 50,
    MIN_KEYWORD_LENGTH: 1,
  },

  ANIMATIONS: {
    SUCCESS_DURATION: 1800,
    LIMIT_MSG_DURATION: 2000,
    DEBOUNCE_DELAY: 300,
  },
};

// ============= CONFIGURATION STATIQUE =============
const sliderToneStyles = {
  red: {
    badgeBg: 'rgba(255, 0, 80, 0.2)',
    badgeText: '#ff0050',
    gradient: 'linear-gradient(to right, #ff0050, #ff4080)',
  },
  blue: {
    badgeBg: 'rgba(0, 128, 255, 0.2)',
    badgeText: '#0080ff',
    gradient: 'linear-gradient(to right, #0080ff, #40a0ff)',
  },
  green: {
    badgeBg: 'rgba(0, 255, 128, 0.2)',
    badgeText: '#00ff80',
    gradient: 'linear-gradient(to right, #00ff80, #40ffb0)',
  },
  yellow: {
    badgeBg: 'rgba(255, 200, 0, 0.2)',
    badgeText: '#ffc800',
    gradient: 'linear-gradient(to right, #ffc800, #ffd840)',
  },
};

type UIKey = 'passions' | 'talents' | 'impact' | 'potentiel';

const sliderEntries: {
  key: UIKey;
  emoji: string;
  label: string;
  tone: keyof typeof sliderToneStyles;
}[] = [
  { key: 'passions', emoji: '🔥', label: 'Passions', tone: 'red' },
  { key: 'talents', emoji: '🧠', label: 'Talents', tone: 'blue' },
  { key: 'impact', emoji: '🌍', label: 'Impact', tone: 'green' },
  { key: 'potentiel', emoji: '🚀', label: 'Potentiel', tone: 'yellow' },
];

const keywordTabMeta = {
  passions: { emoji: '🔥', placeholder: 'Ex: création, sport, musique, voyage...' },
  talents: { emoji: '🧠', placeholder: 'Ex: écoute, organisation, analyse, leadership...' },
  impact: { emoji: '🌍', placeholder: 'Ex: environnement, éducation, santé, égalité...' },
  potentiel: { emoji: '🚀', placeholder: 'Ex: tech, business, innovation, freelance...' },
};

const uiToEngine: Record<UIKey, 'passions' | 'talents' | 'utilite' | 'viabilite'> = {
  passions: 'passions',
  talents: 'talents',
  impact: 'utilite',
  potentiel: 'viabilite',
};

const UI_CLASSES = {
  CARD: 'rounded-2xl border border-white/10 bg-black/80 p-7',
  SUBTITLE: 'text-white/70',
  TITLE: 'text-2xl font-bold text-white',
  BTN_PRIMARY:
    'px-8 py-3.5 bg-white text-black rounded-full font-semibold hover:-translate-y-0.5 hover:shadow-xl transition-all',
  BTN_SECONDARY:
    'px-8 py-3.5 border border-white/20 text-white rounded-full font-semibold hover:bg-white/5 hover:-translate-y-0.5 transition-all',
};

const ONBOARDING_STEPS = [
  'Bouge les curseurs : ton profil bouge en temps réel.',
  'Observe "l\'Ikigaï" : les zones qui se recoupent, c\'est ton Sweet Spot.',
  'Ajoute 4–8 mots-clés par dimension : ça affine les résultats.',
  'Découvre tes convergences et des pistes concrètes.',
];

const TAG_POOL = [
  '🎨 Créatif',
  '📊 Analytique',
  '🤝 Social',
  '🔬 Scientifique',
  '💼 Entrepreneurial',
  '🌱 Écologique',
  '🏗️ Technique',
  '✍️ Littéraire',
  '🎭 Artistique',
  '⚕️ Santé',
  '📱 Digital',
  '🏃 Sportif',
];

const SAMPLE_CONVERGENCES = [
  {
    id: '1',
    formula: ['Design', 'IA', 'Éducation'],
    result: "Coach d'app créatives pour lycéens",
    description:
      "Créer des expériences d'apprentissage visuelles et interactives qui utilisent l'IA.",
    example: "Développe une app qui aide les lycéens à créer leur portfolio numérique avec l'IA.",
  },
  {
    id: '2',
    formula: ['Écologie', 'Tech', 'Social'],
    result: 'Innovateur impact environnemental',
    description: 'Développer des solutions tech pour mobiliser des communautés autour du climat.',
    example: 'Plateforme collaborative pour les initiatives écologiques locales.',
  },
  {
    id: '3',
    formula: ['Gaming', 'Psycho', 'Impact'],
    result: 'Game designer thérapeutique',
    description: 'Concevoir des jeux qui aident à développer des compétences émotionnelles.',
    example: 'Serious games pour la gestion du stress.',
  },
];

// ============= HOOKS =============
// Setter stable + écriture locale dans l'updater => pas de boucle
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const valueToStore = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        } catch {}
        return valueToStore;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}

function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ============= UTILS =============
const validateKeyword = (keyword: string): { isValid: boolean; error?: string } => {
  const trimmed = keyword.trim();
  if (!trimmed) return { isValid: false, error: 'Le mot-clé ne peut pas être vide' };
  if (trimmed.length > SWEETSPOT_CONFIG.LIMITS.MAX_KEYWORD_LENGTH) {
    return {
      isValid: false,
      error: `Maximum ${SWEETSPOT_CONFIG.LIMITS.MAX_KEYWORD_LENGTH} caractères`,
    };
  }
  const validPattern = /^[\w\s\-À-ÿ]+$/u;
  if (!validPattern.test(trimmed)) {
    return { isValid: false, error: 'Caractères non autorisés' };
  }
  return { isValid: true };
};

const sanitizeInput = (input: string): string =>
  input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, SWEETSPOT_CONFIG.LIMITS.MAX_KEYWORD_LENGTH);

const keywordExists = (keyword: string, existingKeywords: string[]): boolean => {
  const normalized = keyword.toLowerCase().trim();
  return existingKeywords.some((k) => k.toLowerCase().trim() === normalized);
};

// ============= COMPOSANT PRINCIPAL =============
const SweetSpotLabTeen = () => {
  type DimKey = 'passions' | 'talents' | 'utilite' | 'viabilite';
  type SliderValues = { passions: number; talents: number; utilite: number; viabilite: number };
  type UserKeywords = Record<DimKey, string[]>;
  type SweetSpotState = {
    sliderValues: SliderValues;
    userKeywords: UserKeywords;
    selectedTags: string[];
    filterMode: 'union' | 'intersection';
    convergences: any[];
    sweetSpotScore: number;
    isLoading: boolean;
  };

  const calculateSweetSpotScore = (
    sliderValues: SliderValues,
    mode: 'intersection' | 'union',
  ): number => {
    const values = Object.values(sliderValues) as number[];
    if (mode === 'intersection') {
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const balance = 1 - (maxValue - minValue);
      return minValue * balance;
    }
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  // Local store-like state
  const [state, setState] = useState<SweetSpotState>({
    sliderValues: { passions: 0.5, talents: 0.5, utilite: 0.5, viabilite: 0.5 },
    userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
    selectedTags: [],
    filterMode: 'union',
    convergences: [],
    sweetSpotScore: 0.5,
    isLoading: false,
  });

  const setSliderValue = useCallback((dim: DimKey, value: number) => {
    setState((prev) => {
      const newSliderValues = { ...prev.sliderValues, [dim]: value } as SliderValues;
      return {
        ...prev,
        sliderValues: newSliderValues,
        sweetSpotScore: calculateSweetSpotScore(newSliderValues, prev.filterMode),
      };
    });
  }, []);

  const addKeyword = useCallback((dim: DimKey, keyword: string) => {
    setState((prev) => ({
      ...prev,
      userKeywords: { ...prev.userKeywords, [dim]: [...prev.userKeywords[dim], keyword] },
    }));
  }, []);

  const removeKeyword = useCallback((dim: DimKey, keyword: string) => {
    setState((prev) => ({
      ...prev,
      userKeywords: {
        ...prev.userKeywords,
        [dim]: prev.userKeywords[dim].filter((k) => k !== keyword),
      },
    }));
  }, []);

  const addTag = useCallback(
    (tag: string) => setState((prev) => ({ ...prev, selectedTags: [...prev.selectedTags, tag] })),
    [],
  );
  const removeTag = useCallback(
    (tag: string) =>
      setState((prev) => ({ ...prev, selectedTags: prev.selectedTags.filter((t) => t !== tag) })),
    [],
  );

  const setFilterMode = useCallback((mode: 'union' | 'intersection') => {
    setState((prev) => ({
      ...prev,
      filterMode: mode,
      sweetSpotScore: calculateSweetSpotScore(prev.sliderValues, mode),
    }));
  }, []);

  const resetAllPrefs = useCallback(() => {
    setState({
      sliderValues: { passions: 0.5, talents: 0.5, utilite: 0.5, viabilite: 0.5 },
      userKeywords: { passions: [], talents: [], utilite: [], viabilite: [] },
      selectedTags: [],
      filterMode: 'union',
      convergences: [],
      sweetSpotScore: 0.5,
      isLoading: false,
    });
  }, []);

  // Persistent data
  const [persistedData, setPersistedData] = useLocalStorage(SWEETSPOT_CONFIG.STORAGE.KEY, {
    completedSteps: [0],
    onboardingCompleted: false,
    activeTab: 'passions',
  });

  // Local UI state
  type TabKey = keyof typeof keywordTabMeta;
  const initialTab = (persistedData.activeTab as TabKey) || 'passions';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [keywordInput, setKeywordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [screenReaderMessage, setScreenReaderMessage] = useState('');

  // 🔒 Hydration guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Refs
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const keywordInputRef = useRef<HTMLInputElement | null>(null);

  // Debounced values
  const debouncedSliders = useDebounce(
    state.sliderValues,
    SWEETSPOT_CONFIG.ANIMATIONS.DEBOUNCE_DELAY,
  );

  // Derived state
  const sliderPct = useMemo(
    () => ({
      passions: Math.round(debouncedSliders.passions * 100),
      talents: Math.round(debouncedSliders.talents * 100),
      impact: Math.round(debouncedSliders.utilite * 100),
      potentiel: Math.round(debouncedSliders.viabilite * 100),
    }),
    [debouncedSliders],
  );

  const keywordsByTab = useMemo(
    () => ({
      passions: [...(state.userKeywords.passions || [])],
      talents: [...(state.userKeywords.talents || [])],
      impact: [...(state.userKeywords.utilite || [])],
      potentiel: [...(state.userKeywords.viabilite || [])],
    }),
    [state.userKeywords],
  );

  const scorePct = Math.round(Math.max(0, Math.min(1, state.sweetSpotScore)) * 100);
  const isEureka = state.sweetSpotScore >= 0.7;

  // Responsive sizes
  const CanvasSize = isMobile ? 'w-72 h-72' : 'w-96 h-96';
  const CanvasWrapperMinHeight = isMobile ? 'min-h-[320px]' : 'min-h-[420px]';
  const RingSize = isMobile ? 'w-24 h-24' : 'w-36 h-36';
  const ScoreSize = isMobile ? 'w-20 h-20' : 'w-24 h-24';

  // Effects
  useEffect(() => {
    if (!persistedData.onboardingCompleted) setShowOnboarding(true);
  }, [persistedData.onboardingCompleted]);

  useEffect(() => {
    if (keywordInputRef.current) keywordInputRef.current.focus();
  }, [activeTab]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(
        () => setErrorMsg(null),
        SWEETSPOT_CONFIG.ANIMATIONS.LIMIT_MSG_DURATION,
      );
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(
        () => setSuccessMsg(false),
        SWEETSPOT_CONFIG.ANIMATIONS.SUCCESS_DURATION,
      );
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // ⚠️ important: ne pas inclure setPersistedData dans deps
  useEffect(() => {
    setPersistedData((prev) => ({ ...prev, activeTab }));
  }, [activeTab]);

  useEffect(() => {
    if (isEureka && !persistedData.completedSteps.includes(4)) {
      setPersistedData((prev) => ({ ...prev, completedSteps: [...prev.completedSteps, 4] }));
    }
  }, [isEureka, persistedData.completedSteps]);

  // Handlers
  const handleSliderChange = useCallback(
    (dim: UIKey, pct: number) => {
      const key = uiToEngine[dim];
      setSliderValue(key, Math.max(0, Math.min(1, pct / 100)));
      setScreenReaderMessage(`${dim} ajusté à ${pct}%`);

      if (!persistedData.completedSteps.includes(0)) {
        setPersistedData((prev) => ({ ...prev, completedSteps: [...prev.completedSteps, 0] }));
      }
    },
    [setSliderValue, persistedData.completedSteps],
  );

  const handleModeChange = useCallback(
    (value: 'union' | 'intersection') => {
      setFilterMode(value);
      if (!persistedData.completedSteps.includes(1)) {
        setPersistedData((prev) => ({ ...prev, completedSteps: [...prev.completedSteps, 1] }));
      }
    },
    [setFilterMode, persistedData.completedSteps],
  );

  const addKeywordUI = useCallback(() => {
    const sanitized = sanitizeInput(keywordInput);
    const validation = validateKeyword(sanitized);

    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Erreur de validation');
      setScreenReaderMessage(`Erreur: ${validation.error}`);
      return;
    }

    const currentKeywords = keywordsByTab[activeTab];
    if (keywordExists(sanitized, currentKeywords)) {
      setErrorMsg('Ce mot-clé existe déjà');
      return;
    }
    if (currentKeywords.length >= SWEETSPOT_CONFIG.LIMITS.MAX_KEYWORDS_PER_TAB) {
      setErrorMsg(
        `Tu as atteint ${SWEETSPOT_CONFIG.LIMITS.MAX_KEYWORDS_PER_TAB} mots-clés pour cette dimension.`,
      );
      return;
    }

    addKeyword(uiToEngine[activeTab], sanitized);
    setKeywordInput('');
    setSuccessMsg(true);
    setScreenReaderMessage(`Mot-clé ${sanitized} ajouté avec succès`);

    if (!persistedData.completedSteps.includes(2)) {
      setPersistedData((prev) => ({ ...prev, completedSteps: [...prev.completedSteps, 2] }));
    }
  }, [keywordInput, activeTab, keywordsByTab, addKeyword, persistedData.completedSteps]);

  const removeKeywordUI = useCallback(
    (keyword: string) => {
      removeKeyword(uiToEngine[activeTab], keyword);
      setScreenReaderMessage(`Mot-clé ${keyword} supprimé`);
      setErrorMsg(null);
    },
    [activeTab, removeKeyword],
  );

  const toggleTag = useCallback(
    (tag: string) => {
      const label = tag.replace(/^[^ ]+\s*/, '');
      if (state.selectedTags.includes(label)) {
        removeTag(label);
      } else {
        addTag(label);
        if (!persistedData.completedSteps.includes(3)) {
          setPersistedData((prev) => ({ ...prev, completedSteps: [...prev.completedSteps, 3] }));
        }
      }
    },
    [state.selectedTags, addTag, removeTag, persistedData.completedSteps],
  );

  const handleReset = useCallback(() => {
    if (confirm('Veux-tu vraiment repartir de zéro ?')) {
      resetAllPrefs();
      setPersistedData({
        completedSteps: [],
        onboardingCompleted: persistedData.onboardingCompleted,
        activeTab: 'passions',
      });
      setKeywordInput('');
      setActiveTab('passions');
      setScreenReaderMessage('Réinitialisation complète effectuée');
    }
  }, [resetAllPrefs, setPersistedData, persistedData.onboardingCompleted]);

  const skipOnboarding = useCallback(() => {
    setShowOnboarding(false);
    setPersistedData((prev) => ({ ...prev, onboardingCompleted: true }));
  }, []);

  const nextOnboardingStep = useCallback(() => {
    if (onboardingStep >= 3) skipOnboarding();
    else setOnboardingStep((n) => n + 1);
  }, [onboardingStep, skipOnboarding]);

  const scrollToCard = useCallback((i: number) => {
    cardRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // Display convergences
  const displayConvergences = useMemo(() => {
    if (!state.convergences?.length) return SAMPLE_CONVERGENCES;
    return state.convergences.map((c: any, i: number) => ({
      id: String(i),
      formula: (c.matchedDimensions || []).map((d: string) =>
        d ? d[0].toUpperCase() + d.slice(1) : d,
      ),
      result: c.keyword,
      description: `Mot-clé fort détecté dans ${(c.matchedDimensions || []).join(', ')}`,
      example: `Teste « ${c.keyword} » dans un mini-projet perso.`,
    }));
  }, [state.convergences]);

  // Helper function for gradients
  const grad = (rgb: [number, number, number], a1: number, a2: number): string =>
    `radial-gradient(circle at center,
        rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a1}) 20%,
        rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a2}) 60%,
        transparent 100%)`;

  // 🔒 tant que non monté, on rend un placeholder stable (évite mismatch SSR/Client)
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
        {screenReaderMessage}
      </div>

      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] h-[500px] w-[700px] bg-white/[0.03] blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[420px] w-[560px] bg-white/[0.02] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <header className="relative mb-10 pt-12 text-center">
          <div
            className={`absolute top-0 right-0 flex items-center gap-2 rounded-full border border-purple-500/30 bg-gray-900/80 backdrop-blur-md ${
              isMobile ? 'px-2 py-1' : 'px-5 py-2'
            }`}
          >
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white/90`}>
              {isMobile ? 'Prog.' : 'Progression'}
            </span>
            <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
              {[0, 1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1 rounded-full transition-all ${isMobile ? 'w-3' : 'w-6'} ${
                    persistedData.completedSteps.includes(step)
                      ? 'bg-white'
                      : step === persistedData.completedSteps.length
                        ? 'animate-pulse bg-white/50'
                        : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-white/70`}>
              {persistedData.completedSteps.length}/5
            </span>
          </div>

          <h1 className={`mb-4 font-black ${isMobile ? 'text-3xl leading-tight' : 'text-5xl'}`}>
            Sweet Spot{' '}
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
              Lab
            </span>
          </h1>

          <p
            className={`mx-auto max-w-2xl ${isMobile ? 'px-4 text-sm' : 'text-lg'} ${UI_CLASSES.SUBTITLE}`}
          >
            Découvre le point d'équilibre entre ce que tu aimes, ce qui te rend unique, l'impact que
            tu veux avoir et ce qui peut marcher pour toi.
          </p>
        </header>

        {/* Quick steps */}
        <div className={`mb-10 flex flex-wrap justify-center ${isMobile ? 'gap-4' : 'gap-8'}`}>
          {['Ajuste tes curseurs', 'Observe ton Ikigaï', 'Personnalise ton profil'].map(
            (step, idx) => (
              <button
                key={idx}
                onClick={() => scrollToCard(idx)}
                className={`flex cursor-pointer items-center gap-2 transition-all hover:scale-105 ${
                  persistedData.completedSteps.includes(idx)
                    ? 'opacity-100'
                    : idx === persistedData.completedSteps.length
                      ? 'opacity-80'
                      : 'opacity-40'
                }`}
              >
                <span
                  className={`flex ${isMobile ? 'h-4 w-4' : 'h-5 w-5'} items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                    persistedData.completedSteps.includes(idx)
                      ? 'border-white bg-white text-black'
                      : idx === persistedData.completedSteps.length
                        ? 'animate-pulse border-white/60 bg-white/10'
                        : 'border-white/30'
                  }`}
                >
                  {persistedData.completedSteps.includes(idx) && '✓'}
                </span>
                <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>{step}</span>
              </button>
            ),
          )}
        </div>

        {/* Cards */}
        <div className="space-y-6">
          {/* Card 1: Sliders */}
          <div
            ref={(el) => {
              cardRefs.current[0] = el;
            }}
            className={UI_CLASSES.CARD}
          >
            <div className="mb-5 flex items-center gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white">
                1
              </span>
              <h2 className={UI_CLASSES.TITLE}>Ajuste tes curseurs</h2>

              {/* Mode toggle */}
              <div className="ml-auto flex items-center gap-3">
                <div
                  className={`relative grid grid-cols-2 overflow-hidden rounded-full bg-black/30 ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}
                >
                  {/* sélecteur blanc qui glisse */}
                  <div
                    className="pointer-events-none absolute top-0 left-0 h-full w-1/2 rounded-full bg-white transition-transform duration-300"
                    style={{
                      transform:
                        state.filterMode === 'union' ? 'translateX(0%)' : 'translateX(100%)',
                    }}
                  />

                  {/* boutons */}
                  <button
                    type="button"
                    onClick={() => handleModeChange('union')}
                    aria-pressed={state.filterMode === 'union'}
                    className={`relative z-10 font-semibold whitespace-nowrap ${
                      isMobile ? 'w-[7.5rem] px-3 py-1' : 'w-32 px-4 py-1.5'
                    } ${state.filterMode === 'union' ? 'text-black' : 'text-white/70 hover:text-white'}`}
                  >
                    Union
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('intersection')}
                    aria-pressed={state.filterMode === 'intersection'}
                    className={`relative z-10 font-semibold whitespace-nowrap ${
                      isMobile ? 'w-[7.5rem] px-3 py-1' : 'w-32 px-4 py-1.5'
                    } ${state.filterMode === 'intersection' ? 'text-black' : 'text-white/70 hover:text-white'}`}
                  >
                    Intersection
                  </button>
                </div>

                <div className="group relative grid place-items-center">
                  <Info
                    className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} cursor-help text-white/60`}
                  />
                  <div
                    className={`pointer-events-none absolute top-6 right-0 ${
                      isMobile ? 'w-40' : 'w-48'
                    } rounded-lg border border-white/15 bg-black p-3 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100`}
                  >
                    <p className="text-xs text-white/80">
                      <strong>Union</strong> : toutes tes forces combinées
                      <br />
                      <strong>Intersection</strong> : là où tout se croise
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className={`${UI_CLASSES.SUBTITLE} mb-4`}>
              Donne plus ou moins d'importance à chaque dimension et observe ton profil évoluer.
            </p>

            {/* Sliders grid */}
            <div
              className={`grid gap-5 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
            >
              {sliderEntries.map((entry) => (
                <div
                  key={entry.key}
                  className={`rounded-xl border border-white/10 bg-black/60 p-4 transition-colors hover:border-white/15 ${isMobile ? 'min-h-[80px]' : ''}`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{entry.emoji}</span>
                      <span className="font-semibold capitalize">{entry.label}</span>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-sm font-bold"
                      style={{
                        backgroundColor: sliderToneStyles[entry.tone].badgeBg,
                        color: sliderToneStyles[entry.tone].badgeText,
                      }}
                    >
                      {sliderPct[entry.key]}%
                    </span>
                  </div>

                  <div className="relative flex h-6 items-center">
                    <div className="absolute inset-x-0 h-2 rounded-lg bg-gray-800" />
                    <div
                      className="absolute h-2 rounded-lg transition-all duration-300 ease-out"
                      style={{
                        width: `${sliderPct[entry.key]}%`,
                        background: sliderToneStyles[entry.tone].gradient,
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={sliderPct[entry.key]}
                      onChange={(e) => handleSliderChange(entry.key, Number(e.target.value))}
                      aria-label={`Ajuster ${entry.label}: ${sliderPct[entry.key]}%`}
                      className="slider-custom absolute inset-0 z-10 h-6 w-full cursor-pointer appearance-none bg-transparent"
                      style={{ WebkitAppearance: 'none', background: 'transparent' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Canvas Ikigaï */}
          <div
            ref={(el) => {
              cardRefs.current[1] = el;
            }}
            className={UI_CLASSES.CARD}
          >
            <div className="mb-5 flex items-center gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white">
                2
              </span>
              <h2 className={UI_CLASSES.TITLE}>Observe ton Ikigaï</h2>
            </div>

            <p className={`${UI_CLASSES.SUBTITLE} mb-8`}>
              Là où les cercles se superposent, ton Sweet Spot apparaît. Plus le score est élevé,
              plus tu es proche de ton équilibre idéal.
            </p>

            {/* Canvas */}
            <div className={`relative flex items-center justify-center ${CanvasWrapperMinHeight}`}>
              <div
                className={`relative ${CanvasSize}`}
                role="img"
                aria-label={`Diagramme Ikigaï en mode ${state.filterMode}. Score ${scorePct}%.`}
              >
                {state.filterMode === 'intersection' && (
                  <div className="absolute inset-0 rounded-full bg-white/5" />
                )}

                {[
                  {
                    pos: { top: '30px', left: '30px' },
                    rgb: [255, 0, 80] as [number, number, number],
                    dim: 'passions' as const,
                  },
                  {
                    pos: { top: '30px', right: '30px' },
                    rgb: [0, 128, 255] as [number, number, number],
                    dim: 'talents' as const,
                  },
                  {
                    pos: { bottom: '30px', left: '30px' },
                    rgb: [0, 255, 128] as [number, number, number],
                    dim: 'impact' as const,
                  },
                  {
                    pos: { bottom: '30px', right: '30px' },
                    rgb: [255, 200, 0] as [number, number, number],
                    dim: 'potentiel' as const,
                  },
                ].map((circle, i) => (
                  <div
                    key={i}
                    className="absolute h-56 w-56 rounded-full transition-all duration-700"
                    style={{
                      background: grad(
                        circle.rgb,
                        state.filterMode === 'intersection' ? 0.95 : 0.85,
                        state.filterMode === 'intersection' ? 0.6 : 0.45,
                      ),
                      ...circle.pos,
                      transform: `scale(${(sliderPct[circle.dim] / 100) * 0.6 + (isEureka ? 0.8 : 0.6)})`,
                      filter:
                        state.filterMode === 'intersection'
                          ? isEureka
                            ? 'saturate(140%) contrast(120%)'
                            : 'saturate(120%) contrast(110%)'
                          : isEureka
                            ? 'blur(0.3px) saturate(130%) contrast(115%)'
                            : 'blur(0.4px) saturate(115%) contrast(108%)',
                      // on passe en "screen" même en intersection → rendu lumineux sur fond sombre
                      mixBlendMode: 'screen',
                      opacity: state.filterMode === 'intersection' ? 0.95 : 0.8,
                    }}
                  />
                ))}

                {state.filterMode === 'intersection' && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.06) 20%, transparent 60%)',
                      mixBlendMode: 'screen',
                    }}
                  />
                )}

                {/* Sweet Spot score */}
                <div className="absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center">
                  <div className="relative flex items-center justify-center">
                    {isEureka && (
                      <>
                        <div
                          className={`pointer-events-none absolute ${RingSize} animate-[eureka-ring_2s_ease-out_infinite] rounded-full border-4 border-purple-500`}
                        />
                        <div
                          className={`pointer-events-none absolute ${RingSize} animate-[eureka-ring_2s_ease-out_infinite] rounded-full border-4 border-cyan-500 [animation-delay:0.5s]`}
                        />
                        <div className="pointer-events-none absolute -inset-2 animate-pulse rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-sm" />
                      </>
                    )}
                    <div
                      className={`relative flex ${ScoreSize} items-center justify-center rounded-full bg-white/95 text-2xl font-black text-black transition-all ${isEureka ? 'shadow-eureka animate-pulse' : 'shadow-lg'}`}
                    >
                      {scorePct}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap justify-center gap-5">
              {[
                { name: 'Passions', color: '#ff0050' },
                { name: 'Talents', color: '#0080ff' },
                { name: 'Impact', color: '#00ff80' },
                { name: 'Potentiel', color: '#ffc800' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-2"
                >
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Keywords */}
          <div
            ref={(el) => {
              cardRefs.current[2] = el;
            }}
            className={UI_CLASSES.CARD}
          >
            <div className="mb-5 flex items-center gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white">
                3
              </span>
              <h2 className={UI_CLASSES.TITLE}>Ajoute tes mots-clés</h2>
            </div>

            <p className={`${UI_CLASSES.SUBTITLE} mb-6`}>
              Ajoute des mots qui te parlent pour chaque dimension. Pas besoin de réfléchir trop
              longtemps.
            </p>

            {/* Tabs */}
            <div
              className={`mb-6 flex gap-2 overflow-x-auto rounded-full bg-white/5 p-1 ${isMobile ? 'scrollbar-hide' : ''}`}
            >
              {(Object.keys(keywordTabMeta) as Array<keyof typeof keywordTabMeta>).map((tab) => {
                const meta = keywordTabMeta[tab];
                const tabCount = keywordsByTab[tab].length;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex shrink-0 items-center gap-2 rounded-full transition-all ${
                      isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
                    } font-semibold ${activeTab === tab ? 'bg-white text-black shadow-lg shadow-black/40' : 'text-white/60 hover:text-white/80'}`}
                  >
                    <span className={`${isMobile ? 'text-base' : 'text-lg'}`}>{meta.emoji}</span>
                    <span className="capitalize">{tab}</span>
                    <span
                      className={`flex items-center justify-center rounded-full px-2 py-0.5 text-xs transition-all ${
                        activeTab === tab
                          ? 'bg-black/20 text-black/70'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {tabCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Keywords panel */}
            <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
              <div className="mb-4 flex min-h-[40px] flex-wrap items-center gap-2">
                {keywordsByTab[activeTab].map((keyword: string) => (
                  <span
                    key={keyword}
                    className="flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-sm text-white transition-colors hover:border-white/40"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeywordUI(keyword)}
                      className="text-white/60 transition-colors hover:text-rose-300"
                      aria-label={`Retirer ${keyword}`}
                    >
                      ×
                    </button>
                  </span>
                ))}

                {keywordsByTab[activeTab].length === 0 && (
                  <span className="text-sm text-white/50">
                    Aucun mot-clé ajouté pour {activeTab}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={keywordInputRef}
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeywordUI()}
                  placeholder={keywordTabMeta[activeTab].placeholder}
                  className={`flex-1 rounded-lg border border-white/10 bg-black/70 px-4 py-2.5 text-white placeholder-white/40 transition-colors focus:border-white/40 focus:ring-2 focus:ring-white/15 focus:outline-none ${isMobile ? 'min-w-[200px] text-sm' : 'min-w-[240px]'}`}
                  aria-label={`Ajouter un mot-clé ${activeTab}`}
                  maxLength={SWEETSPOT_CONFIG.LIMITS.MAX_KEYWORDS_PER_TAB}
                />
                <button
                  onClick={addKeywordUI}
                  className={`rounded-lg bg-white font-semibold text-black transition-all hover:-translate-y-px hover:bg-white/90 ${isMobile ? 'px-4 py-2.5 text-sm' : 'px-5 py-2.5'}`}
                >
                  Ajouter
                </button>

                {successMsg && (
                  <span
                    className={`animate-bounce font-medium text-emerald-400 ${isMobile ? 'text-xs' : 'text-sm'}`}
                  >
                    ✓ Ajouté !
                  </span>
                )}
                {errorMsg && (
                  <span
                    className={`rounded-md border border-amber-300/40 bg-amber-500/15 px-2.5 py-1 text-amber-200 ${isMobile ? 'text-xs' : 'text-xs'}`}
                  >
                    {errorMsg}
                  </span>
                )}
              </div>

              <p className="mt-3 flex items-center gap-2 text-xs text-white/45">
                <span>
                  💡 Astuce : limite à {SWEETSPOT_CONFIG.LIMITS.MAX_KEYWORDS_PER_TAB} mots-clés par
                  dimension pour rester focus.
                </span>
              </p>
            </div>
          </div>

          {/* Card 4: Tags */}
          <div className={UI_CLASSES.CARD}>
            <div className="mb-5 flex items-center gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white">
                4
              </span>
              <h2 className={UI_CLASSES.TITLE}>Boost avec des tags</h2>
              <span className="rounded-xl border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                Optionnel
              </span>
              {state.selectedTags.length > 0 && (
                <span className="rounded-full border border-white/30 bg-white/15 px-2 py-1 text-xs font-medium text-white">
                  {state.selectedTags.length} sélectionné{state.selectedTags.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <p className={`${UI_CLASSES.SUBTITLE} mb-6`}>
              Choisis quelques tags pour affiner les résultats. Plus tu en sélectionnes, plus les
              recommandations seront précises.
            </p>

            <div className="flex flex-wrap gap-3">
              {TAG_POOL.map((tag) => {
                const label = tag.replace(/^[^ ]+\s*/, '');
                const on = state.selectedTags.includes(label);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`relative transform rounded-full border px-4 py-2 font-medium transition-all hover:scale-105 ${
                      on
                        ? 'scale-105 border-white/50 bg-white/20 text-white shadow-lg'
                        : 'border-white/10 bg-black/40 text-white/70 hover:border-white/20 hover:bg-white/8'
                    }`}
                    aria-pressed={on}
                  >
                    {on && (
                      <div className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full border border-black/20 bg-white">
                        <span className="text-xs font-bold text-black">✓</span>
                      </div>
                    )}
                    {tag}
                  </button>
                );
              })}
            </div>

            {state.selectedTags.length > 0 && (
              <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-2 text-xs text-white/60">Tags sélectionnés :</p>
                <div className="flex flex-wrap gap-2">
                  {state.selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/15 px-2 py-1 text-xs text-white"
                    >
                      {tag}
                      <button
                        onClick={() => toggleTag(`🏷️ ${tag}`)}
                        className="ml-1 font-bold text-white/80 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 5: Convergences */}
          <div className={`${UI_CLASSES.CARD} relative`}>
            <div className="mb-5 flex items-center gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white">
                5
              </span>
              <h2 className={UI_CLASSES.TITLE}>Tes pistes prometteuses</h2>

              {/* Score indicator */}
              <div className="ml-auto flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${isEureka ? 'animate-pulse bg-green-400' : scorePct > 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                />
                <span
                  className={`text-sm font-semibold ${isEureka ? 'text-green-400' : scorePct > 50 ? 'text-yellow-400' : 'text-red-400'}`}
                >
                  {isEureka
                    ? 'Zone idéale atteinte !'
                    : scorePct > 50
                      ? 'En bonne voie'
                      : 'Ajuste tes curseurs'}
                </span>
              </div>
            </div>

            <p className={`${UI_CLASSES.SUBTITLE} mb-6`}>
              Basé sur ton profil unique, voici des pistes concrètes qui combinent tes forces.
              {scorePct < 50 && (
                <span className="mt-2 block text-sm text-yellow-300">
                  💡 Ajuste tes curseurs pour voir plus d'options apparaître
                </span>
              )}
            </p>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {displayConvergences.map((conv, index) => (
                <div
                  key={conv.id}
                  className="group relative cursor-pointer rounded-xl border border-white/10 bg-black/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/90 text-xs font-bold text-black">
                    {Math.round(85 + (scorePct - 50) * 0.3)}%
                  </div>

                  <div className="absolute top-0 left-0 h-0.5 w-full rounded-t-xl bg-gradient-to-r from-white/20 to-white/40 opacity-0 transition-opacity group-hover:opacity-100" />

                  <div className="mb-3 flex flex-wrap items-center gap-1">
                    {conv.formula.map((element: string, i: number) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="rounded border border-white/20 bg-white/10 px-2 py-1 text-xs font-medium text-white/90">
                          {element}
                        </span>
                        {i < conv.formula.length - 1 && (
                          <span className="text-xs text-white/50">+</span>
                        )}
                      </span>
                    ))}
                    <span className="mx-1 font-bold text-white/70">→</span>
                  </div>

                  <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover:text-white/90">
                    {conv.result}
                  </h3>
                  <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-white/60">
                    {conv.description}
                  </p>

                  <div className="rounded-r-lg border-l-4 border-white/20 bg-white/5 p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 text-lg text-white/70">💡</span>
                      <div>
                        <strong className="mb-1 block text-white/80">Exemple concret :</strong>
                        <span className="text-white/70">{conv.example}</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute right-3 bottom-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition-colors hover:bg-white/20">
                      Explorer cette piste →
                    </button>
                  </div>
                </div>
              ))}

              {/* Loading card */}
              <div className="relative rounded-xl border border-white/10 bg-black/60 p-5 opacity-60">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white/60" />
                    <p className="text-sm text-white/60">Analyse en cours...</p>
                    <p className="mt-1 text-xs text-white/40">Plus de pistes arrivent</p>
                  </div>
                </div>
              </div>
            </div>

            {isEureka ? (
              <div className="mt-8 rounded-xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-cyan-500/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h4 className="font-semibold text-green-400">Profil équilibré détecté !</h4>
                    <p className="text-sm text-gray-300">
                      Ton Sweet Spot est dans la zone idéale. Ces pistes correspondent bien à ton
                      profil.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="font-semibold text-yellow-400">Affine ton profil</h4>
                    <p className="text-sm text-gray-300">
                      Ajuste tes curseurs et ajoute des mots-clés pour découvrir plus de pistes
                      personnalisées.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {state.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/95 backdrop-blur-sm">
                <div className="text-center">
                  <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                  <p className="mb-2 text-cyan-400">Analyse de ton profil en cours...</p>
                  <p className="text-sm text-gray-400">
                    On croise tes données pour trouver les meilleures pistes ✨
                  </p>
                  <div className="mt-4 flex justify-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="h-2 w-2 animate-bounce rounded-full bg-purple-500"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div
          className={`mt-10 flex justify-center pb-10 ${isMobile ? 'flex-col gap-3 px-4' : 'gap-5'}`}
        >
          <button className={`${UI_CLASSES.BTN_PRIMARY} ${isMobile ? 'w-full' : ''}`}>
            Voir mes pistes
          </button>
          <button
            className={`${UI_CLASSES.BTN_SECONDARY} ${isMobile ? 'w-full justify-center' : ''} flex items-center gap-2`}
          >
            Explorer plus loin <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className={`fixed bottom-8 flex items-center gap-2 rounded-full border border-white/20 bg-black/70 px-6 py-3 text-white/90 transition-all hover:-translate-y-0.5 hover:bg-black/80 ${isMobile ? 'right-4 px-4 py-2 text-sm' : 'right-8'}`}
        >
          <RotateCcw className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          {isMobile ? 'Reset' : 'Repartir de zéro'}
        </button>

        {/* Onboarding modal */}
        {showOnboarding && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 backdrop-blur-sm">
            <div className="animate-fadeIn max-w-md rounded-2xl border border-white/10 bg-black/80 p-7 shadow-2xl">
              <div className="mb-5 flex items-center gap-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 font-bold text-white">
                  {onboardingStep + 1}
                </span>
                <h3 className="text-2xl font-bold text-white">
                  Bienvenue dans ton Sweet Spot Lab !
                </h3>
                <Sparkles className="h-5 w-5 text-white/70" />
              </div>

              <p className="mb-6 leading-relaxed text-white/70">
                {ONBOARDING_STEPS[onboardingStep]}
              </p>

              <div className="mb-6 flex items-center justify-center gap-2">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-2 w-8 rounded-full transition-all ${step === onboardingStep ? 'bg-white' : step < onboardingStep ? 'bg-white/40' : 'bg-white/20'}`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Étape {onboardingStep + 1}/4</span>
                <div className="flex gap-3">
                  <button
                    onClick={skipOnboarding}
                    className="px-4 py-2 text-white/70 transition-colors hover:text-white"
                  >
                    Passer
                  </button>
                  <button
                    onClick={nextOnboardingStep}
                    className="rounded-lg bg-white px-6 py-2 font-semibold text-black transition-all hover:-translate-y-px hover:bg-white/90"
                  >
                    {onboardingStep === 3 ? 'Commencer' : 'Suivant'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes eureka-ring {
          0% {
            transform: scale(0.6);
            opacity: 1;
          }
          100% {
            transform: scale(1.7);
            opacity: 0;
          }
        }
        .shadow-eureka {
          box-shadow:
            0 0 28px rgba(168, 85, 247, 0.35),
            0 0 42px rgba(34, 211, 238, 0.3);
        }
        .slider-custom::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          cursor: pointer;
          border-radius: 50%;
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.4),
            0 0 0 2px rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.9);
          transition: all 0.2s ease;
        }
        .slider-custom::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.6),
            0 0 0 3px rgba(255, 255, 255, 0.2);
        }
        .slider-custom::-webkit-slider-thumb:active {
          transform: scale(1.2);
        }
        .slider-custom::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.9);
          transition: all 0.2s ease;
        }
        .slider-custom::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
        }
        .slider-custom:focus {
          outline: none;
        }
        .slider-custom:focus::-webkit-slider-thumb {
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.4),
            0 0 0 3px rgba(124, 58, 237, 0.5);
        }
        .slider-custom:focus::-moz-range-thumb {
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.4),
            0 0 0 3px rgba(124, 58, 237, 0.5);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 220ms ease-out both;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default memo(SweetSpotLabTeen);
