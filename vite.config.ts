import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // describe/it sin importar
    environment: 'node', // entorno Node
    include: ['src/**/*.spec.ts'],
    coverage: {
      reporter: ['text', 'html'],
      provider: 'istanbul',
      thresholds: {
        lines: 75,
        statements: 75,
        branches: 65,
        functions: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@shared': '/src/shared',
      '@auth': '/src/modules/auth',
      '@cfdi': '/src/modules/cfdi',
      '@payments': '/src/modules/payments',
      '@payroll': '/src/modules/payroll',
      '@infra': '/src/infraestructure',
    },
  },
});
