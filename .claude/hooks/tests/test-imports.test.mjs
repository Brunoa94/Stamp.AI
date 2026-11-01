import { test } from "node:test";
import assert from "node:assert/strict";
import { coveredModules, isCovered } from "../test-imports.mjs";

/** Reads from an in-memory repo: { "src/a.ts": "…" }. */
const repo = (files) => (file) => files[file] ?? null;

const files = {
  "src/features/cart/__tests__/checkout.test.ts": 'import { total } from "@/features/cart/lib/helpers/total";\nimport { render } from "@testing-library/react";',
  "src/features/cart/lib/helpers/total.ts": 'import { round } from "./money";\nimport { tax } from "@/shared/services/tax";',
  "src/features/cart/lib/helpers/money.ts": "export const round = (n) => n;",
  "src/shared/services/tax.ts": 'import { total } from "@/features/cart/lib/helpers/total";',
  "src/features/stamp/lib/flow.ts": "export const flow = 1;",
};

test("a test covers what it imports, directly and transitively", () => {
  const covered = coveredModules(["src/features/cart/__tests__/checkout.test.ts"], repo(files));
  assert.ok(isCovered("src/features/cart/lib/helpers/total.ts", covered));
  assert.ok(isCovered("src/features/cart/lib/helpers/money.ts", covered));
  assert.ok(isCovered("src/shared/services/tax.ts", covered));
});

test("a test does not cover code it never reaches", () => {
  const covered = coveredModules(["src/features/cart/__tests__/checkout.test.ts"], repo(files));
  assert.ok(!isCovered("src/features/stamp/lib/flow.ts", covered));
});

test("a test covers a module it imports before the module exists (the red step)", () => {
  const covered = coveredModules(["src/features/cart/lib/discount.test.ts"], repo({ "src/features/cart/lib/discount.test.ts": 'import { discount } from "./discount";' }));
  assert.ok(isCovered("src/features/cart/lib/discount.ts", covered));
});

test("resolves index files and other extensions", () => {
  const covered = coveredModules(
    ["src/a.test.ts"],
    repo({ "src/a.test.ts": 'import x from "./widgets";\nimport y from "./B";', "src/widgets/index.ts": "", "src/B.tsx": "" })
  );
  assert.ok(isCovered("src/widgets/index.ts", covered));
  assert.ok(isCovered("src/B.tsx", covered));
});
