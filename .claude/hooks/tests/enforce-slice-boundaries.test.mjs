import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { decide } from "../enforce-slice-boundaries.mjs";

const ROOT = "/repo";
const write = (file, content, root = ROOT) => ({ tool_name: "Write", tool_input: { file_path: path.join(root, file), content } });

test("rejects shared code importing a feature (wrong layer direction)", () => {
  const reason = decide(write("src/shared/queries/authQueries.ts", 'import { x } from "@/features/auth/lib/helpers/redirectTarget";'), ROOT);
  assert.match(reason, /boundary violation/);
});

test("rejects reaching into another slice's internals", () => {
  const reason = decide(write("src/features/stamp/ui/components/StampHeader.tsx", 'import { Login } from "@/features/auth/login/Login";'), ROOT);
  assert.match(reason, /@\/features\/auth\/login\/Login/);
});

test("allows another slice's public API", () => {
  const content = 'import { f } from "@/features/stamp/lib/helpers/sizeDisplayMapper";\nimport { C } from "@/features/stamp/ui/components/C";';
  assert.equal(decide(write("src/features/cart/ui/sections/Card/Card.tsx", content), ROOT), null);
});

test("checks the new_string of an Edit and every edit of a MultiEdit", () => {
  const file = path.join(ROOT, "src/shared/queries/q.ts");
  const bad = 'import { x } from "@/features/auth/lib/a";';
  assert.notEqual(decide({ tool_name: "Edit", tool_input: { file_path: file, new_string: bad } }, ROOT), null);
  assert.notEqual(decide({ tool_name: "MultiEdit", tool_input: { file_path: file, edits: [{ new_string: "" }, { new_string: bad }] } }, ROOT), null);
});

test("does not block an edit for a violation already in the file", () => {
  const root = mkdtempSync(path.join(tmpdir(), "slice-"));
  const file = "src/shared/queries/legacy.ts";
  const legacy = 'import { x } from "@/features/auth/lib/a";\n';
  mkdirSync(path.join(root, "src/shared/queries"), { recursive: true });
  writeFileSync(path.join(root, file), legacy);
  assert.equal(decide(write(file, `${legacy}export const y = 1;`, root), root), null);
});

test("exempts test files and ignores non-code files", () => {
  assert.equal(decide(write("src/shared/queries/q.test.ts", 'import { x } from "@/features/auth/lib/a";'), ROOT), null);
  assert.equal(decide(write("docs/README.md", 'import { x } from "@/features/auth/login/Login";'), ROOT), null);
});

test("allows aliases that resolve outside src/ (@/shared-types, @/supabase/*)", () => {
  const content = 'import { ErrorCodeT } from "@/shared-types";\nimport { T } from "@/supabase/types/database";';
  assert.equal(decide(write("src/shared/hooks/useErrorHandler.ts", content), ROOT), null);
});
