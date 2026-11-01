#!/usr/bin/env node
// PreToolUse hook: shell commands that destroy work or change the dependency tree need
// explicit human approval, even when a permission rule would otherwise allow them. Off in auto
// mode, where the auto-mode classifier reviews commands instead.
import { pathToFileURL } from "node:url";

// Each check gets the words of one command segment (split on ;, &&, ||, |, newlines).
const CHECKS = [
  {
    name: "recursive force delete (rm -rf)",
    test: (words) => {
      if (words[0] !== "rm") return false;
      const flags = words.slice(1).filter((word) => word.startsWith("-"));
      const has = (short, long) => flags.some((flag) => flag === long || (/^-[a-zA-Z]+$/.test(flag) && flag.includes(short)));
      return (has("r", "--recursive") || has("R", "--recursive")) && has("f", "--force");
    },
  },
  {
    name: "force push (git push --force)",
    test: (words) =>
      words[0] === "git" &&
      words.includes("push") &&
      words.some((word) => word === "-f" || word.startsWith("--force") || /^\+[^\s]+/.test(word)),
  },
  {
    name: "hard reset (git reset --hard)",
    test: (words) => words[0] === "git" && words.includes("reset") && words.includes("--hard"),
  },
  {
    name: "new dependency install",
    test: (words) => {
      const [manager, subcommand, ...rest] = words;
      const packages = rest.filter((word) => !word.startsWith("-"));
      if (manager === "npm") return ["install", "i", "add"].includes(subcommand) && packages.length > 0;
      if (["yarn", "pnpm", "bun"].includes(manager)) return subcommand === "add" || (subcommand === "install" && packages.length > 0);
      return false;
    },
  },
  {
    name: "change to the remote Supabase project",
    test: (words) => {
      if (words[0] !== "supabase") return false;
      const [, group, action] = words;
      const linked = words.includes("--linked") || words.some((word) => word.startsWith("--db-url"));
      if (group === "db") return action === "push" || (action === "reset" && linked);
      if (group === "functions") return ["deploy", "delete"].includes(action);
      if (group === "secrets") return ["set", "unset"].includes(action);
      if (group === "migration") return action === "repair";
      return false;
    },
  },
  {
    name: "psql against a remote database",
    test: (words) => {
      if (words[0] !== "psql") return false;
      const isLocal = (host) => /^(localhost|127\.0\.0\.1|::1)?$/.test(host);
      const urlHost = words.map((word) => word.match(/^postgres(?:ql)?:\/\/(?:[^@/]*@)?([^:/?]*)/)?.[1]).find((host) => host !== undefined);
      const flagIndex = words.findIndex((word) => word === "-h" || word === "--host");
      const flagHost = flagIndex >= 0 ? words[flagIndex + 1] : words.find((word) => word.startsWith("--host="))?.slice(7);
      return [urlHost, flagHost].some((host) => host !== undefined && !isLocal(host));
    },
  },
];

const REASON = (names, command) =>
  `Needs approval: ${names.join(", ")}\nCommand: ${command}\n` +
  "These commands delete work, rewrite shared history, change the dependency tree, or change the " +
  "production database or deployed functions. " +
  "Approve only if you want exactly this; otherwise reject and ask for a safer alternative.";

/** Drops a `bash -c` / `sh -c` wrapper or an `npx` launcher so the real program is checked. */
function unwrap(words) {
  if (["bash", "sh", "zsh"].includes(words[0]) && words[1] === "-c") return unwrap(words.slice(2));
  if (words[0] === "npx") {
    let start = 1;
    while (words[start]?.startsWith("-")) start++;
    return unwrap(words.slice(start));
  }
  return words;
}

/** Splits a command into segments of words, ignoring env assignments and sudo before the program. */
function segments(command) {
  return command
    .split(/;|&&|\|\||\||\n/)
    .map((segment) =>
      segment
        .trim()
        .replace(/["']/g, "")
        .split(/\s+/)
        .filter(Boolean)
    )
    .map((words) => {
      let start = 0;
      while (start < words.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[start]) || ["sudo", "command", "env"].includes(words[start]))) start++;
      return unwrap(words.slice(start));
    })
    .filter((words) => words.length > 0);
}

export function decide(input) {
  if (input.tool_name !== "Bash" || input.permission_mode === "auto") return null;
  const command = input.tool_input?.command ?? "";
  const matched = new Set();
  for (const words of segments(command)) {
    for (const check of CHECKS) if (check.test(words)) matched.add(check.name);
  }
  return matched.size > 0 ? REASON([...matched], command) : null;
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
          permissionDecision: "ask",
          permissionDecisionReason: reason,
        },
      })
    );
  });
}
