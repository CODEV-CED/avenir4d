// components/sweet-spot/services/ia-service.ts
/**
 * Service IA - Version Finale
 * - IDs déterministes pour stabilité UI/cache
 * - Hash profond pour cache fiable
 * - Tokenisation pour similarité sémantique précise
 * - Validation robuste
 * - Options transmises au backend
 */

import type {
  SliderValues,
  UserKeywords,
  EngineConvergence,
  DimKey,
  SweetSpotResult,
  Project,
} from '@sweet-spot/types';

// Alias interne : on continue d'écrire "Convergence" dans ce fichier
type Convergence = EngineConvergence;

// Options pour les appels IA
export interface IAOptions {
  signal?: AbortSignal;
  cache?: boolean;
  maxResults?: number;
}

export interface UserProfile {
  sliderValues: SliderValues;
  userKeywords: UserKeywords;
  selectedTags?: string[];
}

// Interface du service
export interface IAService {
  generateConvergences(profile: UserProfile, opts?: IAOptions): Promise<Convergence[]>;
  detectSweetSpot(keywords: UserKeywords, opts?: IAOptions): Promise<SweetSpotResult>;
  suggestProjects(convergences: Convergence[], opts?: IAOptions): Promise<Project[]>;
}

// ============= UTILITAIRES AMÉLIORÉS =============

// Normalisation des chaînes (accents, casse, espaces)
const normalizeString = (str: string): string =>
  str
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

// Tokenisation pour éviter les faux positifs (art dans start)
const tokenize = (str: string): string[] =>
  normalizeString(str)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3); // Minimum 3 lettres

// Hash stable profond pour cache fiable
function stableStringify(obj: any): string {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) {
    return `[${obj.map(stableStringify).join(',')}]`;
  }
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}

const stableHash = (obj: unknown): string => stableStringify(obj);

// Génération d'ID déterministe pour convergences
const generateConvergenceId = (dim1: string, dim2: string, k1: string, k2: string): string => {
  const dimsKey = [dim1, dim2].sort().join('-');
  const kwKey = [normalizeString(k1), normalizeString(k2)].sort().join('-');
  return `conv:${dimsKey}:${kwKey}`;
};

// Mini LRU Cache
class LRUCache<K, V> {
  private map = new Map<K, V>();

  constructor(private capacity = 50) {}

  get(key: K): V | undefined {
    const value = this.map.get(key);
    if (value) {
      // Refresh: déplacer à la fin
      this.map.delete(key);
      this.map.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    }
    this.map.set(key, value);

    // Éviction si dépassement capacité
    if (this.map.size > this.capacity) {
      const firstKey = this.map.keys().next().value!;
      this.map.delete(firstKey);
    }
  }

  clear(): void {
    this.map.clear();
  }
}

// Caches partagés
const convergenceCache = new LRUCache<string, Convergence[]>(30);
const sweetSpotCache = new LRUCache<string, SweetSpotResult>(20);
const projectCache = new LRUCache<string, Project[]>(20);

// ============= VALIDATION ROBUSTE =============

function isNumberBetween01(n: any): boolean {
  return typeof n === 'number' && n >= 0 && n <= 1;
}

function isStringArray(arr: any): boolean {
  return Array.isArray(arr) && arr.every((s) => typeof s === 'string');
}

export function validateProfile(profile: any): boolean {
  if (!profile || typeof profile !== 'object') return false;

  // Vérifier sliderValues
  if (!profile.sliderValues || typeof profile.sliderValues !== 'object') return false;
  const sliderKeys = ['passions', 'talents', 'utilite', 'viabilite'];
  if (!sliderKeys.every((key) => isNumberBetween01(profile.sliderValues[key]))) return false;

  // Vérifier userKeywords
  if (!profile.userKeywords || typeof profile.userKeywords !== 'object') return false;
  if (!sliderKeys.every((key) => isStringArray(profile.userKeywords[key]))) return false;

  // Vérifier selectedTags optionnel
  if (profile.selectedTags && !isStringArray(profile.selectedTags)) return false;

  return true;
}

export function validateKeywords(keywords: any): boolean {
  if (!keywords || typeof keywords !== 'object') return false;
  const allowed = ['passions', 'talents', 'utilite', 'viabilite'] as const;
  const keys = Object.keys(keywords);
  // uniquement les clés prévues, et chaque valeur = string[]
  if (!keys.every((k) => (allowed as readonly string[]).includes(k))) return false;
  return keys.every(
    (k) =>
      Array.isArray(keywords[k]) &&
      keywords[k].every((s: unknown) => typeof s === 'string' && s.trim().length > 0),
  );
}

export function validateConvergences(convergences: any): boolean {
  if (!Array.isArray(convergences)) return false;

  return convergences.every(
    (c) =>
      c.id &&
      typeof c.id === 'string' &&
      Array.isArray(c.dimensions) &&
      c.dimensions.length === 2 &&
      Array.isArray(c.keywords) &&
      c.keywords.length >= 2 &&
      typeof c.strength === 'number' &&
      c.strength >= 0 &&
      c.strength <= 1,
  );
}

// ============= MOCK SERVICE AMÉLIORÉ =============

export class MockIAService implements IAService {
  // Dictionnaire de similarité sémantique normalisé
  private similarityMap: Record<string, string[]> = {
    creation: ['creativite', 'design', 'art', 'innovation', 'creer', 'inventer', 'conception'],
    tech: [
      'technologie',
      'digital',
      'informatique',
      'code',
      'developpement',
      'programmation',
      'logiciel',
    ],
    impact: [
      'social',
      'environnement',
      'aide',
      'societe',
      'ecologie',
      'durable',
      'solidaire',
      'humanitaire',
    ],
    business: [
      'entrepreneuriat',
      'commerce',
      'gestion',
      'startup',
      'finance',
      'economie',
      'management',
    ],
    sante: ['medecine', 'bienetre', 'soin', 'sport', 'nutrition', 'fitness', 'therapie', 'medical'],
    education: [
      'enseignement',
      'formation',
      'pedagogie',
      'apprentissage',
      'ecole',
      'universite',
      'cours',
    ],
    communication: [
      'media',
      'marketing',
      'relations',
      'reseau',
      'influence',
      'journalisme',
      'publicite',
    ],
    analyse: [
      'data',
      'recherche',
      'etude',
      'statistiques',
      'evaluation',
      'mesure',
      'audit',
      'donnees',
    ],
  };

  private areSemanticallySimilar(word1: string, word2: string): boolean {
    const tokens1 = tokenize(word1);
    const tokens2 = tokenize(word2);

    // Égalité directe des tokens
    if (tokens1.join(' ') === tokens2.join(' ')) return true;

    // Vérification par groupe sémantique avec tokens
    for (const [key, values] of Object.entries(this.similarityMap)) {
      const bagTokens = new Set([...tokenize(key), ...values.flatMap((v) => tokenize(v))]);

      const hasTokens1 = tokens1.some((t) => bagTokens.has(t));
      const hasTokens2 = tokens2.some((t) => bagTokens.has(t));

      if (hasTokens1 && hasTokens2) return true;
    }

    return false;
  }

  async generateConvergences(profile: UserProfile, opts?: IAOptions): Promise<Convergence[]> {
    const cacheKey = stableHash({ p: profile });

    // Vérifier le cache
    if (opts?.cache !== false) {
      const cached = convergenceCache.get(cacheKey);
      if (cached) return cached;
    }

    // Simulation de latence avec support abort
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 300);
      if (opts?.signal) {
        opts.signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      }
    });

    const { sliderValues, userKeywords } = profile;
    const dimensions = ['passions', 'talents', 'utilite', 'viabilite'] as const;
    const convergences: Convergence[] = [];
    const seen = new Set<string>();

    // Détection des convergences avec IDs déterministes
    for (let i = 0; i < dimensions.length; i++) {
      for (let j = i + 1; j < dimensions.length; j++) {
        const dim1 = dimensions[i];
        const dim2 = dimensions[j];
        const keywords1 = userKeywords[dim1] || [];
        const keywords2 = userKeywords[dim2] || [];

        for (const k1 of keywords1) {
          for (const k2 of keywords2) {
            if (!this.areSemanticallySimilar(k1, k2)) continue;

            // ID déterministe
            const id = generateConvergenceId(dim1, dim2, k1, k2);

            // Éviter les doublons
            if (seen.has(id)) continue;
            seen.add(id);

            const strength = (sliderValues[dim1] + sliderValues[dim2]) / 2;

            convergences.push({
              id,
              dimensions: [dim1, dim2],
              keywords: [k1, k2],
              strength: Math.round(strength * 100) / 100,
              description: `Convergence entre ${k1} et ${k2}`,
            });
          }
        }
      }
    }

    // Tri stable : force décroissante, puis ID croissant
    convergences.sort((a, b) => {
      const strengthDiff = b.strength - a.strength;
      if (strengthDiff !== 0) return strengthDiff;
      return a.id.localeCompare(b.id);
    });

    // Top-K résultats
    const maxResults = opts?.maxResults || 6;
    const topConvergences = convergences.slice(0, maxResults);

    // Mettre en cache
    if (opts?.cache !== false) {
      convergenceCache.set(cacheKey, topConvergences);
    }

    return topConvergences;
  }

  async detectSweetSpot(keywords: UserKeywords, opts?: IAOptions): Promise<SweetSpotResult> {
    const cacheKey = stableHash({ k: keywords });

    if (opts?.cache !== false) {
      const cached = sweetSpotCache.get(cacheKey);
      if (cached) return cached;
    }

    // Simulation avec abort
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 200);
      if (opts?.signal) {
        opts.signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      }
    });

    const counts = Object.values(keywords).map((arr) => arr.length);
    const total = counts.reduce((a, b) => a + b, 0);
    const spread = total ? (Math.max(...counts) - Math.min(...counts)) / Math.max(1, total) : 1;
    const score = total ? Math.max(0, 1 - spread) : 0;

    const result: SweetSpotResult = {
      score: Math.round(score * 100) / 100,
      insights: [
        score > 0.7 ? '✨ Équilibre fort entre tes dimensions' : '📊 Équilibre partiel détecté',
        total >= 12 ? '💪 Base de mots-clés solide' : '➕ Ajoute encore quelques mots-clés',
        score > 0.5 ? '🎯 Bon potentiel de convergences' : "🔄 Continue d'explorer tes dimensions",
      ],
      recommendations: [
        counts[1] < 3 ? 'Renforce la dimension Talents' : 'Affine 1-2 talents clés',
        counts[0] < 3 ? 'Explore davantage tes Passions' : 'Priorise tes passions dominantes',
        counts[2] < 3 ? "Précise ta vision d'Impact" : "Transforme 1 idée d'impact en mini-projet",
      ],
    };

    if (opts?.cache !== false) {
      sweetSpotCache.set(cacheKey, result);
    }

    return result;
  }

  async suggestProjects(convergences: Convergence[], opts?: IAOptions): Promise<Project[]> {
    // Cache basé sur les IDs déterministes
    const cacheKey = stableHash({ c: convergences.map((c) => c.id).sort() });

    if (opts?.cache !== false) {
      const cached = projectCache.get(cacheKey);
      if (cached) return cached;
    }

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, 200);
      if (opts?.signal) {
        opts.signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      }
    });

    const projects = convergences.slice(0, 3).map((conv, index) => ({
      id: `project-${conv.id}`, // ID basé sur convergence déterministe
      title: `Projet ${conv.keywords.join(' + ')}`,
      description: `Combine ${conv.keywords[0]} et ${conv.keywords[1]} pour créer une solution innovante et concrète.`,
      matchScore: Math.min(1, Math.max(0.5, conv.strength)),
      requiredSkills: conv.keywords,
      timeHorizon: conv.strength > 0.8 ? '3-6 mois' : '6-12 mois',
      difficulty: conv.strength > 0.8 ? 'Intermédiaire' : 'Accessible',
    }));

    if (opts?.cache !== false) {
      projectCache.set(cacheKey, projects);
    }

    return projects;
  }
}

// ============= CLIENT PROXY (TRANSMET OPTIONS) =============
class ClientIAService implements IAService {
  private baseUrl = '/api/sweet-spot';

  async generateConvergences(profile: UserProfile, opts?: IAOptions): Promise<Convergence[]> {
    try {
      // Corps "tolérant" : adapte si ta route attend exactement weights/keywords/boostTags/filterMode
      const body = {
        weights: profile.sliderValues,
        keywords: profile.userKeywords,
        boostTags: profile.selectedTags ?? [],
        boostEnabled: (profile.selectedTags?.length ?? 0) > 0,
        // si tu as un state filterMode côté appelant, passe-le ici; sinon 'union' par défaut
        filterMode: 'union',
        options: { cache: opts?.cache, maxResults: opts?.maxResults },
      };

      const res = await fetch(`${this.baseUrl}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: opts?.signal,
        cache: 'no-store',
        keepalive: true,
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const json = await res.json();

      // Formats possibles gérés
      const convergences: Convergence[] = json?.convergences ?? json?.data?.convergences ?? [];

      return convergences;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      console.error('Erreur API convergences (/detect):', error);
      return new MockIAService().generateConvergences(profile, opts);
    }
  }

  async detectSweetSpot(keywords: UserKeywords, opts?: IAOptions): Promise<SweetSpotResult> {
    try {
      // Si ta route a besoin d'autres champs (weights/filterMode), ajoute-les ici.
      const body = { keywords, options: { cache: opts?.cache } };

      const res = await fetch(`${this.baseUrl}/detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: opts?.signal,
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const json = await res.json();

      const result: SweetSpotResult = {
        score: json?.score ?? json?.data?.score ?? 0,
        insights: json?.insights ?? json?.data?.insights ?? [],
        recommendations: json?.recommendations ?? json?.data?.recommendations ?? [],
      };

      return result;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      console.error('Erreur API sweet-spot (/detect):', error);
      return new MockIAService().detectSweetSpot(keywords, opts);
    }
  }

  async suggestProjects(convergences: Convergence[], opts?: IAOptions): Promise<Project[]> {
    try {
      const res = await fetch(`${this.baseUrl}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convergences, options: { cache: opts?.cache } }),
        signal: opts?.signal,
      });

      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      return await res.json();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      console.error('Erreur API projects (/projects):', error);
      return new MockIAService().suggestProjects(convergences, opts);
    }
  }
}

// ============= FACTORY =============

/**
 * Crée le service IA approprié selon l'environnement
 * - Côté serveur : MockIAService (ou ClaudeService si clé API disponible)
 * - Côté client : ClientIAService qui appelle l'API
 */
export function createIAService(): IAService {
  // Côté serveur
  if (typeof window === 'undefined') {
    // En production avec clé API, tu pourras créer ClaudeServerService
    // qui utilisera process.env.ANTHROPIC_API_KEY (non-public)
    return new MockIAService();
  }

  // Côté client : proxy via API routes (pas de clé exposée)
  return new ClientIAService();
}

// Export par défaut
const iaService = createIAService();
export default iaService;

// ============= HELPERS EXPORT =============

export { normalizeString, tokenize, stableHash, generateConvergenceId, LRUCache };

// Clear caches utility (pour les tests ou reset)
export function clearAllCaches(): void {
  convergenceCache.clear();
  sweetSpotCache.clear();
  projectCache.clear();
}
