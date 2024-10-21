import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat();

export default tseslint.config(
  eslint.configs.recommended,
  ...compat.extends('plugin:import/recommended'),
  ...compat.extends('plugin:unicorn/recommended'),
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/jest.config.js',
      'jest.config.js',
      'e2e/**',
    ],
  },
  {
    rules: {
      "quotes": ["error", "single", { "avoidEscape": true }],
      "import/no-unresolved": "off",
      "import/order": ["error", {
        "newlines-between": "always"
      }],
      "import/no-extraneous-dependencies": "error",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-for-loop": "off",
      "unicorn/no-null": "off",
      "unicorn/prefer-module": "off",
      'unicorn/no-nested-ternary': 'off',
      'unicorn/prevent-abbreviations': 'off',
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "off",
      '@typescript-eslint/no-non-null-assertion': 'off',
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_"
        }
      ]
    },
  },
);
