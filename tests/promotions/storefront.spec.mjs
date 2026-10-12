import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`launch shopping surfaces at ${width}px`, async ({ page, context }, testInfo) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    // Stripe UI is intentionally inert: this suite never reaches payment providers.
    await page.route("https://js.stripe.com/**", (route) => route.fulfill({
      contentType: "application/javascript", body: "window.Stripe = function () { return null; };",
    }));
    await page.setViewportSize({ width, height: 1000 });
    const user = { id: "10000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated",
      email: "launch@example.test", created_at: "2026-10-12T00:00:00Z", app_metadata: {},
      user_metadata: { first_name: "Launch", last_name: "Tester" } };
    const payload = Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600, role: "authenticated" })).toString("base64url");
    const token = `${Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url")}.${payload}.fixture`;
    const session = { access_token: token, refresh_token: "fixture-refresh", expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: "bearer", user };
    await context.addCookies([{ name: "sb-127-auth-token", value: `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`,
      domain: "127.0.0.1", path: "/" }]);
    await page.addInitScript(() => {
      localStorage.setItem("stamp_consent", JSON.stringify({ analytics: "denied", version: 1 }));
    });
    for (const path of ["/", "/catalog", "/cart", "/checkout?cartId=20000000-0000-4000-8000-000000000001"]) {
      await page.goto(path);
      if (path === "/" || path === "/catalog") {
        const banner = page.getByRole("complementary", { name: "Launch offers" });
        await expect(banner).toBeVisible();
        const bounds = await banner.boundingBox();
        const header = await page.locator("header").first().boundingBox();
        expect(bounds.y).toBeGreaterThanOrEqual(header.height - 1);
        await expect(page.getByRole("link", { name: "Shop launch offers" })).toHaveAttribute("href", "/#launch-offers");
      } else {
        await expect(page.getByRole("complementary", { name: "Launch offers" })).toHaveCount(0);
        await expect(page.getByText(path.startsWith("/checkout") ? /€40\.00/ : /€20\.00/).first()).toBeVisible();
        await expect(page.getByText(path.startsWith("/checkout") ? /€60\.00/ : /€30\.00/).first()).toBeVisible();
      }
      if (path.startsWith("/checkout")) {
        await page.locator('input[name="billing.email"]').fill("launch@example.test");
        await page.locator('input[name="billing.phone"]').fill("+31 20 000 0000");
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow).toBe(false);
      await page.screenshot({ path: testInfo.outputPath(`${path === "/" ? "homepage" : path.split("?")[0].slice(1)}-${width}.png`), animations: "disabled", fullPage: path.startsWith("/cart") || path.startsWith("/checkout") });
      if (path === "/") {
        await page.getByRole("link", { name: "Shop launch offers" }).focus();
        await page.keyboard.press("Enter");
        await expect(page.locator("#launch-offers")).toBeInViewport();
        await expect(page.locator("#launch-offers a")).toHaveCount(2);
        await expect(page.locator("#launch-offers").getByText(/€20\.00/)).toBeVisible();
        await page.screenshot({ path: testInfo.outputPath(`launch-offers-${width}.png`), animations: "disabled" });
      }
    }
    expect(errors).toEqual([]);
  });
}

test("ends launch campaign after promotions are cleared and products cache is invalidated", async ({ page, request }) => {
  const setOffers = async (enabled) => {
    await request.post("http://127.0.0.1:55432/__fixtures/promotions", { data: { enabled } });
    const refreshed = await request.post("/api/revalidate?tag=products&secret=fixture-revalidation");
    expect(refreshed.ok()).toBe(true);
  };
  await setOffers(false);
  try {
    await page.goto("/");
    await expect(page.getByRole("complementary", { name: "Launch offers" })).toHaveCount(0);
    await expect(page.locator("#launch-offers")).toHaveCount(0);
    await page.goto("/catalog");
    await expect(page.getByRole("complementary", { name: "Launch offers" })).toHaveCount(0);
    await expect(page.locator("del")).toHaveCount(0);
  } finally { await setOffers(true); }
});
