#!/usr/bin/env node
// PreToolUse hook: test first (the test-driven-development skill). An edit that changes the
// behavior of source code under src/ is rejected until a test covering it has been written or
// changed in the same session: a related test (isRelatedTest) or one that imports it, directly
// or transitively. Tests written from the shell count too. Edits that only touch imports,
// comments or formatting, and presentational/type files (isBehaviorFile), are not gated.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { changesBehavior } from "./behavior-change.mjs";
import { shellWriteTargets } from "./shell-writes.mjs";
import { isBehaviorFile, isRelatedTest, isTestFile } from "./tdd-files.mjs";
import { coveredModules, isCovered } from "./test-imports.mjs";

const GATED_TOOLS = new Set(["Edit", "Write", "MultiEdit"]);

/** Remembers, per session, which tests were touched: one file per session id, one path per line. */
function testStore(dir = path.join(tmpdir(), "claude-test-first")) {
  const record = (sessionId) => path.join(dir, sessionId.replace(/[^A-Za-z0-9_-]/g, "_"));
  return {
    tests: (sessionId) => (existsSync(record(sessionId)) ? readFileSync(record(sessionId), "utf8").split("\n").filter(Boolean) : []),
    addTest: (sessionId, file) => {
      mkdirSync(dir, { recursive: true });
      appendFileSync(record(sessionId), `${file}\n`);
    },
  };
}

/** Repo-relative POSIX paths of the files this tool call writes. */
function writtenFiles(input, root) {
  const cwd = input.cwd ?? root;
  const toRepoPath = (file) => path.relative(root, path.resolve(cwd, file)).split(path.sep).join("/");
  if (input.tool_name === "Bash") return shellWriteTargets(input.tool_input?.command ?? "").map(toRepoPath);
  if (GATED_TOOLS.has(input.tool_name) && input.tool_input?.file_path) return [toRepoPath(input.tool_input.file_path)];
  return [];
}

/** Reads a repo-relative file from disk, or null when it doesn't exist. */
const diskReader = (root) => (file) => {
  try {
    return readFileSync(path.join(root, file), "utf8");
  } catch {
    return null;
  }
};

/** The file's content after this Edit/Write/MultiEdit, or null when it can't be applied. */
function contentAfter(toolName, toolInput, before) {
  if (toolName === "Write") return toolInput.content ?? "";
  if (before === null) return null;
  const edits = toolName === "MultiEdit" ? (toolInput.edits ?? []) : [toolInput];
  return edits.reduce(
    (text, edit) => (text === null || !text.includes(edit.old_string ?? "") ? null : edit.replace_all ? text.replaceAll(edit.old_string, edit.new_string) : text.replace(edit.old_string, edit.new_string)),
    before
  );
}

/** Returns the rejection reason for an edit that comes before a covering test, otherwise null. */
export function decide(input, store = testStore(), read) {
  const root = process.env.CLAUDE_PROJECT_DIR ?? input.cwd;
  read ??= diskReader(root);
  const files = writtenFiles(input, root);

  for (const file of files.filter(isTestFile)) store.addTest(input.session_id, file);
  // Shell writes to source are rejected by block-shell-source-writes.mjs.
  if (!GATED_TOOLS.has(input.tool_name)) return null;

  const tests = store.tests(input.session_id);
  let covered;
  const isTested = (file) => tests.some((test) => isRelatedTest(file, test)) || isCovered(file, (covered ??= coveredModules(tests, read)));
  const changes = (file) => {
    const before = read(file);
    const after = contentAfter(input.tool_name, input.tool_input ?? {}, before);
    return after === null || changesBehavior(before, after);
  };

  const untested = files.filter((file) => isBehaviorFile(file) && changes(file) && !isTested(file));
  if (untested.length === 0) return null;

  return (
    `Test first: this edit changes the behavior of ${untested.join(", ")}, and no test covering it has been written or changed in this session yet.\n` +
    "A test covers a file when it imports it (directly or through other modules), has the same base name, or sits in its folder " +
    "(or a __tests__ folder there) or an ancestor folder at slice level or deeper (e.g. src/features/<slice>/__tests__).\n" +
    "Load the test-driven-development skill and follow it: write a test that fails without the change " +
    "(a reproduction test for a bug fix), run it to see it fail, then edit the code to make it pass."
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let raw = "";
  process.stdin.on("data", (chunk) => (raw += chunk));
  process.stdin.on("end", () => {
    const reason = decide(JSON.parse(raw));
    if (!reason) process.exit(0);

    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: reason,
        },
      })
    );
  });
}
