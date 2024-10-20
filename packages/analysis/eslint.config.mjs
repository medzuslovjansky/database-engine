import eslintConfigCli from '@interslavic/eslint-config-cli';

export default [...eslintConfigCli, {
  rules: {
    'unicorn/no-null': 'off',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-array-reduce': 'off',
    'unicorn/prevent-abbreviations': 'off',
    '@typescript-eslint/no-explicit-any': 'off'
  }
}];
