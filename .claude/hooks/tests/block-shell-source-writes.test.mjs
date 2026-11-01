import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "../block-shell-source-writes.mjs";

const ROOT = "/repo";
const bash = (command) => ({ tool_name: "Bash", cwd: ROOT, tool_input: { command } });

test("denies shell writes to src/ source code and names the files", () => {
  const reason = decide(bash("sed -i '' 's/a/b/' src/features/cart/lib/total.ts"), ROOT);
  assert.match(reason, /src\/features\/cart\/lib\/total\.ts/);
  assert.match(reason, /Edit/);
});

test("resolves absolute paths against the project root", () => {
  assert.notEqual(decide(bash("cat > /repo/src/a.ts <<'EOF'\nx\nEOF"), ROOT), null);
});

test("allows shell writes to tests, styles, docs and files outside src", () => {
  for (const command of [
    "cat > src/a.test.ts <<'EOF'\nx\nEOF",
    "sed -i '' 's/a/b/' src/app/globals.css",
    "echo x >> docs/README.md",
    "cp /tmp/x.ts scripts/x.ts",
  ]) {
    assert.equal(decide(bash(command), ROOT), null, command);
  }
});

test("allows renames and reads", () => {
  assert.equal(decide(bash("git mv src/a.ts src/b.ts"), ROOT), null);
  assert.equal(decide(bash("grep -rn foo src > /tmp/out.txt"), ROOT), null);
});

test("ignores tools other than Bash", () => {
  assert.equal(decide({ tool_name: "Edit", tool_input: { file_path: "src/a.ts" } }, ROOT), null);
});

test("stands aside in auto mode", () => {
  const command = "sed -i '' 's/a/b/' src/features/cart/lib/total.ts";
  assert.equal(decide({ ...bash(command), permission_mode: "auto" }, ROOT), null);
  assert.notEqual(decide({ ...bash(command), permission_mode: "acceptEdits" }, ROOT), null);
});
