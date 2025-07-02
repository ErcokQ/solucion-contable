import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/test/smoke/**/*.spec.ts'], // solo smoke
  },
});
