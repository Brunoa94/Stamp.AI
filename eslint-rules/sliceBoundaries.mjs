// Feature-sliced boundaries, shared by the ESLint rule below and the
// .claude/hooks/enforce-slice-boundaries.mjs agent hook, so both enforce the same thing.
// (mirrors "Slice boundaries" in .claude/rules/architecture.md)
//
// Layers, top to bottom. A file may import its own layer or a lower one, never a higher one:
//   3 app       src/app, src/providers, src root files (middleware, instrumentation)
//   2 features  src/features/<slice> (every slice except ui)
//   1 shared    src/features/ui (design system), src/shared, src/lib, src/helpers, src/i18n, src/types
//
// Between two feature slices, only the public API may be imported: <slice>/lib/** and
// <slice>/ui/components/**. Everything else (ui/sections, root files, ad-hoc folders) is internal.
import path from "node:path";

const SRC = "src";
const DESIGN_SYSTEM_SLICE = "ui";
const PUBLIC_API_PREFIXES = ["lib/", "ui/components/"];
const LAYER_NAMES = { 1: "shared", 2: "features", 3: "app" };

const IMPORT_SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+|\brequire\s*\(\s*)["']([^"']+)["']/g;

const toPosix = (filePath) => filePath.split(path.sep).join("/");

/** Path relative to the repo root ("src/features/cart/ui/X.tsx"), or null outside src/. */
function toSrcRelative(filePath, rootDir) {
  const relative = toPosix(path.isAbsolute(filePath) ? path.relative(rootDir, filePath) : filePath);
  return relative.startsWith(`${SRC}/`) ? relative : null;
}

function isTestFile(srcPath) {
  return /(^|\/)(__tests__|tests)\//.test(srcPath) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(srcPath);
}

// tsconfig path aliases that point outside src/ (root types/, supabase/), shared with the edge functions.
const OUTSIDE_SRC_ALIASES = /^@\/(shared-types$|supabase\/)/;

/** Resolves an import specifier to a src-relative path, or null for packages and paths outside src/. */
function resolveSpecifier(specifier, fromSrcPath) {
  if (OUTSIDE_SRC_ALIASES.test(specifier)) return null;
  if (specifier.startsWith("@/")) return `${SRC}/${specifier.slice(2)}`;
  if (specifier.startsWith(".")) {
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromSrcPath), specifier));
    return resolved.startsWith(`${SRC}/`) ? resolved : null;
  }
  return null;
}

/** { layer, slice, inner } for a src-relative path. */
function locate(srcPath) {
  const [, top, slice, ...rest] = srcPath.split("/");
  if (top === "features" && slice) {
    return {
      layer: slice === DESIGN_SYSTEM_SLICE ? 1 : 2,
      slice,
      inner: rest.join("/"),
    };
  }
  if (["shared", "lib", "helpers", "i18n", "types"].includes(top)) return { layer: 1, slice: null, inner: "" };
  return { layer: 3, slice: null, inner: "" };
}

/** The boundary violation for one import, as a message, or null when the import is allowed. */
export function checkImport(fromSrcPath, specifier) {
  const targetPath = resolveSpecifier(specifier, fromSrcPath);
  if (!targetPath) return null;

  const from = locate(fromSrcPath);
  const target = locate(targetPath);

  if (target.layer > from.layer) {
    return (
      `"${specifier}" imports the ${LAYER_NAMES[target.layer]} layer from the ${LAYER_NAMES[from.layer]} layer. ` +
      "Imports only go downwards (app → features → shared/design system). Move the shared code down " +
      "to src/shared (or the design system), or pass it in from the layer above."
    );
  }

  const isOtherFeatureSlice = from.layer === 2 && target.layer === 2 && from.slice !== target.slice;
  if (isOtherFeatureSlice && !PUBLIC_API_PREFIXES.some((prefix) => target.inner.startsWith(prefix))) {
    return (
      `"${specifier}" reaches into the internals of the "${target.slice}" slice. Other slices may only import ` +
      `its public API (${PUBLIC_API_PREFIXES.map((prefix) => `${target.slice}/${prefix}**`).join(", ")}). ` +
      "Move what you need into one of those folders, or into src/shared if several slices use it."
    );
  }

  return null;
}

/** Every import specifier in a source text. */
export function extractSpecifiers(source) {
  return [...source.matchAll(IMPORT_SPECIFIER)].map((match) => match[1]);
}

/**
 * Boundary violations in `source` for the file at `filePath`, as [{ specifier, message }].
 * Test files and files outside src/ have no boundaries.
 */
export function findBoundaryViolations(filePath, source, rootDir = process.cwd()) {
  const srcPath = toSrcRelative(filePath, rootDir);
  if (!srcPath || isTestFile(srcPath)) return [];

  return [...new Set(extractSpecifiers(source))]
    .map((specifier) => ({ specifier, message: checkImport(srcPath, specifier) }))
    .filter((violation) => violation.message);
}

export const sliceBoundariesRule = {
  meta: {
    type: "problem",
    docs: { description: "Enforce feature-sliced layer direction and slice public APIs" },
    schema: [],
  },
  create(context) {
    const srcPath = toSrcRelative(context.filename, context.cwd);
    if (!srcPath || isTestFile(srcPath)) return {};

    const check = (sourceNode) => {
      if (sourceNode?.type !== "Literal" || typeof sourceNode.value !== "string") return;
      const message = checkImport(srcPath, sourceNode.value);
      if (message) context.report({ node: sourceNode, message });
    };

    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
      "CallExpression[callee.name='require']": (node) => check(node.arguments[0]),
    };
  },
};

const sliceBoundariesPlugin = {
  meta: { name: "slice-boundaries" },
  rules: { "slice-boundaries": sliceBoundariesRule },
};

export default sliceBoundariesPlugin;
