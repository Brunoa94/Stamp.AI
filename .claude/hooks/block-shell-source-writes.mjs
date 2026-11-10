#!/usr/bin/env node
// PreToolUse hook: src/ source code is written with Edit/Write/MultiEdit, never from the shell
// (sed -i, heredocs, tee, cp…). The test-first and slice-boundary hooks only see those tools,
// so a shell write would skip both. Tests, styles, docs and files outside src/ are not affected.
// Off in auto mode.
import path from "node:path";
import { pathToFileURL } from "node:url";
import { shellWriteTargets } from "./shell-writes.mjs";
import { isBehaviorFile } from "./tdd-files.mjs";

export function decide(input, rootDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()) {
  if (input.tool_name !== "Bash" || input.permission_mode === "auto") return null;
  const command = input.tool_input?.command ?? "";
  const cwd = input.cwd ?? rootDir;

  const files = shellWriteTargets(command)
    .map((target) => path.relative(rootDir, path.resolve(cwd, target)).split(path.sep).join("/"))
    .filter(isBehaviorFile);
  if (files.length === 0) return null;

  return (
    `This command writes src/ source code from the shell:\n${files.map((file) => `  - ${file}`).join("\n")}\n` +
    "Use the Edit, Write or MultiEdit tool for source files instead: the test-first and slice-boundary " +
    "checks only run on those tools. Shell writes to tests, styles and docs are fine."
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
