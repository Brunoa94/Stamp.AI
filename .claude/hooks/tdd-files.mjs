// Which files the test-driven-development hooks treat as tests and as behavioral source code.
// Paths are relative to the repo root.
import path from "node:path";

const TEST = /(\.(test|spec)\.[cm]?[jt]sx?$)|(\/__tests__\/)/;
const SOURCE = /^src\/.+\.(ts|tsx|js|jsx|mjs)$/;
// Presentational code: logic lives in lib/ (docs/README.md → Separation of Concerns), so ui/
// folders, the design system, app pages/layouts and components elsewhere in a slice render;
// acceptance tests cover them. cva variants are styling.
const PRESENTATIONAL =
  /^src\/(features\/[^/]+\/ui\/|features\/ui\/|shared\/ui\/|app\/.+\.tsx$|features\/[^/]+\/(?!lib\/).+\.tsx$)|\/lib\/variants\//;
// Static data and configuration (docs/README.md → lib/constants).
const STATIC_DATA = /\/constants\//;
// Types have no runtime behavior; tsc checks them.
const TYPES = /(^|\/)types\/|\.types\.ts$|\.d\.ts$/;
// src/<area>/<module>: the shallowest folder whose tests count for everything below it
// (src/features/<slice>, src/lib/<module>, src/shared/<area>).
const MIN_ANCESTOR_DEPTH = 3;

export const isTestFile = (file) => TEST.test(file);

/** Source code whose change can alter behavior: JS/TS under src/ that is not a test, presentational, static data or types. */
export const isBehaviorFile = (file) =>
  SOURCE.test(file) && !isTestFile(file) && !PRESENTATIONAL.test(file) && !STATIC_DATA.test(file) && !TYPES.test(file);

/** "src/a/__tests__/total.test.ts" → "total". */
const baseName = (file) => path.posix.basename(file).replace(/\.(test|spec)(?=\.)/, "").replace(/\.[^.]+$/, "");

/** The folder a test covers: its own folder, or the parent of the __tests__ folder it sits in. */
const coveredFolder = (testFile) => path.posix.dirname(testFile).replace(/\/__tests__(\/.*)?$/, "");

/**
 * A test is related to a source file when it shares its base name, or when it covers the
 * source's folder or an ancestor of it at slice/module depth or deeper.
 */
export function isRelatedTest(sourceFile, testFile) {
  if (baseName(sourceFile) === baseName(testFile)) return true;
  const folder = coveredFolder(testFile);
  if (folder.split("/").length < MIN_ANCESTOR_DEPTH) return false;
  return path.posix.dirname(sourceFile) === folder || sourceFile.startsWith(`${folder}/`);
}
