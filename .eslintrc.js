/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['tsconfig.json'],
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // ↔ integra Prettier
  ],
  rules: {
    // añade reglas o sobreescribe aquí
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: [
    'node_modules',
    'dist',
    'coverage',
    '.husky',
    'docs/**',
    '.eslintrc.js',
    'vite.config.ts',
    'test/**/*.ts',
    'jest.config.js',
    'vitest.smoke.config.ts',
    'frontend/tailwind.config.js',
    'frontend/*',
  ],
  settings: {
    'import/resolver': {
      typescript: { project: 'tsconfig.json' },
    },
  },
};
