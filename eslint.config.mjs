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
      // Warn on unused imports and variables
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
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
  // Disallow raw HTML elements outside the UI folder
  {
    files: ["src/**/*.tsx"],
    ignores: [
      "src/features/ui/**/*.tsx",
      // Root error boundary cannot import external styles/components
      "src/app/global-error.tsx",
      // Auth components use unstyled elements intentionally for caller-owned styling
      "src/features/auth/components/AuthDialog.tsx",
      "src/features/auth/login/Login.tsx",
      // Card components use unstyled button for block layout and custom styling
      "src/features/catalog/ui/components/CatalogProductCard.tsx",
      "src/features/catalog/ui/components/CatalogShowcaseCard.tsx",
      // Test files can use raw elements for mocking purposes
      "src/**/__tests__/**/*.tsx",
      "src/**/*.test.tsx",
    ],
    rules: {
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
        {
          selector: "JSXOpeningElement[name.name='button']",
          message: "Use the Button component from @/features/ui/button instead of raw <button>.",
        },
        {
          selector: "JSXOpeningElement[name.name='p']",
          message: "Use the Paragraph component from @/features/ui/paragraph instead of raw <p>.",
        },
        {
          selector: "JSXOpeningElement[name.name='span']",
          message: "Use the Span component from @/features/ui/span instead of raw <span>.",
        },
        {
          selector: "JSXOpeningElement[name.name='h1']",
          message: "Use the Heading component from @/features/ui/heading instead of raw <h1>.",
        },
        {
          selector: "JSXOpeningElement[name.name='h2']",
          message: "Use the Heading component from @/features/ui/heading instead of raw <h2>.",
        },
        {
          selector: "JSXOpeningElement[name.name='h3']",
          message: "Use the Heading component from @/features/ui/heading instead of raw <h3>.",
        },
        {
          selector: "JSXOpeningElement[name.name='h4']",
          message: "Use the Heading component from @/features/ui/heading instead of raw <h4>.",
        },
        {
          selector: "JSXOpeningElement[name.name='h5']",
          message: "Use the Heading component from @/features/ui/heading instead of raw <h5>.",
        },
        {
          selector: "JSXOpeningElement[name.name='h6']",
          message: "Use the Heading component from @/features/ui/heading instead of raw <h6>.",
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
