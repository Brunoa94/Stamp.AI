/**
 * E2E security tests for the hardening changes in this branch.
 *
 * These run UNAUTHENTICATED (storageState is explicitly cleared) so they
 * assert the security boundary itself: auth gates, route protection, SSRF
 * blocking, security headers, open-redirect protection, and removal of the
 * debug route. They do not require TEST_USER credentials.
 */
import { expect, test } from "@playwright/test";

test.describe("Security hardening", () => {
  // Force an anonymous session for every test in this block.
  test.use({ storageState: { cookies: [], origins: [] } });

  test.describe("Security headers", () => {
    test("baseline security headers are present on the app shell", async ({ page }) => {
      const response = await page.goto("/");
      expect(response, "expected a response for /").not.toBeNull();

      const headers = response!.headers();
      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(headers["strict-transport-security"]).toContain("max-age=");

      const csp = headers["content-security-policy"] ?? "";
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("default-src 'self'");
    });
  });

  test.describe("Middleware route protection", () => {
    for (const route of ["/orders", "/profile", "/cart", "/checkout", "/dashboard"]) {
      test(`unauthenticated ${route} is redirected to home`, async ({ page }) => {
        await page.goto(route);
        // Middleware should bounce anonymous users to "/" before the page renders.
        await page.waitForURL((url) => url.pathname === "/", { timeout: 15_000 });
        expect(new URL(page.url()).pathname).toBe("/");
      });
    }
  });

  test.describe("fetch-remote-image (SSRF proxy)", () => {
    test("requires authentication", async ({ request }) => {
      const res = await request.get(
        "/api/fetch-remote-image?url=https://images.printify.com/logo.png",
      );
      expect(res.status()).toBe(401);
    });

    test("is not an open proxy to internal/metadata hosts", async ({ request }) => {
      // Cloud metadata endpoint — must never be proxied back to the caller.
      const res = await request.get(
        "/api/fetch-remote-image?url=http://169.254.169.254/latest/meta-data/",
      );
      expect(res.status()).not.toBe(200);
      // Anonymous callers are rejected at the auth gate.
      expect(res.status()).toBe(401);
    });
  });

  test.describe("fetch-custom-product", () => {
    test("requires authentication", async ({ request }) => {
      const res = await request.get("/api/fetch-custom-product?product_id=123");
      expect(res.status()).toBe(401);
    });
  });

  test.describe("best-provider", () => {
    test("rejects missing params without leaking internals", async ({ request }) => {
      const res = await request.post("/api/best-provider", { data: {} });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(body.error).toBeTruthy();
    });
  });

  test.describe("auth callback open-redirect", () => {
    test("does not redirect off-site via the next param", async ({ request }) => {
      const res = await request.get(
        "/auth/callback?next=https://evil.example.com",
        { maxRedirects: 0 },
      );
      // With no auth code, the callback redirects to its own error page.
      // The `next` param must never produce an off-site Location.
      const location = res.headers()["location"] ?? "";
      expect(location).not.toContain("evil.example.com");
      if (location) {
        // If a Location was set, it must resolve to our own origin.
        const resolved = new URL(location, "http://localhost:3000");
        expect(resolved.host).toBe("localhost:3000");
      }
    });
  });

  test.describe("removed debug route", () => {
    test("test-variant-prices no longer exists", async ({ request }) => {
      const res = await request.get("/api/test-variant-prices?blueprint_id=5");
      expect(res.status()).toBe(404);
    });
  });
});
