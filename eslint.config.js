import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import boundaries from "eslint-plugin-boundaries";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";
const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default ts.config(
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs["flat/recommended"],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        {
          mode: "full",
          type: "shared",
          pattern: [
            "src/api/**/*",
            "src/components/**/*",
            "src/constants/**/*",
            "src/database/**/*",
            "src/icons/**/*",
            "src/lib/**/*",
            "src/schemas/**/*",
            "src/types/**/*",
            "src/utils/**/*",
            "src/*.ts",
            "src/*.css",
          ],
        },
        {
          mode: "full",
          type: "feature",
          capture: ["featureName"],
          pattern: ["src/features/*/**/*"],
        },
        {
          mode: "full",
          type: "routes",
          capture: ["fileName"],
          pattern: ["src/routes/**/*"],
        },
      ],
    },
    rules: {
      // ...boundaries.configs.recommended.rules,
      "boundaries/no-unknown": ["error"],
      "boundaries/no-unknown-files": ["error"],
      "boundaries/element-types": [
        "error",
        {
          // default: "disallow",
          rules: [
            {
              from: ["shared"],
              allow: ["shared"],
            },
            {
              from: ["feature"],
              allow: [
                "shared",
                ["feature", { "featureName": "${from.featureName}" }],
              ],
            },
            {
              from: ["routes", "neverImport"],
              allow: ["shared", "feature"],
            },
            {
              from: ["routes"],
              allow: [["routes", { "fileName": "*.css" }]],
            },
          ],
        },
      ],
    },
  },
  {
    rules: {
      "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
  },
);
