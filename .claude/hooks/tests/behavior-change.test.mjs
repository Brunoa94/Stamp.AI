import { test } from "node:test";
import assert from "node:assert/strict";
import { changesBehavior } from "../behavior-change.mjs";

const code = 'import { a } from "@/features/old/lib/a";\n\nexport function f(x) {\n  return a(x) + 1;\n}\n';

test("changing only import paths does not change behavior", () => {
  assert.equal(changesBehavior(code, code.replace("@/features/old/lib/a", "@/shared/lib/a")), false);
});

test("reformatting a multi-line import does not change behavior", () => {
  const before = 'import { a, b } from "./x";\nconst y = a + b;';
  const after = 'import {\n  a,\n  b,\n} from "./y";\nconst y = a + b;';
  assert.equal(changesBehavior(before, after), false);
});

test("comments and whitespace do not change behavior", () => {
  const after = code.replace("export function", "// Adds one.\n/** Docs. */\nexport  function");
  assert.equal(changesBehavior(code, after), false);
});

test("a code change changes behavior", () => {
  assert.equal(changesBehavior(code, code.replace("+ 1", "+ 2")), true);
});

test("a change inside a URL string is not mistaken for a comment", () => {
  assert.equal(changesBehavior('const u = "https://a.com";', 'const u = "https://b.com";'), true);
});

test("a new file changes behavior", () => {
  assert.equal(changesBehavior(null, code), true);
});
