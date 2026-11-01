#!/usr/bin/env node
// PreToolUse hook: a commit that changes the behavior of source code must change a test covering
// it too (the test-driven-development skill): a related test (isRelatedTest) or one that imports
// it, directly or transitively. Files whose only change is imports, comments or formatting, and
// presentational/type files (isBehaviorFile), don't need one. Without a test, Claude is sent back
// to the skill; a commit message with a "No-Tests-Reason:" line goes to a human to approve instead.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { changesBehavior } from "./behavior-change.mjs";
import { isBehaviorFile, isRelatedTest, isTestFile } from "./tdd-files.mjs";
import { coveredModules, isCovered } from "./test-imports.mjs";

/**
 * The words after `commit` in the `git commit` segment of the command (split on ;, &&, ||, |,
 * newlines), with quoted strings blanked so a message can't look like a flag. Null when no
 * segment is a commit.
 */
function commitArgs(command) {
  const segment = command
    .replace(/"[^"]*"|'[^']*'/g, '""')
    .split(/;|&&|\|\||\||\n/)
    .map((part) => part.trim().split(/\s+/))
    .find((words) => words[0] === "git" && words.includes("commit"));
  return segment ? segment.slice(segment.indexOf("commit") + 1) : null;
}

/** `-a`, `--all`, or a short-flag cluster containing a (`-am`): commit stages tracked changes itself. */
const commitsAllTracked = (args) => args.some((arg) => arg === "--all" || /^-[a-zA-Z]*a[a-zA-Z]*$/.test(arg));

const orNull = (read) => {
  try {
    return read();
  } catch {
    return null;
  }
};
const gitShow = (spec) => orNull(() => execFileSync("git", ["show", spec], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 1e8 }));

/** The repository as this hook sees it; tests pass a fake. */
const gitRepo = {
  listChanged({ includeUnstaged }) {
    const list = (...args) => execFileSync("git", ["diff", ...args, "--name-only", "--diff-filter=ACMR"], { encoding: "utf8" }).split("\n");
    const files = [...list("--cached"), ...(includeUnstaged ? list() : [])];
    return [...new Set(files.filter(Boolean))];
  },
  read: (file) => orNull(() => readFileSync(file, "utf8")),
  readHead: (file) => gitShow(`HEAD:${file}`),
  readStaged: (file) => gitShow(`:${file}`),
};

/** Returns { decision, reason } for a commit that needs it, otherwise null. */
export function decide(input, repo = gitRepo) {
  if (input.tool_name !== "Bash") return null;
  const command = input.tool_input?.command ?? "";
  const args = commitArgs(command);
  if (!args) return null;

  const includeUnstaged = commitsAllTracked(args);
  const files = repo.listChanged({ includeUnstaged });
  const tests = files.filter(isTestFile);
  let covered;
  const isTested = (file) => tests.some((test) => isRelatedTest(file, test)) || isCovered(file, (covered ??= coveredModules(tests, repo.read)));
  // With -a the commit takes the working tree; otherwise it takes the index.
  const changes = (file) => changesBehavior(repo.readHead(file), (includeUnstaged ? repo.read(file) : repo.readStaged(file)) ?? "");

  const untested = files.filter((file) => isBehaviorFile(file) && changes(file) && !isTested(file));
  if (untested.length === 0) return null;

  const list = untested.map((file) => `  - ${file}`).join("\n");
  const noTestsReason = command.match(/No-Tests-Reason:\s*([^"'\n]+)/);
  if (noTestsReason) {
    return {
      decision: "ask",
      reason:
        `This commit changes source code with no related test changes:\n${list}\n` +
        `Reason given: ${noTestsReason[1].trim()}\nApprove only if the change has no behavioral impact.`,
    };
  }

  return {
    decision: "deny",
    reason:
      `This commit changes source code with no related test changes:\n${list}\n` +
      "Load the test-driven-development skill and follow it: write a test that fails without the change " +
      "(a reproduction test for a bug fix), make it pass, run `npm run test:unit`, stage the test and commit again. " +
      'If the change has no behavioral impact (pure refactor already covered, styling, copy), add a "No-Tests-Reason: <why>" ' +
      "line to the commit message and a human will be asked to approve it.",
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let raw = "";
  process.stdin.on("data", (chunk) => (raw += chunk));
  process.stdin.on("end", () => {
    const result = decide(JSON.parse(raw));
    if (!result) process.exit(0);

    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: result.decision,
          permissionDecisionReason: result.reason,
        },
      })
    );
  });
}
