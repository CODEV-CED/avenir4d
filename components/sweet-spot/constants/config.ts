// components/sweet-spot/constants/config.ts

export const SWEETSPOT_CONFIG = {
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
  THRESHOLDS: {
    EUREKA_SCORE: 0.7,
    WARNING_SCORE: 0.5,
  },
} as const;

export const ONBOARDING_STEPS = [
  'Bouge les curseurs : ton profil bouge en temps réel.',
  'Observe "l\'Ikigaï" : les zones qui se recoupent, c\'est ton Sweet Spot.',
  'Ajoute 4–8 mots-clés par dimension : ça affine les résultats.',
  'Découvre tes convergences et des pistes concrètes.',
];
