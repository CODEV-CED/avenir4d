// components/sweet-spot/utils/validation.ts
/**
 * Fonctions de validation partagées entre services et routes
 * Séparées pour éviter les imports circulaires
 */

// ============= HELPERS DE VALIDATION =============

function isNumberBetween01(n: any): boolean {
  return typeof n === 'number' && !isNaN(n) && n >= 0 && n <= 1;
}

function isStringArray(arr: any): boolean {
  return Array.isArray(arr) && arr.every((s) => typeof s === 'string' && s.trim().length > 0);
}

function isNonEmptyString(str: any): boolean {
  return typeof str === 'string' && str.trim().length > 0;
}

// ============= VALIDATIONS PRINCIPALES =============

/**
 * Valide un profil utilisateur complet
 */
export function validateProfile(profile: any): boolean {
  if (!profile || typeof profile !== 'object') return false;

  // Vérifier sliderValues (obligatoire)
  if (!profile.sliderValues || typeof profile.sliderValues !== 'object') return false;

  const requiredSliders = ['passions', 'talents', 'utilite', 'viabilite'] as const;
  const hasAllSliders = requiredSliders.every(
    (key) => key in profile.sliderValues && isNumberBetween01(profile.sliderValues[key]),
  );
  if (!hasAllSliders) return false;

  // Vérifier userKeywords (obligatoire)
  if (!profile.userKeywords || typeof profile.userKeywords !== 'object') return false;

  const hasAllKeywords = requiredSliders.every(
    (key) => key in profile.userKeywords && isStringArray(profile.userKeywords[key]),
  );
  if (!hasAllKeywords) return false;

  // Vérifier selectedTags (optionnel)
  if ('selectedTags' in profile && !isStringArray(profile.selectedTags)) {
    return false;
  }

  // Vérifier les limites (max 12 keywords par dimension)
  const MAX_KEYWORDS = 12; // dupliqué ici volontairement (évite import circulaire)
  for (const key of requiredSliders) {
    if (profile.userKeywords[key].length > MAX_KEYWORDS) {
      return false;
    }
  }

  // (Optionnel) Limiter la taille de chaque mot-clé
  for (const key of requiredSliders) {
    if (!profile.userKeywords[key].every((k: string) => k.trim().length <= 50)) return false;
  }

  return true;
}

/**
 * Valide des mots-clés (autorise le partiel, interdit les clés inconnues)
 */
export function validateKeyword(
  keyword: string,
  opts: { minLen?: number; maxLen?: number } = {},
): { isValid: boolean; error?: string } {
  const { minLen = 1, maxLen = 50 } = opts;
  const trimmed = (keyword ?? '').trim();

  if (trimmed.length < minLen) {
    return { isValid: false, error: 'Le mot-clé ne peut pas être vide' };
  }
  if (trimmed.length > maxLen) {
    return { isValid: false, error: `Maximum ${maxLen} caractères` };
  }

  // Lettres/chiffres/espaces/underscore/tiret + accents étendus
  const validPattern = /^[\w\s\-À-ÿ]+$/u;
  if (!validPattern.test(trimmed)) {
    return { isValid: false, error: 'Caractères non autorisés' };
  }
  return { isValid: true };
}

/** Nettoie une saisie avant insertion (trim, espaces multiples, chars HTML) */
export function sanitizeInput(input: string, maxLen = 50): string {
  return (input ?? '').trim().replace(/[<>]/g, '').replace(/\s+/g, ' ').slice(0, maxLen);
}

/** Détecte les doublons case/trim-insensitive dans une liste */
export function keywordExists(keyword: string, existing: string[]): boolean {
  const normalized = (keyword ?? '').toLowerCase().trim();
  return (existing ?? []).some((k) => (k ?? '').toLowerCase().trim() === normalized);
}

/**
 * Valide un tableau de convergences
 */
export function validateConvergences(convergences: any): boolean {
  if (!Array.isArray(convergences)) return false;
  if (convergences.length === 0) return true; // Tableau vide OK

  const allowedDims = new Set(['passions', 'talents', 'utilite', 'viabilite']);

  return convergences.every(
    (conv) =>
      conv &&
      typeof conv === 'object' &&
      isNonEmptyString(conv.id) &&
      Array.isArray(conv.dimensions) &&
      conv.dimensions.length === 2 &&
      conv.dimensions.every((d: any) => isNonEmptyString(d) && allowedDims.has(String(d))) &&
      Array.isArray(conv.keywords) &&
      conv.keywords.length >= 2 &&
      conv.keywords.every((k: any) => isNonEmptyString(k) && String(k).trim().length <= 50) &&
      typeof conv.strength === 'number' &&
      conv.strength >= 0 &&
      conv.strength <= 1,
  );
}

/**
 * Valide les options d'API
 */
export function validateOptions(options: any): boolean {
  if (!options) return true; // Options optionnelles
  if (typeof options !== 'object') return false;

  // cache?: boolean
  if ('cache' in options && typeof options.cache !== 'boolean') return false;

  // maxResults?: 1..100
  if ('maxResults' in options) {
    const max = options.maxResults;
    if (typeof max !== 'number' || max < 1 || max > 100) return false;
  }

  return true;
}

/**
 * Parse JSON de manière sécurisée
 */
export async function parseJsonSafe(request: Request): Promise<{ data: any; error?: string }> {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return { data: null, error: 'Content-Type must be application/json' };
    }
    const data = await request.json();
    return { data };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

/**
 * Extrait l'IP réelle depuis les headers
 */
export function getRealIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIP = forwarded.split(',')[0]?.trim();
    if (firstIP) return firstIP;
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP.trim();

  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP.trim();

  const fastlyIP = request.headers.get('fastly-client-ip');
  if (fastlyIP) return fastlyIP.trim();

  return 'unknown';
}

/**
 * Headers CORS réutilisables
 */
export function getCORSHeaders(): Record<string, string> {
  const allowedOrigin = process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
}

/**
 * Créer une réponse d'erreur standardisée
 */
export function errorResponse(
  message: string,
  status: number,
  additionalHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders(),
      ...additionalHeaders,
    },
  });
}

/**
 * Créer une réponse de succès standardisée
 */
export function successResponse(data: any, additionalHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...getCORSHeaders(),
      ...additionalHeaders,
    },
  });
}
