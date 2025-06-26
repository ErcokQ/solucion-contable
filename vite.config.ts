import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,          // describe/it sin importar
    environment: 'node',    // entorno Node
    include: ['src/**/*.spec.ts'],
     coverage: {
      reporter: ['text', 'html'],
    provider: 'istanbul',
    },
  },
  resolve: {
    alias: {
      '@shared':  '/src/shared',
      '@auth':    '/src/modules/auth',
      '@cfdi':    '/src/modules/cfdi',
      '@payments':'/src/modules/payments',
      '@payroll': '/src/modules/payroll',
    },
  },
});