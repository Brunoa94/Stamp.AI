import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "../protect-acceptance-tests.mjs";

const edit = (file_path) => ({ tool_name: "Edit", tool_input: { file_path } });
const bash = (command) => ({ tool_name: "Bash", tool_input: { command } });

test("asks before editing acceptance tests and their config", () => {
  for (const file of ["tests/acceptance/specs/cart.spec.ts", "/repo/tests/acceptance/support/x.ts", "src/x.acceptance.test.ts", "playwright.acceptance.config.mjs"]) {
    assert.notEqual(decide(edit(file)), null, file);
  }
});

test("asks before shell commands that write acceptance tests", () => {
  for (const command of ["sed -i '' 's/a/b/' tests/acceptance/specs/a.spec.ts", "echo x > tests/acceptance/a.ts", "rm tests/acceptance/a.ts", "git checkout -- tests/acceptance/a.ts"]) {
    assert.notEqual(decide(bash(command)), null, command);
  }
});

test("allows reading and running acceptance tests", () => {
  for (const command of ["cat tests/acceptance/specs/a.spec.ts", "npm run test:acceptance -- tests/acceptance/specs/a.spec.ts", "grep -rn foo tests/acceptance"]) {
    assert.equal(decide(bash(command)), null, command);
  }
});

test("ignores other files", () => {
  assert.equal(decide(edit("src/features/cart/lib/total.ts")), null);
  assert.equal(decide(edit("tests/unit/x.test.ts")), null);
});
