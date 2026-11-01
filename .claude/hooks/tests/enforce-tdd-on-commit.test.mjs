import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "../enforce-tdd-on-commit.mjs";

const bash = (command) => ({ tool_name: "Bash", tool_input: { command } });
/** A fake repo: changed files, plus file contents in the working tree, HEAD and the index. */
const repo = ({ changed = [], files = {}, head = {}, staged: index = {} }) => ({
  listChanged: typeof changed === "function" ? changed : () => changed,
  read: (file) => files[file] ?? null,
  readHead: (file) => head[file] ?? null,
  readStaged: (file) => index[file] ?? files[file] ?? null,
});
const staged = (...files) => repo({ changed: files });

test("ignores commands that are not git commit", () => {
  assert.equal(decide(bash("git status && npm run lint"), staged("src/features/cart/lib/total.ts")), null);
});

test("ignores tools other than Bash", () => {
  assert.equal(decide({ tool_name: "Write", tool_input: { file_path: "src/a.ts" } }, staged("src/a.ts")), null);
});

test("denies a commit that changes source code without touching a test", () => {
  const result = decide(bash('git commit -m "Fix cart total"'), staged("src/features/cart/lib/total.ts"));
  assert.equal(result.decision, "deny");
  assert.match(result.reason, /test-driven-development/);
  assert.match(result.reason, /src\/features\/cart\/lib\/total\.ts/);
});

test("allows a commit that changes source code together with a related test", () => {
  const files = staged("src/features/cart/lib/total.ts", "src/features/cart/lib/total.test.ts");
  assert.equal(decide(bash('git commit -m "Fix cart total"'), files), null);
});

test("denies when the only tests changed are unrelated to the source files", () => {
  const files = staged("src/features/cart/lib/total.ts", "src/features/stamp/lib/flow.test.ts", ".claude/hooks/tests/x.test.mjs");
  const result = decide(bash('git commit -m "Fix cart total"'), files);
  assert.equal(result.decision, "deny");
  assert.match(result.reason, /src\/features\/cart\/lib\/total\.ts/);
});

test("lists only the source files that lack a related test", () => {
  const files = staged("src/features/cart/lib/total.ts", "src/features/cart/lib/total.test.ts", "src/features/stamp/lib/flow.ts");
  const result = decide(bash("git commit -m x"), files);
  assert.match(result.reason, /src\/features\/stamp\/lib\/flow\.ts/);
  assert.doesNotMatch(result.reason, /cart\/lib\/total\.ts/);
});

test("counts files under __tests__ and spec files as tests", () => {
  assert.equal(decide(bash("git commit -m x"), staged("src/a.tsx", "src/__tests__/a.tsx")), null);
  assert.equal(decide(bash("git commit -m x"), staged("src/b.ts", "src/b.spec.ts")), null);
});

test("allows commits with no behavioral source files", () => {
  const files = staged("docs/README.md", "src/app/globals.css", "src/types/cart.d.ts", "src/i18n/messages/en.json");
  assert.equal(decide(bash("git commit -m docs"), files), null);
});

test("finds git commit inside a chained command", () => {
  const result = decide(bash("git add -A && git commit -m wip"), staged("src/a.ts"));
  assert.equal(result.decision, "deny");
});

test("git commit -a also checks tracked files that are not staged yet", () => {
  const listChanged = repo({ changed: ({ includeUnstaged }) => (includeUnstaged ? ["src/a.ts"] : []) });
  for (const command of ['git commit -am "wip"', 'git commit -a -m "wip"', 'git commit --all -m "wip"']) {
    assert.equal(decide(bash(command), listChanged)?.decision, "deny", command);
  }
  assert.equal(decide(bash('git commit -m "a -a flag in the message"'), listChanged), null);
});

test("allows source that a staged test reaches through its imports", () => {
  const deps = repo({
    changed: ["src/tests/checkout.test.ts", "src/shared/services/tax.ts"],
    files: {
      "src/tests/checkout.test.ts": 'import { total } from "@/features/cart/lib/helpers/total";',
      "src/features/cart/lib/helpers/total.ts": 'import { tax } from "@/shared/services/tax";',
    },
  });
  assert.equal(decide(bash("git commit -m x"), deps), null);
});

test("allows files whose only change is imports, comments or formatting", () => {
  const before = 'import { a } from "@/features/old/lib/a";\nexport const f = (x) => a(x);\n';
  const after = before.replace("@/features/old/lib/a", "@/shared/lib/a");
  const deps = repo({ changed: ["src/features/cart/lib/f.ts"], head: { "src/features/cart/lib/f.ts": before }, staged: { "src/features/cart/lib/f.ts": after } });
  assert.equal(decide(bash("git commit -m x"), deps), null);
});

test("allows commits that only change presentational components", () => {
  assert.equal(decide(bash("git commit -m x"), staged("src/features/cart/ui/sections/CartList/CartList.tsx", "src/features/ui/button.tsx")), null);
});

test("asks a human when the commit message gives a No-Tests-Reason", () => {
  const command = 'git commit -m "Rename prop" -m "No-Tests-Reason: pure rename, covered by existing tests"';
  const result = decide(bash(command), staged("src/a.ts"));
  assert.equal(result.decision, "ask");
  assert.match(result.reason, /pure rename/);
});
