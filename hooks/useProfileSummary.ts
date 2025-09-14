import { useMemo } from 'react';
import {
  generateProfileSummary,
  createProfileBadges,
  detectAtypicalProfile,
} from '@/lib/sweetspot/profile-builder';
import type { SweetSpotProfile } from '@/lib/sweetspot/types';

type ConfidenceLevel = 'faible' | 'moyenne' | 'élevée';

export type ProfileSummaryState = {
  summary: ReturnType<typeof generateProfileSummary>;
  badges: ReturnType<typeof createProfileBadges>;
  atypical: ReturnType<typeof detectAtypicalProfile>;
  isHighQuality: boolean;
  needsImprovement: boolean;
  dominantEmoji: '💝' | '🎯' | '🌍' | '💼';
};

type UseProfileSummaryOptions = {
  highQualityMinKeywords?: number; // default 8
  needsImprovementMinKeywords?: number; // default 5
};

export function useProfileSummary(
  profile?: SweetSpotProfile | null,
  options: UseProfileSummaryOptions = {},
): ProfileSummaryState | null {
  const { highQualityMinKeywords = 8, needsImprovementMinKeywords = 5 } = options;

  // Deps plus fines pour éviter les re-calculs si l'objet profile est recréé souvent
  const base4d = (profile as any)?.profile4d;
  const keywords = (profile as any)?.keywords;
  const createdAt = (profile as any)?.created_at;

  return useMemo(() => {
    if (!profile || !base4d) return null;

    const summary = generateProfileSummary(profile);
    const badges = createProfileBadges(summary);
    const atypical = detectAtypicalProfile(profile);

    const keywordsCount = summary.topKeywords?.length ?? 0;

    const isHighQuality =
      (summary.confidenceLevel as ConfidenceLevel) === 'élevée' &&
      keywordsCount >= highQualityMinKeywords;

    const needsImprovement =
      (summary.confidenceLevel as ConfidenceLevel) === 'faible' ||
      keywordsCount < needsImprovementMinKeywords;

    // Map typée avec clés exactes pour éviter les erreurs
    const emojiMap = {
      plaisir: '💝',
      compétence: '🎯',
      utilité: '🌍',
      viabilité: '💼',
    } as const;

    const dominantEmoji = emojiMap[summary.dominantDimension as keyof typeof emojiMap] ?? '💼';

    return {
      summary,
      badges,
      atypical,
      isHighQuality,
      needsImprovement,
      dominantEmoji,
    };
  }, [
    base4d?.plaisir,
    base4d?.competence,
    base4d?.utilite,
    base4d?.viabilite,
    base4d?.confidence_avg,
    keywords,
    createdAt,
    highQualityMinKeywords,
    needsImprovementMinKeywords,
  ]);
}

// Hook utilitaire pour les composants simples
export function useProfileStatus(profile?: SweetSpotProfile | null) {
  const state = useProfileSummary(profile);

  return useMemo(() => {
    if (!state) return { hasProfile: false };

    return {
      hasProfile: true,
      quality: state.isHighQuality ? 'high' : state.needsImprovement ? 'low' : 'medium',
      dominantDimension: state.summary.dominantDimension,
      dominantEmoji: state.dominantEmoji,
      confidenceScore: state.summary.confidenceScore,
      keywordsCount: state.summary.topKeywords?.length ?? 0,
    };
  }, [state]);
}
