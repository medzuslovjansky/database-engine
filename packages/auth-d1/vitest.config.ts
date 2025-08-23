import path from 'node:path';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@auth$/, replacement: path.resolve(__dirname, '../auth/src') },
      { find: /^@auth\/(.*)$/, replacement: path.resolve(__dirname, '../auth/src/$1') },
      { find: /^@auth-d1$/, replacement: path.resolve(__dirname, 'src') },
      { find: /^@auth-d1\/(.*)$/, replacement: path.resolve(__dirname, 'src/$1') },
    ],
  },
  test: {
    setupFiles: ['./vitest.setup.ts'],
    environment: 'node',
    globals: true,
  },
});
