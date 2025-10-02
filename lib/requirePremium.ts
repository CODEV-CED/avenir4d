// lib/requirePremium.ts
import { useAccessStore } from '@/store/useAccessStore';

/**
 * Hook pour protéger une action premium
 *
 * @example
 * ```tsx
 * const checkPremium = useRequirePremium();
 *
 * const handleGenerate = () => {
 *   checkPremium(
 *     () => generateProjects(), // Action premium
 *     'Génération projets'      // Contexte (optionnel)
 *   );
 * };
 * ```
 */
export function useRequirePremium() {
  const { isPremium, openPaywall } = useAccessStore();

  return (premiumAction: () => void, context?: string) => {
    if (isPremium) {
      // ✅ L'utilisateur est premium → exécuter directement
      premiumAction();
    } else {
      // ❌ L'utilisateur n'est pas premium → ouvrir paywall
      // L'action sera exécutée automatiquement après paiement
      openPaywall(premiumAction, context);
    }
  };
}

/**
 * Variante pour vérifier simplement le statut premium
 * sans déclencher automatiquement le paywall
 *
 * @example
 * ```tsx
 * const isPremium = useIsPremium();
 *
 * if (!isPremium) {
 *   return <PremiumBadge />;
 * }
 * ```
 */
export function useIsPremium() {
  return useAccessStore((state) => state.isPremium);
}

/**
 * Helper pour ouvrir manuellement le paywall
 * avec un contexte personnalisé
 *
 * @example
 * ```tsx
 * const showPaywall = useOpenPaywall();
 *
 * <button onClick={() => showPaywall('Voir la démo')}>
 *   Débloquer ✨
 * </button>
 * ```
 */
export function useOpenPaywall() {
  return useAccessStore((state) => state.openPaywall);
}

/**
 * Version non-hook pour usage dans des fonctions utilitaires
 * ou des event handlers sans règles des hooks
 *
 * @example
 * ```ts
 * import { requirePremium } from '@/lib/requirePremium';
 *
 * const handleClick = () => {
 *   requirePremium(
 *     () => console.log('Action premium'),
 *     'Feature XYZ'
 *   );
 * };
 * ```
 */
export function requirePremium(premiumAction: () => void, context?: string) {
  const { isPremium, openPaywall } = useAccessStore.getState();

  if (isPremium) {
    premiumAction();
  } else {
    openPaywall(premiumAction, context);
  }
}
