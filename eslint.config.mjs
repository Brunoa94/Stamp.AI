import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sliceBoundaries from "./eslint-rules/sliceBoundaries.mjs";

// jsx-a11y is already registered by eslint-config-next (with only a handful of its rules on);
// reuse that instance and switch on its full recommended set.
const jsxA11y = nextVitals.find((config) => config.plugins?.["jsx-a11y"]).plugins["jsx-a11y"];

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
// (mirrors the table in .claude/rules/components.md → Use the design system)
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
  // (mirrors "SVGs are assets" in .claude/rules/components.md)
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
// (mirrors "Styling" in .claude/rules/components.md)
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

// Colors and spacing come from design tokens (Tailwind theme / CSS variables), never raw values:
// no arbitrary color classes (bg-[#7C3AED], text-[rgb(…)]), no hex literals, no arbitrary
// spacing (p-[13px], gap-[1.2rem]). Applies to every string, including className attributes.
// (mirrors "Don't hardcode hex values" in .claude/skills/frontend-ui-engineering/references/color-palette.md
// and "Spacing and Layout" in .claude/skills/frontend-ui-engineering/SKILL.md)
const arbitraryColorPattern = "-\\[(#|rgba?\\(|hsla?\\(|oklch\\(|color:)";
const hexColorPattern = "^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$";
const arbitrarySpacingPattern =
  "(^|[\\s:])-?(p[xytrblse]?|m[xytrblse]?|gap(-[xy])?|space-[xy]|inset(-[xy])?|top|right|bottom|left)-\\[-?[0-9.]+(px|rem|em)\\]";
const tokenRules = [
  {
    selector: `Literal[value=/${arbitraryColorPattern}/], TemplateElement[value.raw=/${arbitraryColorPattern}/]`,
    message: "Use a color token (bg-primary, text-foreground, …) instead of an arbitrary color value. Add the color to the theme in globals.css if it is missing.",
  },
  {
    selector: `Literal[value=/${arbitrarySpacingPattern}/], TemplateElement[value.raw=/${arbitrarySpacingPattern}/]`,
    message: "Use the spacing scale (p-4, gap-6, …) instead of an arbitrary spacing value.",
  },
];
// Hex literals only count as styling inside components: .ts files legitimately hold raw
// color data (product swatches, Stripe Elements styles, manifest theme colors).
const hexColorRules = [
  {
    selector: `Literal[value=/${hexColorPattern}/]`,
    message: "Don't hardcode hex colors in components. Use a design token: a Tailwind theme class or a CSS variable from globals.css.",
  },
];

// UI components render data; they never fetch it. Data comes in through hooks from
// lib/hooks or the query hooks in src/shared/queries.
// (mirrors "Layers" in .claude/rules/architecture.md)
const noDataFetchingMessage =
  "No data fetching in UI components. Fetch in a hook (lib/hooks or src/shared/queries) and pass the data in.";
const noDataFetchingRules = {
  "no-restricted-imports": [
    "error",
    {
      paths: [
        {
          name: "@tanstack/react-query",
          importNames: ["useQuery", "useQueries", "useInfiniteQuery", "useSuspenseQuery", "useSuspenseQueries", "useSuspenseInfiniteQuery", "useMutation"],
          message: noDataFetchingMessage,
        },
        { name: "axios", message: noDataFetchingMessage },
        { name: "openai", message: noDataFetchingMessage },
      ],
      patterns: [
        { group: ["@supabase/*", "@/lib/supabase", "@/lib/supabase/*", "@google/*"], message: noDataFetchingMessage },
        {
          group: ["@/shared/services/*", "!@/shared/services/analyticsService"],
          message: `${noDataFetchingMessage} (analyticsService is the exception: tracking is not data fetching.)`,
        },
      ],
    },
  ],
  "no-restricted-globals": ["error", { name: "fetch", message: noDataFetchingMessage }],
};

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
      // Disallow barrel exports (index.ts files) and hardcoded colors/spacing
      "no-restricted-syntax": ["error", ...barrelExportRules, ...tokenRules],
    },
  },
  // Feature-sliced boundaries: imports only go downwards (app → features → shared), and other
  // slices are reached only through their public API (lib/, ui/components/).
  // The same check runs as a Claude Code hook (.claude/hooks/enforce-slice-boundaries.mjs).
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: { "slice-boundaries": sliceBoundaries },
    rules: { "slice-boundaries/slice-boundaries": "error" },
  },
  // Error toasts go through useErrorHandler, which shows only translated codes and
  // UserFacingError messages; a direct toast.error(error.message) leaks technical text.
  // (mirrors "Principles" in .claude/skills/error-handling/SKILL.md)
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/shared/hooks/useErrorHandler.ts", "src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.test.tsx"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "toast",
          property: "error",
          message:
            "Show errors through handleError from @/shared/hooks/useErrorHandler. Throw a UserFacingError (@/shared/errors/UserFacingError) for a message meant for the user.",
        },
      ],
    },
  },
  // Accessibility: jsx-a11y's recommended rules
  {
    files: ["src/**/*.tsx"],
    rules: jsxA11y.configs.recommended.rules,
  },
  // No data fetching in UI components
  {
    files: ["src/features/*/ui/**/*.ts", "src/features/*/ui/**/*.tsx", "src/features/ui/**/*.tsx", "src/shared/ui/**/*.tsx"],
    ignores: ["src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.test.tsx"],
    rules: noDataFetchingRules,
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
        ...tokenRules,
        ...hexColorRules,
        ...rawElementRules,
        ...styleOutsideJsxRules,
      ],
    },
  },
]);

export default eslintConfig;
