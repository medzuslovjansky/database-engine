import eslintConfigCli from '@interslavic/eslint-config-cli';

export default [
  ...eslintConfigCli,
  {
    files: ['*.test.ts', '**/*.test.ts'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
];
