// components/sweet-spot/ui/sections/KeywordsSection.tsx
import React, { memo, useCallback, useRef, useEffect, useMemo } from 'react';
import { useSweetSpot } from '@sweet-spot/hooks';
import { useKeyboardHeight } from '@sweet-spot/hooks/useKeyboardHeight';
import { keywordTabMeta, UI_CLASSES, SWEETSPOT_CONFIG } from '@sweet-spot/constants';
import { validateKeyword, sanitizeInput, keywordExists } from '@sweet-spot/utils';
import { uiToEngine } from '@sweet-spot/types';
import { KeywordChip } from '@sweet-spot/ui/components/KeywordChip';
import type { UIKey } from '@sweet-spot/types/dimensions';

// --- helpers tab (définis en dehors du composant pour éviter de recréer à chaque render)
const VALID_TABS: UIKey[] = ['passions', 'talents', 'impact', 'potentiel'];
const TABS: UIKey[] = ['passions', 'talents', 'impact', 'potentiel'];
const normalizeTab = (t: unknown): UIKey => {
  if (t === 'utilite') return 'impact';
  if (t === 'viabilite') return 'potentiel';
  return VALID_TABS.includes(t as UIKey) ? (t as UIKey) : 'passions';
};

export const KeywordsSection = memo(() => {
  const { state, uiState, actions } = useSweetSpot();
  const keyboardHeight = useKeyboardHeight();
  const keywordInputRef = useRef<HTMLInputElement | null>(null);
  const startX = useRef<number | null>(null);

  // focus input à chaque changement d’onglet
  useEffect(() => {
    const el = keywordInputRef.current;
    if (!el) return;

    // Légère tempo pour éviter les sauts liés au layout
    const t = setTimeout(() => {
      try {
        // ✅ focus sans scroll
        el.focus({ preventScroll: true });
      } catch {}
    }, 80);

    return () => clearTimeout(t);
  }, [uiState.errorMsg, actions]);

  useEffect(() => {
    if (!uiState.successMsg) return;
    const t = setTimeout(
      () => actions.setSuccess(false),
      SWEETSPOT_CONFIG.ANIMATIONS.SUCCESS_DURATION,
    );
    return () => clearTimeout(t);
  }, [uiState.successMsg, actions]);

  // onglet actif normalisé
  const activeTab = normalizeTab(uiState.activeTab);

  const navigateToNextTab = useCallback(() => {
    const currentIndex = TABS.indexOf(activeTab);
    const nextTab = TABS[(currentIndex + 1) % TABS.length];
    actions.setActiveTab(nextTab);
  }, [activeTab, actions]);

  const navigateToPrevTab = useCallback(() => {
    const currentIndex = TABS.indexOf(activeTab);
    const prevTab = TABS[(currentIndex - 1 + TABS.length) % TABS.length];
    actions.setActiveTab(prevTab);
  }, [activeTab, actions]);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    startX.current = touch ? touch.clientX : null;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (startX.current == null) return;
      const touch = e.changedTouches[0];
      if (!touch) {
        startX.current = null;
        return;
      }
      const dx = touch.clientX - startX.current;
      if (Math.abs(dx) > 45) {
        if (dx < 0) {
          navigateToNextTab();
        } else {
          navigateToPrevTab();
        }
      }
      startX.current = null;
    },
    [navigateToNextTab, navigateToPrevTab],
  );

  // projection state -> tabs (mémoisée)
  const keywordsByTab = useMemo(
    () => ({
      passions: state.userKeywords.passions || [],
      talents: state.userKeywords.talents || [],
      impact: state.userKeywords.utilite || [], // mapping utilite -> impact
      potentiel: state.userKeywords.viabilite || [], // mapping viabilite -> potentiel
    }),
    [state.userKeywords],
  );

  // vue safe (toujours des tableaux)
  const keywordsByTabSafe: Record<UIKey, string[]> = {
    passions: keywordsByTab.passions ?? [],
    talents: keywordsByTab.talents ?? [],
    impact: keywordsByTab.impact ?? [],
    potentiel: keywordsByTab.potentiel ?? [],
  };

  const addKeywordUI = useCallback(() => {
    const sanitized = sanitizeInput(uiState.keywordInput);
    const validation = validateKeyword(sanitized);
    if (!validation.isValid) {
      actions.setError(validation.error || 'Erreur de validation');
      actions.setScreenReaderMessage(`Erreur: ${validation.error}`);
      return;
    }

    const currentKeywords = keywordsByTabSafe[activeTab];
    if (keywordExists(sanitized, currentKeywords)) {
      actions.setError('Ce mot-clé existe déjà');
      return;
    }
    if (currentKeywords.length >= SWEETSPOT_CONFIG.LIMITS.MAX_KEYWORDS_PER_TAB) {
      actions.setError(
        `Tu as atteint ${SWEETSPOT_CONFIG.LIMITS.MAX_KEYWORDS_PER_TAB} mots-clés pour cette dimension.`,
      );
      return;
    }

    actions.addKeyword(uiToEngine[activeTab], sanitized);
    actions.setKeywordInput('');
    actions.setSuccess(true);
    actions.setScreenReaderMessage(`Mot-clé ${sanitized} ajouté avec succès`);
  }, [uiState.keywordInput, activeTab, keywordsByTabSafe, actions]);

  const removeKeywordUI = useCallback(
    (keyword: string) => {
      actions.removeKeyword(uiToEngine[activeTab], keyword);
      actions.setScreenReaderMessage(`Mot-clé ${keyword} supprimé`);
      actions.setError(null);
    },
    [activeTab, actions],
  );

  return (
    <>
      <p className={`${UI_CLASSES.SUBTITLE} mb-6`}>
        Ajoute des mots qui te parlent pour chaque dimension. Pas besoin de réfléchir trop
        longtemps.
      </p>

      {/* Onglets */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`mb-6 flex gap-2 overflow-x-auto rounded-full bg-white/5 p-1 ${uiState.isMobile ? 'scrollbar-hide snap-x snap-mandatory' : ''}`}
      >
        {(Object.keys(keywordTabMeta) as Array<keyof typeof keywordTabMeta>).map((tab) => {
          const meta = keywordTabMeta[tab];
          const tabKey = tab as UIKey;
          const tabCount = keywordsByTabSafe[tabKey].length;
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tab}
              onClick={() => actions.setActiveTab(tab)}
              className={`flex shrink-0 items-center gap-2 rounded-full transition-all ${
                uiState.isMobile ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
              } font-semibold ${isActive ? 'bg-white text-black shadow-lg shadow-black/40' : 'text-white/60 hover:text-white/80'}`}
            >
              <span className={`${uiState.isMobile ? 'text-base' : 'text-lg'}`}>{meta.emoji}</span>
              <span className="capitalize">{tab}</span>
              <span
                className={`flex items-center justify-center rounded-full px-2 py-0.5 text-xs transition-all ${isActive ? 'bg-black/20 text-black/70' : 'bg-white/10 text-white/70'}`}
              >
                {tabCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel mots-clés */}
      <div className="rounded-2xl border border-white/10 bg-black/60 p-5">
        <div className="mb-4 flex min-h-[40px] flex-wrap items-center gap-2">
          {keywordsByTabSafe[activeTab].map((keyword) => (
            <KeywordChip key={keyword} keyword={keyword} onRemove={removeKeywordUI} />
          ))}

          {keywordsByTabSafe[activeTab].length === 0 && (
            <span className="text-sm text-white/50">Aucun mot-clé ajouté pour {activeTab}</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={keywordInputRef}
            type="text"
            value={uiState.keywordInput}
            onChange={(e) => actions.setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addKeywordUI()}
            placeholder={keywordTabMeta[activeTab].placeholder}
            className={`flex-1 rounded-lg border border-white/10 bg-black/70 px-4 py-2.5 text-white placeholder-white/40 transition-colors focus:border-white/40 focus:ring-2 focus:ring-white/15 focus:outline-none ${uiState.isMobile ? 'min-w-[200px] text-sm' : 'min-w-[240px]'}`}
            aria-label={`Ajouter un mot-clé ${activeTab}`}
            maxLength={SWEETSPOT_CONFIG.LIMITS.MAX_KEYWORD_LENGTH}
          />
          <button
            onClick={addKeywordUI}
            className={`rounded-lg bg-white font-semibold text-black transition-all hover:-translate-y-px hover:bg-white/90 ${uiState.isMobile ? 'px-4 py-2.5 text-sm' : 'px-5 py-2.5'}`}
          >
            Ajouter
          </button>

          {uiState.successMsg && (
            <span
              className={`animate-bounce font-medium text-emerald-400 ${uiState.isMobile ? 'text-xs' : 'text-sm'}`}
            >
              ✔ Ajouté !
            </span>
          )}
          {uiState.errorMsg && (
            <span
              className={`rounded-md border border-amber-300/40 bg-amber-500/15 px-2.5 py-1 text-amber-200 ${uiState.isMobile ? 'text-xs' : 'text-xs'}`}
            >
              {uiState.errorMsg}
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

      <div
        style={{ height: keyboardHeight ? keyboardHeight * 0.4 : 0 }}
        aria-hidden
      />
    </>
  );
});

KeywordsSection.displayName = 'KeywordsSection';
