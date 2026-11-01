#!/usr/bin/env node
// PreToolUse hook: unit tests written during a feature's TDD loop (the test-driven-development
// skill) are removed before the code is committed or pushed. A `git commit` whose index adds a
// unit test under src/, or a `git push` whose unpushed commits add one, is rejected with the
// list of tests to delete. Changes to existing tests, hook tests and acceptance specs are fine.
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { isTestFile } from "./tdd-files.mjs";

/** The git subcommands the command runs (split on ;, &&, ||, |, newlines), with quoted strings blanked. */
function gitSubcommands(command) {
  return command
    .replace(/"[^"]*"|'[^']*'/g, '""')
    .split(/;|&&|\|\||\||\n/)
    .map((part) => part.trim().split(/\s+/))
    .filter((words) => words[0] === "git")
    .flatMap((words) => words.filter((word) => word === "commit" || word === "push"));
}

const gitLines = (...args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean);

/** The repository as this hook sees it; tests pass a fake. */
const gitRepo = {
  addedInIndex: () => gitLines("diff", "--cached", "--name-only", "--diff-filter=A"),
  addedInUnpushedCommits: () => gitLines("log", "HEAD", "--not", "--remotes", "--diff-filter=A", "--name-only", "--format="),
};

const isUnitTest = (file) => file.startsWith("src/") && isTestFile(file);

/** Returns { decision, reason } when the command would commit or push new unit tests, otherwise null. */
export function decide(input, repo = gitRepo) {
  if (input.tool_name !== "Bash") return null;
  const subcommands = gitSubcommands(input.tool_input?.command ?? "");
  if (subcommands.length === 0) return null;

  const added = [
    ...(subcommands.includes("commit") ? repo.addedInIndex() : []),
    ...(subcommands.includes("push") ? repo.addedInUnpushedCommits() : []),
  ];
  const tests = [...new Set(added.filter(isUnitTest))];
  if (tests.length === 0) return null;

  const list = tests.map((file) => `  - ${file}`).join("\n");
  return {
    decision: "deny",
    reason:
      `These new unit tests would be committed or pushed:\n${list}\n` +
      "Unit tests written during a feature's TDD loop are removed before committing or pushing " +
      "(test-driven-development skill, \"Before committing\"). Delete them (git rm, or rewrite the " +
      "unpushed commits that added them), run `npm run test:unit` so the existing tests still pass, then retry.",
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
