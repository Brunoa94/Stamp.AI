import { test } from "node:test";
import assert from "node:assert/strict";
import { shellWriteTargets } from "../shell-writes.mjs";

const targets = (command) => shellWriteTargets(command).sort();

test("finds redirection targets, including heredocs and appends", () => {
  assert.deepEqual(targets("cat > src/a.ts <<'EOF'\nexport const a = 1;\nEOF"), ["src/a.ts"]);
  assert.deepEqual(targets("echo x >> src/b.ts"), ["src/b.ts"]);
  assert.deepEqual(targets('printf "%s" "$X" >"src/c.tsx"'), ["src/c.tsx"]);
});

test("finds files edited in place by sed and perl", () => {
  assert.deepEqual(targets("sed -i '' 's/a/b/' src/a.ts src/b.ts"), ["src/a.ts", "src/b.ts"]);
  assert.deepEqual(targets("perl -pi -e 's/a/b/' src/a.ts"), ["src/a.ts"]);
});

test("finds tee and cp destinations", () => {
  assert.deepEqual(targets("echo x | tee -a src/a.ts"), ["src/a.ts"]);
  assert.deepEqual(targets("cp /tmp/draft.ts src/a.ts"), ["src/a.ts"]);
});

test("mv into src from outside writes new content; a rename inside src does not", () => {
  assert.deepEqual(targets("mv /tmp/draft.ts src/a.ts"), ["src/a.ts"]);
  assert.deepEqual(targets("mv src/a.ts src/b.ts"), []);
  assert.deepEqual(targets("git mv src/a.ts src/b.ts"), []);
});

test("ignores commands that only read", () => {
  assert.deepEqual(targets("cat src/a.ts | grep foo"), []);
  assert.deepEqual(targets("sed -n 1,20p src/a.ts"), []);
  assert.deepEqual(targets("npx vitest run src/a.test.ts 2>&1"), []);
});

test("looks inside bash -c", () => {
  assert.deepEqual(targets("bash -c \"sed -i 's/a/b/' src/a.ts\""), ["src/a.ts"]);
});
