module.exports = {
  "env": {
    "node": true,
  },
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 11,
    "extraFileExtensions": [".mjs"],
    "project": "tsconfig.json",
    "sourceType": "module"
  },
  "plugins": [
    "eslint-plugin-jsdoc",
    "eslint-plugin-prefer-arrow",
    "@typescript-eslint"
  ],
  "rules": {
    "quotes": ["error", "single", { "avoidEscape":  true }]
  },
  "overrides": [
    {
      "files": ["*.test.ts"],
      "env": {
        "jest": true
      }
      "rules": {
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
