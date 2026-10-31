#!/usr/bin/env node
// PreToolUse hook: rejects edits that add an import breaking the feature-sliced boundaries
// (wrong layer direction, or reaching past another slice's public API).
// Only imports the edit introduces are rejected; ones already in the file are left for a
// refactor, so touching a legacy file doesn't block unrelated work.
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { findBoundaryViolations } from "../../eslint-rules/sliceBoundaries.mjs";

/** The text an edit writes into the file, or null for tools that don't write source. */
function writtenText(toolName, toolInput) {
  if (toolName === "Write") return toolInput.content ?? "";
  if (toolName === "Edit") return toolInput.new_string ?? "";
  if (toolName === "MultiEdit") return (toolInput.edits ?? []).map((edit) => edit.new_string ?? "").join("\n");
  return null;
}

export function decide(input, rootDir = process.cwd()) {
  const toolInput = input.tool_input ?? {};
  const filePath = toolInput.file_path ?? "";
  const text = writtenText(input.tool_name, toolInput);
  if (!filePath || text === null || !/\.[cm]?[jt]sx?$/.test(filePath)) return null;

  const current = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
  const existing = new Set(findBoundaryViolations(filePath, current, rootDir).map((v) => v.specifier));
  const introduced = findBoundaryViolations(filePath, text, rootDir).filter((v) => !existing.has(v.specifier));
  if (introduced.length === 0) return null;

  return (
    `Feature-sliced boundary violation in ${filePath}:\n` +
    introduced.map((violation) => `- ${violation.message}`).join("\n") +
    "\nSee .claude/rules/architecture.md → Slice boundaries."
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  let raw = "";
  process.stdin.on("data", (chunk) => (raw += chunk));
  process.stdin.on("end", () => {
    const reason = decide(JSON.parse(raw), process.env.CLAUDE_PROJECT_DIR ?? process.cwd());
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
