# Migration: UI Typography and casing fix

## Summary

We consolidated typographic primitives into `components/UI/Typography.tsx` (`H1`, `H2`, `Paragraph`). A duplicate lowercase path `components/ui` was created earlier which caused a Windows casing conflict. To avoid breaking existing imports, a small shim `components/ui/index.ts` was added that re-exports from the canonical `components/UI` module.

## What changed

- Removed the accidental lowercase duplicate file (if present) and normalized imports to `@/components/UI/Typography`.
- Added `components/ui/index.ts` shim which exports from `components/UI/Typography` to preserve older import paths.
- Replaced inline `<h1>`/`<h2>`/`<p>` with `H1`/`H2`/`Paragraph` in several components as the first small migration batch.

## Files updated in batch 1

- `components/SweetSpotLabStep.tsx`
- `components/SweetSpotLabTest.tsx`
- `components/sjt/QualitativeStep.tsx`
- `components/sjt/QcmStep.tsx`
- `components/IkigaiControls.tsx`
- `app/(app-shell)/tag-demo/page.tsx`
- `app/(app-shell)/dev-login/page.tsx`

## Developer notes

- On Windows, imports that only differ by case can cause `TS5058`/`forceConsistentCasingInFileNames` errors. Keep a single canonical path.
- When adding new typography components, use the shared `components/UI/Typography.tsx` file and import via `@/components/UI/Typography`.
- The shim ensures older code importing `@/components/ui` keeps working.

## Next steps

- Continue migrating remaining files in small batches (5–10 files).
- Run `pnpm -s typecheck` and `pnpm -s test` after each batch.
- Optionally add unit tests for the typography components.
