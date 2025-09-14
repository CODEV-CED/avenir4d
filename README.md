# Avenir 4D — Batch 0 (MVP cartes + vœux + feedback)

[![CI](https://github.com/CODEV-CED/avenir4d/actions/workflows/ci.yml/badge.svg)](https://github.com/CODEV-CED/avenir4d/actions/workflows/ci.yml)

## Démarrer

```bash
pnpm i
pnpm dev
```

## Qualité & Tests

- Lint (erreurs bloquantes en CI):
```bash
pnpm lint -- --max-warnings=0
```

- Typecheck:
```bash
pnpm typecheck
```

- Tests (Vitest + JSDOM):
```bash
pnpm test -- --run
```

Consultez les exécutions CI: https://github.com/CODEV-CED/avenir4d/actions
