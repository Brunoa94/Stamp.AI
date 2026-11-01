// Which src/ modules a set of tests exercises: everything they import, directly or transitively.
// A test that imports a module that doesn't exist yet covers it too (TDD's red step).
// Modules are identified by their path without extension or /index ("src/features/cart/lib/total").
import path from "node:path";
import { extractSpecifiers } from "../../eslint-rules/sliceBoundaries.mjs";

const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs"];
const MAX_MODULES = 2000;

const moduleId = (file) => file.replace(/\.[cm]?[jt]sx?$/, "").replace(/\/index$/, "");

/** The src/ module a specifier points to, or null for packages and paths outside src/. */
function resolve(specifier, fromFile) {
  const target = specifier.startsWith("@/")
    ? `src/${specifier.slice(2)}`
    : specifier.startsWith(".")
      ? path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), specifier))
      : null;
  return target?.startsWith("src/") ? target : null;
}

/** The file a module path resolves to, and its content, or null when it doesn't exist (yet). */
function load(modulePath, read) {
  const candidates = [modulePath, ...EXTENSIONS.map((ext) => modulePath + ext), ...EXTENSIONS.map((ext) => `${modulePath}/index${ext}`)];
  for (const file of candidates) {
    const content = read(file);
    if (content !== null) return { file, content };
  }
  return null;
}

/** Module ids reachable from the given test files. `read(repoPath)` returns content or null. */
export function coveredModules(testFiles, read) {
  const covered = new Set();
  const queue = testFiles.map((file) => ({ file, content: read(file) })).filter((entry) => entry.content !== null);
  while (queue.length > 0 && covered.size < MAX_MODULES) {
    const { file, content } = queue.shift();
    for (const specifier of extractSpecifiers(content)) {
      const target = resolve(specifier, file);
      if (!target || covered.has(moduleId(target))) continue;
      covered.add(moduleId(target));
      const loaded = load(target, read);
      if (loaded) {
        covered.add(moduleId(loaded.file));
        queue.push(loaded);
      }
    }
  }
  return covered;
}

export const isCovered = (sourceFile, covered) => covered.has(moduleId(sourceFile));
