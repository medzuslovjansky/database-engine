import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import jsdocPlugin from "eslint-plugin-jsdoc";
import preferArrowPlugin from "eslint-plugin-prefer-arrow";
import unicornPlugin from "eslint-plugin-unicorn";
import prettierPlugin from "eslint-plugin-prettier";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json"
      },
      globals: {
        // Equivalent to "env: { node: true }"
        node: "readonly"
      }
    },
    plugins: {
      "import": importPlugin,
      "jsdoc": jsdocPlugin,
      "prefer-arrow": preferArrowPlugin,
      "unicorn": unicornPlugin,
      "@typescript-eslint": tsPlugin
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"]
      }
    },
    rules: {
      "quotes": ["error", "single", { "avoidEscape": true }],
      "import/order": ["error", {
        "newlines-between": "always"
      }],
      "unicorn/consistent-function-scoping": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-null": "off",
      "unicorn/no-for-loop": "off",
      "unicorn/prefer-module": "off",
      "unicorn/no-array-callback-reference": "off",
      "import/no-extraneous-dependencies": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_"
        }
      ]
    }
  },
  {
    files: ["**/__*__/**.ts", "**.test.ts"],
    languageOptions: {
      globals: {
        // Equivalent to "env: { jest: true }"
        jest: "readonly"
      }
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    ignores: ["assets/**", "dist/**", "jest.config.ts"]
  },
  // Add these plugin configurations
  importPlugin.configs["recommended"],
  unicornPlugin.configs["recommended"],
  tsPlugin.configs["recommended"],
  prettierPlugin.configs["recommended"]
];
