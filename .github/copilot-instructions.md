# Avenir4D — Copilot Instructions

These rules guide AI changes in this repo. Follow them precisely to avoid regressions and duplication.

## Core Rules

- Read `README.md` and this file before coding.
- Search the codebase first; reuse existing modules and patterns.
- Workflow: Analyze → Reuse → Validate → Integrate (no big rewrites).
- Plan → Implement minimal changes → Update tests/docs if affected.
- Keep edits surgical: do not rename/move files unless asked; avoid reformatting unrelated code.

## CRUCIAL Rules (à lire en premier)

- ALWAYS read `instructions.doc.instructions.md` before any work.
- ALWAYS search the codebase before changing anything; avoid duplication.
- ALWAYS follow: ANALYZE → REUSE → VALIDATE → INTEGRATE.
- ALWAYS follow: Research → Planning → Implementation (never jump straight to code).
- Surgical precision: respect existing architecture; no parallel engines or big rewrites.
- No fake data or placeholder “fallbacks” in product flows; zero-PII prompts/outputs for AI.
- If in doubt, ask or open a small PR describing the intent before broad changes.

## Architecture Essentials

- Next.js 15 App Router + React 19 + TypeScript.
- State: Zustand store in `store/useSweetSpotStore.ts` (sliders, keywords, tags, detect fetch, constraints).
- Engine: `lib/sweetSpotEngine.ts` is the single source for convergence logic.
- API: `/api/sweet-spot/detect` in `app/api/sweet-spot/detect/route.ts` calls the engine.
- Lab UI: `app/sweet-spot/lab/page.tsx` (page) and `components/SweetSpotLabStep.tsx` (sliders, score, convergences, Eureka).
- SJT: Data in `data/sjt-questions.ts`; quiz UI in `components/sjt/SJTQuiz.tsx` and `components/sjt/QuestionCard.tsx`.
  - Normalization rule: `scenario` → `title`, option `text` → option `label` (see SJT smoke test).
- Ikigaï visuals: `components/ikigai/IkigaiChart.tsx`, `components/ikigai/IkigaiRadar.tsx`.

## Next.js 15 Patterns

- `useSearchParams`: only inside a `Suspense` boundary. Example: wrap the page content in `Suspense` with a fallback.
- Dynamic routes `page.tsx`: if using `params`, type as `Promise<...>` and `await params` before use.
- Prefer server components; add `'use client'` only where hooks or browser APIs are needed.

## State & Constraints

- Use store setters from `useSweetSpotStore.ts`:
  - `setSliderValue(dimension, value)`: applies constraints and triggers detect. Do not bypass constraints.
  - `setUserKeywords`, `setSelectedTags`, `setBoostEnabled`, `fetchConvergences`.
- Do not compute convergences in components. Always POST to `/api/sweet-spot/detect` via the store to keep a single source of truth.

## UI/UX Conventions

- Tailwind v4 classes; keep styles consistent with existing components.
- Animations: Framer Motion is available. Isolate to client components under `components/ikigai/*` or local UI files. Avoid introducing global animation side effects.
- Keep the Eureka threshold logic in UI consistent with store/engine semantics (current: score > 0.7).

## Testing

- Test runner: Vitest + JSDOM + RTL. Setup file: `vitest.setup.ts` (jest-dom matchers enabled).
- Put UI smoke tests near related components or under `tests/` with clear scope.
- For pure functions (engines, utils), write unit tests in `lib/*.test.ts`.
- Run locally: `pnpm test` (watch) and `pnpm typecheck` before pushing.

## CI

- Workflow: `.github/workflows/ci.yml` runs install, lint, typecheck, tests on push/PR.
- Keep CI green. If you change public APIs or behavior, update or add tests accordingly.

## Commands

- Dev server: `pnpm dev`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Tests: `pnpm test`
- Build: `pnpm build`

## Do / Don’t

- Do: reuse `useSweetSpotStore` for all Lab state; call `fetchConvergences` via the store; keep engine logic in `lib/sweetSpotEngine.ts` only.
- Do: wrap any new `useSearchParams` usage in `Suspense`.
- Do: add small, focused tests when changing engine/store/UI contracts.
- Don’t: duplicate existing components or create parallel engines.
- Don’t: alter slider constraint logic unless explicitly requested; if adjusted, update related UI pulse indicators and tests.

## File Pointers (quick refs)

- Store: `store/useSweetSpotStore.ts`
- Engine: `lib/sweetSpotEngine.ts`
- Detect API: `app/api/sweet-spot/detect/route.ts`
- Lab Page: `app/sweet-spot/lab/page.tsx`
- Lab UI: `components/SweetSpotLabStep.tsx`, `components/DimensionSlider.tsx`, `components/EurekaFX.tsx`
- SJT: `components/sjt/SJTQuiz.tsx`, `components/sjt/QuestionCard.tsx`, `data/sjt-questions.ts`
- Ikigaï: `components/ikigai/IkigaiChart.tsx`, `components/ikigai/IkigaiRadar.tsx`

> If in doubt, ask or open a small PR describing the intent before broad changes.

## Roadmap — Sweet Spot Revolution (6 Batches)

- Batch 1: SJT Enrichi — 12 + 4 qualitatives, extraction sémantique; DB JSONB profile; services backend; Zustand store étendu; UI SJT avancée.
- Batch 2: Sweet Spot Engine — détection convergences inter-dimensions; score global; API `/api/sweet-spot/detect`; Canvas Ikigaï en temps réel; sliders contraintes (Viabilité ≥ 0.15, écart ≤ 0.40); Eureka si score > 0.7.
- Batch 3: Projets Hybrides IA — intégration Claude API (zero-PII), `generateHybridProjects()`, 5 métiers par utilisateur, API `/api/sweet-spot/generate-projects`, gestion erreurs/fallbacks et cache.
- Batch 4: Test VIBRANT — 7 dimensions (1–10), score global + analyse forces/faiblesses; génération « Projet Signature » si score > 7.0; comparaison projets.
- Phase 2 (5–6): Enrichir moteurs (keywords, convergences, synthesis via Claude), animations, laboratoire projets; freemium via access control; aucune migration DB (JSONB flexible).
