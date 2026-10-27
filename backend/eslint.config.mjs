// @ts-check
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Es crucial ignorar los archivos compilados y el propio config 
    // para que ESLint no intente buscarles tipos
    ignores: ['dist', 'node_modules', 'eslint.config.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended, // <-- Cambiamos a recommended normal
  eslintConfigPrettier, // <-- Prettier apaga las reglas de formato de ESLint
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Estas son las reglas por defecto que NestJS recomienda apagar
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);