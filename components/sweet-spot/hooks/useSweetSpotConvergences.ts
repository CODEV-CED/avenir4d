// hooks/useSweetSpotConvergences.ts

import { useQuery, useQueryClient, useIsFetching } from '@tanstack/react-query';
import type { UIConvergence } from '@sweet-spot/types/convergences';
import { toUIConvergence } from '@sweet-spot/types/convergences';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

// ============= SCHEMAS DE VALIDATION =============
const ConvergenceSchema = z.object({
  id: z.string(),
  formula: z.array(z.string()),
  result: z.string(),
  description: z.string(),
  example: z.string(),
  score: z.number().optional(),
  matchedDimensions: z.array(z.string()).optional(),
});

const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  viability: z.number(),
  convergenceId: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  estimatedDuration: z.string().optional(),
});

const SweetSpotResponseSchema = z.object({
  convergences: z.array(ConvergenceSchema),
  sweetSpotScore: z.number(),
  analysis: z
    .object({
      strongestDimension: z.string(),
      weakestDimension: z.string(),
      balance: z.number(),
    })
    .optional(),
});

// ============= TYPES =============
// Types dérivés des schemas
type Convergence = z.infer<typeof ConvergenceSchema>;
type Project = z.infer<typeof ProjectSchema>;
type SweetSpotDetectionResponse = z.infer<typeof SweetSpotResponseSchema>;

type DimKey = 'passions' | 'talents' | 'utilite' | 'viabilite';
type SliderValues = Record<DimKey, number>;
type UserKeywords = Record<DimKey, string[]>;

interface UserProfile {
  sliderValues: SliderValues;
  keywords: UserKeywords;
  tags: string[];
  sweetSpotScore: number;
  filterMode: 'union' | 'intersection';
}

interface SweetSpotDetectionRequest {
  weights: SliderValues;
  keywords: UserKeywords;
  boostTags: string[];
  boostEnabled: boolean;
  filterMode: 'union' | 'intersection';
}

// ============= FACTORIES DE CLÉS =============
// Factories pour éviter les divergences de clés
const keyConvergences = (stableKey: string) => ['convergences', stableKey] as const;
const keyProjects = (ids: string[]) => ['projects', [...ids].sort().join('|')] as const;
const keyAllConvergences = () => ['convergences'] as const;
const keyAllProjects = () => ['projects'] as const;

// Fonction pour créer une clé stable et sérialisée
function createStableKey(profile: UserProfile): string {
  const stableProfile = {
    sliders: profile.sliderValues,
    // Trier les keywords pour éviter les différences d'ordre
    keywords: Object.fromEntries(
      Object.entries(profile.keywords).map(([dim, arr]) => [dim, [...arr].sort()]),
    ),
    // Trier les tags pour stabilité
    tags: [...profile.tags].sort(),
    mode: profile.filterMode,
    // ❌ Le score n'est PAS dans la clé car c'est une valeur dérivée
  };
  return JSON.stringify(stableProfile);
}

// ============= SERVICE API =============
// Service API (aligné avec l'architecture Batch 2)
class SweetSpotAPIService {
  async detectSweetSpot(
    profile: UserProfile,
    signal?: AbortSignal,
  ): Promise<SweetSpotDetectionResponse> {
    const request: SweetSpotDetectionRequest = {
      weights: profile.sliderValues,
      keywords: profile.keywords,
      boostTags: profile.tags,
      boostEnabled: profile.tags.length > 0,
      filterMode: profile.filterMode,
    };

    try {
      const response = await fetch('/api/sweet-spot/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const json = await response.json();

      // ✅ Mapper la réponse serveur vers le format attendu
      // Le serveur Batch 2 retourne { score, convergences, metrics }
      const mapped = {
        convergences: json.convergences || [],
        sweetSpotScore: json.score || 0,
        analysis: json.metrics
          ? {
              strongestDimension: json.metrics.strongestDimension || 'passions',
              weakestDimension: json.metrics.weakestDimension || 'viabilite',
              balance: json.metrics.balance || 0.5,
            }
          : undefined,
      };

      // Validation de la réponse mappée
      return SweetSpotResponseSchema.parse(mapped);
    } catch (error) {
      // Ne pas traiter les erreurs d'annulation comme des erreurs
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      // Erreur de validation Zod
      if (error instanceof z.ZodError) {
        console.error('Invalid API response format:', error.issues);
        throw new Error('Invalid response from server');
      }
      console.error('Sweet Spot API error:', error);
      // Fallback sur génération locale en cas d'erreur
      return this.generateLocalFallback(profile);
    }
  }

  // Fallback local pour développement ou erreur API
  private generateLocalFallback(profile: UserProfile): SweetSpotDetectionResponse {
    const convergences: Convergence[] = [];
    const { keywords } = profile;

    // IDs stables basés sur le contenu pour éviter le bruit de cache
    const baseId = Object.values(keywords).flat().join('_').substring(0, 10) || 'default';

    // Générer quelques convergences basiques
    if (keywords.passions.length > 0 && keywords.talents.length > 0) {
      convergences.push({
        id: `fallback_${baseId}_1`, // ID stable basé sur le contenu
        formula: [
          keywords.passions[0] || 'Passion',
          keywords.talents[0] || 'Talent',
          keywords.utilite[0] || 'Impact',
        ],
        result: `Expert ${keywords.passions[0]} à impact`,
        description: `Utiliser ${keywords.talents[0]} pour ${keywords.passions[0]}`,
        example: `Projet combinant ces dimensions`,
        score: profile.sweetSpotScore,
        matchedDimensions: ['passions', 'talents', 'utilite'],
      });
    }

    // Ajouter des exemples par défaut si pas assez de données
    if (convergences.length === 0) {
      convergences.push(
        {
          id: 'default_1',
          formula: ['Design', 'IA', 'Éducation'],
          result: "Coach d'app créatives",
          description: "Expériences d'apprentissage avec l'IA",
          example: 'Portfolio numérique lycéen avec IA',
          score: 0.85,
        },
        {
          id: 'default_2',
          formula: ['Écologie', 'Tech', 'Social'],
          result: 'Innovateur environnemental',
          description: 'Solutions tech pour le climat',
          example: 'Plateforme initiatives locales',
          score: 0.82,
        },
      );
    }

    return {
      convergences,
      sweetSpotScore: profile.sweetSpotScore,
      analysis: {
        strongestDimension: 'passions',
        weakestDimension: 'viabilite',
        balance: 0.7,
      },
    };
  }

  async suggestProjects(convergenceIds: string[], signal?: AbortSignal): Promise<Project[]> {
    try {
      const response = await fetch('/api/sweet-spot/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convergenceIds }),
        signal, // ✅ Support de l'abort
      });

      if (!response.ok) {
        throw new Error(`Projects API error: ${response.status}`);
      }

      const json = await response.json();
      // ✅ Validation avec Zod
      return z.array(ProjectSchema).parse(json);
    } catch (error) {
      // Ne pas traiter les erreurs d'annulation
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }
      if (error instanceof z.ZodError) {
        console.error('Invalid projects response:', error.issues);
        throw new Error('Invalid projects data from server');
      }
      console.error('Projects API error:', error);
      // Fallback basique typé
      return convergenceIds.map((id) => ({
        id: `proj_${id}`,
        title: `Projet basé sur convergence ${id}`,
        description: 'Description du projet',
        viability: 0.75,
        convergenceId: id,
      }));
    }
  }
}

// Instance unique du service
const apiService = new SweetSpotAPIService();

// ============= HOOK PRINCIPAL =============
export const useSweetSpotConvergences = (
  sliderValues: SliderValues,
  userKeywords: UserKeywords,
  selectedTags: string[],
  sweetSpotScore: number,
  filterMode: 'union' | 'intersection',
) => {
  const queryClient = useQueryClient();

  // Créer le profil utilisateur
  const userProfile = useMemo<UserProfile>(
    () => ({
      sliderValues,
      keywords: userKeywords,
      tags: selectedTags,
      sweetSpotScore,
      filterMode,
    }),
    [sliderValues, userKeywords, selectedTags, sweetSpotScore, filterMode],
  );

  // Créer une clé stable et sérialisée
  const stableKey = useMemo(() => createStableKey(userProfile), [userProfile]);
  const queryKey = useMemo(() => keyConvergences(stableKey), [stableKey]);

  // Query principale avec corrections et typage explicite
  const { data, isLoading, isFetching, error, refetch } = useQuery<SweetSpotDetectionResponse>({
    queryKey,
    queryFn: ({ signal }) => apiService.detectSweetSpot(userProfile, signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: Object.values(userKeywords).some((k) => k.length > 0),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant refetch
    retry: 1, // ✅ 1 retry soft pour robustesse réseau
    retryDelay: 800, // ✅ Petit backoff de 800ms
  });

  const convergences = data?.convergences ?? [];
  const analysis = data?.analysis;

  // ✅ États UX prêts à l'emploi
  const hasInput = Object.values(userKeywords).some((k) => k.length > 0);
  const isEmpty = hasInput && !isLoading && convergences.length === 0;
  const hasError = !!error && !isLoading;

  // Prefetch corrigé avec factory de clés
  const prefetchProjects = useCallback(async () => {
    if (convergences.length === 0) return;

    const top3 = convergences.slice(0, 3);
    const ids = top3.map((c) => c.id);
    const projectsKey = keyProjects(ids);

    await queryClient.prefetchQuery<Project[]>({
      queryKey: projectsKey,
      queryFn: ({ signal }) => apiService.suggestProjects(ids, signal),
      staleTime: 10 * 60 * 1000,
    });
  }, [convergences, queryClient]);

  // Optimistic update corrigé - mise à jour sur la clé actuelle
  const optimisticAddKeyword = useCallback(
    async (dim: DimKey, keyword: string) => {
      // 1. Mise à jour optimiste sur la clé ACTUELLE
      queryClient.setQueryData<SweetSpotDetectionResponse>(queryKey, (oldData) => {
        if (!oldData) return undefined;

        return {
          ...oldData,
          convergences: [
            ...oldData.convergences,
            {
              id: `temp_${Date.now()}`,
              formula: [keyword],
              result: `Exploration ${keyword}`,
              description: 'Analyse en cours...',
              example: 'Génération en cours...',
              score: 0,
            },
          ],
        };
      });

      // 2. Invalider toutes les requêtes convergences pour forcer refetch
      await queryClient.invalidateQueries({
        queryKey: keyAllConvergences(),
        refetchType: 'active',
      });
      // ❌ Pas de refetch() ici car invalidateQueries avec refetchType: 'active' le fait déjà
    },
    [queryKey, queryClient],
  );

  // Invalider le cache de manière ciblée avec factories
  const invalidateCache = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: keyAllConvergences(),
      exact: false,
    });
    await queryClient.invalidateQueries({
      queryKey: keyAllProjects(),
      exact: false,
    });
  }, [queryClient]);

  // Optimistic remove keyword - comparaison stricte pour éviter les faux positifs
  const optimisticRemoveKeyword = useCallback(
    async (keywordToRemove: string) => {
      // Fonction de normalisation pour comparaison
      const normalize = (s: string) => s.trim().toLowerCase();
      const normalizedKeyword = normalize(keywordToRemove);

      // Mise à jour optimiste avec comparaison stricte
      queryClient.setQueryData<SweetSpotDetectionResponse>(queryKey, (oldData) => {
        if (!oldData) return undefined;

        return {
          ...oldData,
          convergences: oldData.convergences.filter(
            (c) => !c.formula.some((f) => normalize(f) === normalizedKeyword),
          ),
        };
      });

      // Invalider et refetch
      await invalidateCache();
    },
    [queryKey, queryClient, invalidateCache],
  );

  return {
    // Données
    convergences,
    analysis,

    // États de chargement
    isLoading,
    isFetching, // Exposé pour afficher un spinner discret lors des refetchs

    // États UX
    isEmpty, // Pour afficher un empty state avec guide
    hasError, // Pour afficher un état d'erreur
    hasInput, // Pour savoir si l'utilisateur a commencé

    // Erreur
    error,

    // Actions
    refetch,
    prefetchProjects,
    invalidateCache,
    optimisticAddKeyword,
    optimisticRemoveKeyword,
  };
};

// ============= HOOKS HELPERS =============
// Hook pour gérer le cache global
export const useSweetSpotCache = () => {
  const queryClient = useQueryClient();

  const clearAllCache = useCallback(() => {
    queryClient.clear();
  }, [queryClient]);

  const getCacheSize = useCallback(() => {
    const cache = queryClient.getQueryCache();
    return cache.getAll().length;
  }, [queryClient]);

  const warmupCache = useCallback(async () => {
    // SSR-friendly : ne pas exécuter côté serveur
    if (typeof window === 'undefined') return;

    // Précharger quelques profils courants
    const commonProfiles: UserProfile[] = [
      {
        sliderValues: { passions: 0.7, talents: 0.6, utilite: 0.5, viabilite: 0.4 },
        keywords: { passions: [], talents: [], utilite: [], viabilite: [] },
        tags: [],
        sweetSpotScore: 0.55,
        filterMode: 'union',
      },
      {
        sliderValues: { passions: 0.5, talents: 0.5, utilite: 0.5, viabilite: 0.5 },
        keywords: { passions: [], talents: [], utilite: [], viabilite: [] },
        tags: [],
        sweetSpotScore: 0.5,
        filterMode: 'union',
      },
    ];

    for (const profile of commonProfiles) {
      const stableKey = createStableKey(profile);
      await queryClient.prefetchQuery({
        queryKey: keyConvergences(stableKey),
        queryFn: ({ signal }) => apiService.detectSweetSpot(profile, signal),
        staleTime: 10 * 60 * 1000,
      });
    }
  }, [queryClient]);

  const getQueryState = useCallback(
    (profile: UserProfile) => {
      const stableKey = createStableKey(profile);
      return queryClient.getQueryState(keyConvergences(stableKey));
    },
    [queryClient],
  );

  return {
    clearAllCache,
    getCacheSize,
    warmupCache,
    getQueryState,
  };
};

// Hook helper pour le statut de chargement global avec abonnement
export const useSweetSpotLoadingState = () => {
  const convFetching = useIsFetching({ queryKey: keyAllConvergences() }) > 0;
  const projFetching = useIsFetching({ queryKey: keyAllProjects() }) > 0;

  return {
    isFetchingConvergences: convFetching,
    isFetchingProjects: projFetching,
    isAnyLoading: convFetching || projFetching,
  };
};
