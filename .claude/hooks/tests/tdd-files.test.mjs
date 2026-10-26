import { test } from "node:test";
import assert from "node:assert/strict";
import { isBehaviorFile, isRelatedTest } from "../tdd-files.mjs";

test("logic outside ui/ is behavioral source code", () => {
  for (const file of [
    "src/features/cart/lib/hooks/useCart.ts",
    "src/features/cart/lib/helpers/total.ts",
    "src/shared/services/orderService.ts",
    "src/app/api/checkout/route.ts",
    "src/providers/QueryProvider.tsx",
    "src/middleware.ts",
  ]) {
    assert.ok(isBehaviorFile(file), file);
  }
});

test("presentational components, pages and types are not gated", () => {
  for (const file of [
    "src/features/cart/ui/sections/CartList/CartList.tsx",
    "src/features/cart/ui/components/CartBadge.tsx",
    "src/features/ui/button.tsx",
    "src/shared/ui/Spinner.tsx",
    "src/app/(shop)/cart/page.tsx",
    "src/app/layout.tsx",
    "src/features/cart/lib/types/cart.ts",
    "src/shared/types/order.ts",
    "src/types/database.types.ts",
    "src/features/cart/lib/cart.types.ts",
    "src/features/cart/lib/total.test.ts",
  ]) {
    assert.ok(!isBehaviorFile(file), file);
  }
});

test("styling variants, static data and components outside lib/ are not gated", () => {
  for (const file of [
    "src/features/checkout/lib/variants/paymentResultVariants.ts",
    "src/features/homepage/lib/constants/homepageContent.ts",
    "src/shared/constants/trustMetrics.ts",
    "src/features/auth/login/LoginForm.tsx",
    "src/features/auth/ProtectedRoute.tsx",
  ]) {
    assert.ok(!isBehaviorFile(file), file);
  }
});

test("hooks and helpers stay gated wherever they sit in a slice", () => {
  assert.ok(isBehaviorFile("src/features/auth/login/useLogin.ts"));
  assert.ok(isBehaviorFile("src/features/cart/lib/hooks/useCartTotal.tsx"));
});

test("a test with the same base name is related, wherever it lives", () => {
  assert.ok(isRelatedTest("src/features/cart/lib/total.ts", "src/features/cart/lib/total.test.ts"));
  assert.ok(isRelatedTest("src/features/cart/lib/total.ts", "src/tests/total.spec.ts"));
  assert.ok(isRelatedTest("src/features/x/Thing.tsx", "src/features/x/__tests__/Thing.tsx"));
});

test("a test in the same folder or its __tests__ folder is related", () => {
  assert.ok(isRelatedTest("src/features/cart/lib/total.ts", "src/features/cart/lib/cart.test.ts"));
  assert.ok(isRelatedTest("src/features/cart/lib/total.ts", "src/features/cart/lib/__tests__/cart.test.ts"));
});

test("a test in an ancestor folder at slice level or deeper is related", () => {
  assert.ok(isRelatedTest("src/features/stamp/lib/hooks/useFlow.ts", "src/features/stamp/__tests__/flow.test.ts"));
  assert.ok(isRelatedTest("src/lib/security/rate-limiter/limit.ts", "src/lib/security/security.test.ts"));
});

test("a test in another slice or above slice level is not related", () => {
  assert.ok(!isRelatedTest("src/features/cart/lib/total.ts", "src/features/stamp/lib/flow.test.ts"));
  assert.ok(!isRelatedTest("src/features/cart/lib/total.ts", "src/__tests__/smoke.test.ts"));
  assert.ok(!isRelatedTest("src/features/cart/lib/total.ts", "src/features/__tests__/all.test.ts"));
  assert.ok(!isRelatedTest("src/features/cart/lib/total.ts", ".claude/hooks/tests/guard.test.mjs"));
});
