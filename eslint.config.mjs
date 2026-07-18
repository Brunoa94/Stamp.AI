import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Project-wide rules
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    rules: {
      // Disallow barrel exports (index.ts files)
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportAllDeclaration",
          message: "Avoid barrel exports (export *). Import directly from source files.",
        },
        {
          selector: "ExportNamedDeclaration[source][specifiers.length>0]",
          message: "Avoid re-exports in index.ts. Import directly from source files.",
        },
      ],
    },
  },
  // Special config for Supabase functions (Deno)
  {
    files: ["supabase/functions/**/*.ts"],
    languageOptions: {
      globals: {
        Deno: "readonly",
        console: "readonly",
      },
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },
    rules: {
      // Disable Node.js specific rules for Deno
      "import/no-unresolved": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
]);

export default eslintConfig;
