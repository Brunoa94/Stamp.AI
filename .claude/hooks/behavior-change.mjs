// Whether a source change can alter behavior. Changes confined to import/re-export statements,
// comments and whitespace can't (moving a module, updating its import paths, documenting, formatting);
// tsc and ESLint still check them at commit.

const IMPORTS =
  /^\s*import\s[^;]*?\sfrom\s*["'][^"']*["'];?|^\s*import\s*["'][^"']*["'];?|^\s*export\s+(type\s+)?(\*(\s+as\s+\w+)?|\{[^}]*\})\s*from\s*["'][^"']*["'];?/gm;
const BLOCK_COMMENTS = /\/\*[\s\S]*?\*\//g;
// Line comments start the line or follow whitespace, so "https://…" inside a string is kept.
const LINE_COMMENTS = /(^|\s)\/\/[^\n]*/g;

const strip = (code) => code.replace(IMPORTS, "").replace(BLOCK_COMMENTS, "").replace(LINE_COMMENTS, "$1").replace(/\s+/g, "");

/** `before` is null for a new file. */
export function changesBehavior(before, after) {
  if (before === null) return true;
  return strip(before) !== strip(after);
}
