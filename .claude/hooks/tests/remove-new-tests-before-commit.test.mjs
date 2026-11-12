import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "../remove-new-tests-before-commit.mjs";

const bash = (command) => ({ tool_name: "Bash", tool_input: { command } });
/** A fake repo: files the index adds, and files added by commits that are on no remote yet. */
const repo = ({ staged = [], unpushed = [] } = {}) => ({
  addedInIndex: () => staged,
  addedInUnpushedCommits: () => unpushed,
});

test("ignores commands that are not git commit or git push", () => {
  assert.equal(decide(bash("git status && npm run test:unit"), repo({ staged: ["src/a.test.ts"] })), null);
});

test("ignores tools other than Bash", () => {
  assert.equal(decide({ tool_name: "Write", tool_input: { file_path: "src/a.test.ts" } }, repo({ staged: ["src/a.test.ts"] })), null);
});

test("denies a commit that adds a new unit test and lists it", () => {
  const result = decide(bash('git commit -m "Add cart total"'), repo({ staged: ["src/features/cart/lib/total.ts", "src/features/cart/lib/total.test.ts"] }));
  assert.equal(result.decision, "deny");
  assert.match(result.reason, /src\/features\/cart\/lib\/total\.test\.ts/);
  assert.doesNotMatch(result.reason, /total\.ts\n/);
});

test("counts spec files and files under __tests__ as unit tests", () => {
  for (const file of ["src/b.spec.ts", "src/features/cart/lib/__tests__/useCart.tsx"]) {
    assert.equal(decide(bash("git commit -m x"), repo({ staged: [file] }))?.decision, "deny", file);
  }
});

test("allows a commit without new unit tests", () => {
  assert.equal(decide(bash('git commit -m "Add cart total"'), repo({ staged: ["src/features/cart/lib/total.ts"] })), null);
});

test("allows new tests outside src: hook tests and acceptance specs", () => {
  const staged = [".claude/hooks/tests/x.test.mjs", "tests/acceptance/specs/guest-checkout.spec.mjs"];
  assert.equal(decide(bash("git commit -m x"), repo({ staged })), null);
});

test("finds git commit inside a chained command", () => {
  assert.equal(decide(bash("git add -A && git commit -m wip"), repo({ staged: ["src/a.test.ts"] }))?.decision, "deny");
});

test("denies a push whose unpushed commits add a unit test", () => {
  const result = decide(bash("git push -u origin feat/x"), repo({ unpushed: ["src/a.test.ts"] }));
  assert.equal(result.decision, "deny");
  assert.match(result.reason, /src\/a\.test\.ts/);
});

test("allows a push whose commits add no unit test", () => {
  assert.equal(decide(bash("git push"), repo({ unpushed: ["src/a.ts"] })), null);
});

test("does not treat a commit message mentioning git push as a push", () => {
  assert.equal(decide(bash('git commit -m "before git push"'), repo({ unpushed: ["src/a.test.ts"] })), null);
});
