// .eslintrc.js
/** @type {import('eslint').Linter.Config} */
module.exports = {
  // ... ta config existante (parser, extends, ts, next, etc.)
  rules: {
    'no-restricted-syntax': [
      'warn',
      {
        selector:
          "CallExpression[callee.name='useSweetSpotStore'] > ArrowFunctionExpression > ObjectExpression",
        message:
          'Évite de retourner un objet littéral depuis un selector Zustand (mémoïse-le ou sélectionne les clés séparément).',
      },
    ],
  },
  overrides: [
    {
      files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
      excludedFiles: ['app/api/**', 'lib/supabase/**', '**/*.server.*'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/lib/supabase/admin*', '**/lib/supabase/admin*'],
                message:
                  '❌ supabaseAdmin ne doit JAMAIS être importé côté client (service role key exposure)',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['app/api/**', 'lib/supabase/**', '**/*.server.*'],
      rules: { 'no-restricted-imports': 'off' },
    },
  ],
};
