import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Barrel-export bans, shared by both no-restricted-syntax blocks below
// (a later block's no-restricted-syntax replaces an earlier one, so both list them)
const barrelExportRules = [
  {
    selector: "ExportAllDeclaration",
    message: "Avoid barrel exports (export *). Import directly from source files.",
  },
  {
    selector: "ExportNamedDeclaration[source][specifiers.length>0]",
    message: "Avoid re-exports in index.ts. Import directly from source files.",
  },
];

// Raw HTML elements that have a design-system replacement
// (mirrors the table in docs/README.md → Components → Component Guidelines)
const designSystemElements = [
  { elements: ["h1", "h2", "h3", "h4", "h5", "h6"], component: "Heading", from: "@/features/ui/heading" },
  { elements: ["p"], component: "Paragraph", from: "@/features/ui/paragraph" },
  { elements: ["span"], component: "Span", from: "@/features/ui/span" },
  { elements: ["button"], component: "Button", from: "@/features/ui/button" },
  {
    elements: ["input"],
    component: "Input (Checkbox for type=\"checkbox\", Slider for type=\"range\")",
    from: "@/features/ui/input, @/features/ui/checkbox or @/features/ui/slider",
  },
  { elements: ["textarea"], component: "Textarea", from: "@/features/ui/textarea" },
  { elements: ["select"], component: "Select", from: "@/features/ui/select" },
  { elements: ["label"], component: "Label", from: "@/features/ui/label" },
  { elements: ["ul", "ol"], component: "List", from: "@/features/ui/list" },
  { elements: ["hr"], component: "Separator", from: "@/features/ui/separator" },
  { elements: ["img"], component: "Image", from: "next/image" },
];

const rawElementRules = [
  ...designSystemElements.flatMap(({ elements, component, from }) =>
    elements.map((element) => ({
      selector: `JSXOpeningElement[name.name='${element}']`,
      message: `Use the ${component} component from ${from} instead of raw <${element}>.`,
    })),
  ),
  // (mirrors "SVGs are always assets" in docs/README.md → Components → Component Guidelines)
  {
    selector: "JSXOpeningElement[name.name='svg']",
    message:
      "Save the SVG as a file under public/assets/ and render it with Image from next/image instead of inline <svg>.",
  },
];

// Styling lives in variants (cva in a .ts file) or inline in the returned JSX —
// never in class-string constants, lookup maps or helpers inside a .tsx file.
// A string counts as styling when it carries a Tailwind utility token; strings
// inside a JSX attribute (className="…", className={cn(…)}) are allowed.
// (mirrors "Styling approach" in docs/README.md → Components → Component Guidelines)
const tailwindTokenPattern =
  "(^|\\s)!?([a-z0-9-]+:)*-?(bg|text|border|rounded|p[xytrbl]?|m[xytrbl]?|gap|space-[xy]|w|h|min-[wh]|max-[wh]|size|flex|grid|items|justify|self|font|tracking|leading|shadow|opacity|z|top|left|right|bottom|inset|translate-[xy]|rotate|scale|duration|transition|ring|outline|fill|stroke|overflow|cursor|aspect|object|origin|blur|backdrop)-[^\\s]";
const styleOutsideJsxMessage =
  "Keep styling out of constants and helpers in .tsx files. Move class maps to a cva variants file under lib/variants/, or inline the classes in the returned JSX.";
const styleOutsideJsxRules = [
  {
    selector: `Literal[value=/${tailwindTokenPattern}/]:not(JSXAttribute Literal):not(ImportDeclaration Literal)`,
    message: styleOutsideJsxMessage,
  },
  {
    selector: `TemplateElement[value.raw=/${tailwindTokenPattern}/]:not(JSXAttribute TemplateElement)`,
    message: styleOutsideJsxMessage,
  },
  {
    selector: "CallExpression[callee.name='cva']",
    message: "Define cva variants in a .ts file under lib/variants/, not in a component file.",
  },
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-webpack/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Supabase edge functions run on Deno and are not linted.
    "supabase/functions/**",
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
      "no-restricted-syntax": ["error", ...barrelExportRules],
    },
  },
  // Disallow raw HTML elements that have a design-system component, outside the UI folder.
  // Genuine exceptions (e.g. an external image next/image can't optimize) need a
  // disable-next-line directive for no-restricted-syntax with a reason.
  {
    files: ["src/**/*.tsx"],
    ignores: [
      "src/features/ui/**/*.tsx",
      // Root error boundary cannot import external styles/components
      "src/app/global-error.tsx",
      // Test files can use raw elements for mocking purposes
      "src/**/__tests__/**/*.tsx",
      "src/**/*.test.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...barrelExportRules,
        ...rawElementRules,
        ...styleOutsideJsxRules,
      ],
    },
  },
]);

export default eslintConfig;
