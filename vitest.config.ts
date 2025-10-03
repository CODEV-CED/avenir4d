import { defineConfig } from 'vitest/config';
import path from 'path'; // Importation nécessaire

export default defineConfig({
  // Note: removed @vitejs/plugin-react (ESM-only) because esbuild used by Vitest
  // cannot require() ESM-only modules in this environment. Tests don't need
  // this plugin to run; Vite's default transformers are sufficient for most cases.
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    restoreMocks: true,
    // ▼▼▼ On force Vitest à ne lire que notre nouveau fichier de test ▼▼▼
    include: ['./hooks/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
