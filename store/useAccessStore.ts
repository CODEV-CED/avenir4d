// stores/useAccessStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AccessState = {
  // Premium status
  isPremium: boolean;
  purchaseDate?: string;
  pricePaid?: number;

  // Paywall state
  paywallOpen: boolean;
  paywallViews: number;
  paywallContext?: string;
  pendingAction?: () => void;

  // Actions
  hydrateFromDB: () => Promise<void>;
  setPremium: (v: boolean, price?: number) => void;
  openPaywall: (onSuccess?: () => void, context?: string) => void;
  closePaywall: () => void;
  executePendingAction: () => void; // ← Ajout pour plus de clarté
  resetPaywallStats: () => void; // ← Utile pour tests
};

export const useAccessStore = create<AccessState>()(
  persist(
    (set, get) => ({
      // Initial state
      isPremium: false,
      paywallOpen: false,
      paywallViews: 0,

      // Actions
      hydrateFromDB: async () => {
        try {
          const res = await fetch('/api/access/verify', { cache: 'no-store' });
          const json = await res.json();

          if (typeof json?.isPremium === 'boolean') {
            set({ isPremium: json.isPremium });
          } else {
            set({ isPremium: false });
          }
        } catch {
          set({ isPremium: false });
        }
      },

      setPremium: (v, price) => {
        set({
          isPremium: v,
          purchaseDate: v ? new Date().toISOString() : undefined,
          pricePaid: price,
        });

        // ✅ Auto-fermer le paywall et exécuter l'action en attente
        if (v) {
          const { pendingAction } = get();
          set({ paywallOpen: false });
          pendingAction?.();
          set({ pendingAction: undefined, paywallContext: undefined });
        }
      },

      openPaywall: (onSuccess, context) => {
        const currentViews = get().paywallViews;

        set({
          paywallOpen: true,
          pendingAction: onSuccess,
          paywallContext: context,
          paywallViews: currentViews + 1,
        });

        // ✅ Log pour analytics (optionnel)
        if (typeof window !== 'undefined') {
          console.log('[Paywall] Ouverture', { context, views: currentViews + 1 });
        }
      },

      closePaywall: () => {
        set({
          paywallOpen: false,
          pendingAction: undefined,
          paywallContext: undefined,
        });
      },

      // ✅ Helper pour exécuter manuellement l'action en attente
      executePendingAction: () => {
        const { pendingAction } = get();
        if (pendingAction) {
          pendingAction();
          set({ pendingAction: undefined });
        }
      },

      // ✅ Reset stats (utile pour dev/tests)
      resetPaywallStats: () => {
        set({ paywallViews: 0 });
      },
    }),
    {
      name: 'avenir4d-access',
      // ✅ Version du store pour gérer les migrations futures
      version: 1,
      partialize: (s) => ({
        isPremium: s.isPremium,
        purchaseDate: s.purchaseDate,
        pricePaid: s.pricePaid,
      }),
    },
  ),
);

// ✅ Selectors pour éviter re-renders inutiles
export const selectIsPremium = (state: AccessState) => state.isPremium;
export const selectPaywallOpen = (state: AccessState) => state.paywallOpen;
export const selectPaywallContext = (state: AccessState) => state.paywallContext;
