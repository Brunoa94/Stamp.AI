import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "../enforce-test-first.mjs";

const ROOT = "/repo";
process.env.CLAUDE_PROJECT_DIR = ROOT;
const edit = (file, session = "s1", tool = "Edit") => ({
  session_id: session,
  cwd: ROOT,
  tool_name: tool,
  tool_input: { file_path: `${ROOT}/${file}` },
});
const bash = (command, session = "s1") => ({ session_id: session, cwd: ROOT, tool_name: "Bash", tool_input: { command } });

/** In-memory stand-in for the per-session record of touched tests. */
function memoryStore() {
  const sessions = new Map();
  return {
    tests: (id) => sessions.get(id) ?? [],
    addTest: (id, file) => sessions.set(id, [...(sessions.get(id) ?? []), file]),
  };
}

test("denies editing a source file before any test was touched in the session", () => {
  const reason = decide(edit("src/features/cart/lib/total.ts"), memoryStore());
  assert.match(reason, /test-driven-development/);
  assert.match(reason, /src\/features\/cart\/lib\/total\.ts/);
});

test("allows editing a source file after a related test was edited in the same session", () => {
  const store = memoryStore();
  assert.equal(decide(edit("src/features/cart/lib/total.test.ts"), store), null);
  assert.equal(decide(edit("src/features/cart/lib/total.ts"), store), null);
});

test("a test for another part of the code does not unlock the edit", () => {
  const store = memoryStore();
  decide(edit("src/features/stamp/lib/flow.test.ts"), store);
  const reason = decide(edit("src/features/cart/lib/total.ts"), store);
  assert.match(reason, /no test covering it/);
});

test("a test edited in another session does not count", () => {
  const store = memoryStore();
  decide(edit("src/a.test.ts", "other"), store);
  assert.notEqual(decide(edit("src/a.ts", "s1"), store), null);
});

test("treats spec files and __tests__ folders as tests", () => {
  const spec = memoryStore();
  decide(edit("src/b.spec.tsx"), spec);
  assert.equal(decide(edit("src/b.tsx"), spec), null);

  const folder = memoryStore();
  decide(edit("src/features/x/__tests__/Thing.tsx", "s1", "Write"), folder);
  assert.equal(decide(edit("src/features/x/Thing.tsx", "s1", "Write"), folder), null);
});

test("counts a test written from the shell", () => {
  const store = memoryStore();
  assert.equal(decide(bash("cat > src/features/cart/lib/total.test.ts <<'EOF'\nx\nEOF"), store), null);
  assert.equal(decide(edit("src/features/cart/lib/total.ts"), store), null);
});

test("allows source a touched test reaches through its imports", () => {
  const files = {
    "src/tests/checkout.test.ts": 'import { total } from "@/features/cart/lib/helpers/total";',
    "src/features/cart/lib/helpers/total.ts": 'import { tax } from "@/shared/services/tax";',
    "src/shared/services/tax.ts": "export const tax = 0.2;",
  };
  const read = (file) => files[file] ?? null;
  const store = memoryStore();
  decide(edit("src/tests/checkout.test.ts"), store, read);
  assert.equal(decide(edit("src/shared/services/tax.ts"), store, read), null);
  assert.notEqual(decide(edit("src/features/stamp/lib/flow.ts"), store, read), null);
});

test("allows edits that only change imports, comments or formatting", () => {
  const current = 'import { a } from "@/features/old/lib/a";\nexport const f = (x) => a(x);\n';
  const read = (file) => (file === "src/features/cart/lib/f.ts" ? current : null);
  const input = {
    ...edit("src/features/cart/lib/f.ts"),
    tool_input: { file_path: `${ROOT}/src/features/cart/lib/f.ts`, old_string: "@/features/old/lib/a", new_string: "@/shared/lib/a" },
  };
  assert.equal(decide(input, memoryStore(), read), null);

  const logicChange = { ...input, tool_input: { ...input.tool_input, old_string: "a(x)", new_string: "a(x) + 1" } };
  assert.notEqual(decide(logicChange, memoryStore(), read), null);
});

test("does not gate presentational components", () => {
  assert.equal(decide(edit("src/features/cart/ui/sections/CartList/CartList.tsx"), memoryStore()), null);
});

test("does not gate files outside src or without behavior", () => {
  const store = memoryStore();
  for (const file of ["docs/README.md", "src/app/globals.css", "src/types/cart.d.ts", "src/i18n/messages/en.json", "scripts/x.ts"]) {
    assert.equal(decide(edit(file), store), null, file);
  }
});

test("gates Write and MultiEdit as well as Edit", () => {
  assert.notEqual(decide(edit("src/a.ts", "s1", "Write"), memoryStore()), null);
  assert.notEqual(decide(edit("src/a.ts", "s1", "MultiEdit"), memoryStore()), null);
});

test("ignores other tools", () => {
  assert.equal(decide({ session_id: "s1", cwd: ROOT, tool_name: "Read", tool_input: { file_path: `${ROOT}/src/a.ts` } }, memoryStore()), null);
});

test("accepts paths relative to the working directory", () => {
  const input = { session_id: "s1", cwd: ROOT, tool_name: "Edit", tool_input: { file_path: "src/a.ts" } };
  assert.notEqual(decide(input, memoryStore()), null);
});
