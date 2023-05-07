module.exports = {
  "env": {
    "node": true,
  },
  "extends": [
    "eslint:recommended",
    "plugin:import/typescript",
    "plugin:prettier/recommended",
    "plugin:unicorn/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 11,
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  "plugins": [
    "eslint-plugin-import",
    "eslint-plugin-jsdoc",
    "eslint-plugin-prefer-arrow",
    "eslint-plugin-unicorn",
    "@typescript-eslint"
  ],
  "rules": {
    "quotes": ["error", "single", { "avoidEscape":  true }],
    "import/order": ["error", {
      "newlines-between": "always"
    }],
    "unicorn/consistent-function-scoping": "off",
    "unicorn/filename-case": "off",
    "unicorn/no-null": "off",
    "unicorn/prefer-module": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_"
      }
    ]
  },
  "overrides": [
    {
      "files": ["__*__/**.ts", "*.test.ts"],
      "env": {
        "jest": true
      },
      "rules": {
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ],
  "ignorePatterns": [
    "assets",
    "dist",
    "jest.config.ts"
  ]
};
