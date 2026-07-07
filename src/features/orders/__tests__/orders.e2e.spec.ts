/**
 * Orders Page E2E Tests
 *
 * Covers every user-facing scenario of /orders end-to-end against the running
 * dev server, with the Supabase network layer fully mocked so the suite is
 * deterministic and needs no real test account:
 *
 *   - Route protection (unauthenticated redirect)
 *   - Loading skeleton
 *   - Error state + retry recovery
 *   - Empty state (no orders yet)
 *   - Header title and archive count
 *   - List view: order fields, status badges, action buttons
 *   - Cancellation rules (which statuses show the Cancel button)
 *   - Retry Payment visibility (failed/pending payment status)
 *   - Grid view toggle and grid cards
 *   - Order details modal (from list and from grid)
 *   - Tracking section inside the details modal
 *   - Cancel order flow (modal, keep-active, confirm + API call, badge update)
 *   - Pagination (10 per page, page switching, prev/next disabled states)
 *   - Mobile cards, more-actions expansion and mobile pagination
 */
import { test, expect, Page } from "@playwright/test";

// ─── Auth mocking ────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const PROJECT_REF = SUPABASE_URL
  ? new URL(SUPABASE_URL).hostname.split(".")[0]
  : "";

const E2E_USER_ID = "11111111-1111-1111-1111-111111111111";
const E2E_USER_EMAIL = "orders-e2e@test.com";

function base64Url(input: string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeFakeJwt(): string {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      sub: E2E_USER_ID,
      email: E2E_USER_EMAIL,
      aud: "authenticated",
      role: "authenticated",
      session_id: "e2e-session",
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }),
  );
  return `${header}.${payload}.e2e-signature`;
}

function supabaseUser() {
  const now = new Date().toISOString();
  return {
    id: E2E_USER_ID,
    email: E2E_USER_EMAIL,
    aud: "authenticated",
    role: "authenticated",
    user_metadata: { first_name: "Orders", last_name: "Tester" },
    app_metadata: { provider: "email" },
    created_at: now,
    updated_at: now,
    email_confirmed_at: now,
  };
}

function supabaseSession() {
  return {
    access_token: makeFakeJwt(),
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "e2e-refresh-token",
    user: supabaseUser(),
  };
}

/**
 * Seeds the @supabase/ssr auth cookie and mocks the Supabase auth endpoints
 * so the app treats the browser as an authenticated session.
 */
async function mockAuth(page: Page) {
  const session = supabaseSession();

  await page.context().addCookies([
    {
      name: `sb-${PROJECT_REF}-auth-token`,
      value: `base64-${base64Url(JSON.stringify(session))}`,
      url: "http://localhost:3000",
    },
  ]);

  await page.route("**/auth/v1/user**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(supabaseUser()),
    }),
  );

  await page.route("**/auth/v1/token**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(supabaseSession()),
    }),
  );
}

// ─── Order fixtures ──────────────────────────────────────────────────────────

type OrderOverrides = Record<string, unknown> & { id: string };

function makeOrderItem(
  orderId: string,
  overrides: Record<string, unknown> = {},
) {
  const now = new Date().toISOString();
  return {
    id: `item-${orderId}`,
    order_id: orderId,
    product_id: "prod-e2e",
    variant_id: "1001",
    product_name: "E2E Custom Tee",
    variant_name: "Black / M",
    quantity: 1,
    unit_price: 25,
    total_price: 25,
    custom_image_url: "https://placehold.co/400x400.png",
    design_config: null,
    fulfillment_status: null,
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

function makeOrder(overrides: OrderOverrides) {
  const now = new Date().toISOString();
  const { id } = overrides;
  return {
    id,
    order_number: `ORD-${id.toUpperCase()}`,
    user_id: E2E_USER_ID,
    customer_email: E2E_USER_EMAIL,
    customer_name: "Orders Tester",
    customer_phone: null,
    status: "pending",
    payment_status: "paid",
    total_amount: 25,
    subtotal: 20,
    tax_amount: 2,
    shipping_cost: 3,
    discount_amount: 0,
    currency: "USD",
    payment_method: "stripe",
    printify_order_id: null,
    shipping_address: null,
    billing_address: null,
    shipping_method: null,
    tracking_number: null,
    tracking_url: null,
    customer_notes: null,
    internal_notes: null,
    product_id: null,
    created_at: now,
    updated_at: now,
    shipped_at: null,
    delivered_at: null,
    order_items: [makeOrderItem(id)],
    ...overrides,
  };
}

/** Five orders covering every status the UI distinguishes. */
function statusSpreadOrders() {
  return [
    makeOrder({
      id: "del01",
      status: "delivered",
      delivered_at: new Date().toISOString(),
      order_items: [
        makeOrderItem("del01", { product_name: "Delivered Hoodie" }),
      ],
    }),
    makeOrder({
      id: "shp01",
      status: "shipped",
      shipped_at: new Date().toISOString(),
      tracking_number: "TRACK-123456",
      tracking_url: "https://tracking.example.com/TRACK-123456",
      order_items: [makeOrderItem("shp01", { product_name: "Shipped Mug" })],
    }),
    makeOrder({
      id: "prc01",
      status: "processing",
      order_items: [
        makeOrderItem("prc01", { product_name: "Processing Poster" }),
      ],
    }),
    makeOrder({
      id: "cnl01",
      status: "cancelled",
      order_items: [makeOrderItem("cnl01", { product_name: "Cancelled Cap" })],
    }),
    makeOrder({
      id: "pnd01",
      status: "pending",
      payment_status: "failed",
      order_items: [makeOrderItem("pnd01", { product_name: "Pending Tote" })],
    }),
  ];
}

/**
 * Mocks the Supabase REST layer. The orders route is registered last so it
 * wins over the generic rest fallback.
 */
async function mockOrdersRoute(page: Page, orders: unknown[]) {
  await page.route("**/rest/v1/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    }),
  );
  await page.route("**/rest/v1/orders**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(orders),
    }),
  );
}

async function gotoOrders(page: Page) {
  await page.goto("/orders");
}

// ─── Route protection ────────────────────────────────────────────────────────

test.describe("Orders — route protection", () => {
  test("redirects unauthenticated visitors to the homepage", async ({
    page,
  }) => {
    // No auth mocks: the session is missing, so ProtectedRoute must bail out.
    await page.goto("/orders");
    await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });
  });
});

// ─── States: loading / error / empty ─────────────────────────────────────────

test.describe("Orders — async states", () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test("shows the loading skeleton while orders are being fetched", async ({
    page,
  }) => {
    await page.route("**/rest/v1/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    // Delay the orders response so the skeleton is observable.
    await page.route("**/rest/v1/orders**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2_000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([makeOrder({ id: "slow1" })]),
      });
    });

    await gotoOrders(page);

    const skeleton = page.locator(".orders-terminal");
    await expect(skeleton.first()).toBeVisible({ timeout: 15_000 });
    // While loading, no order content is on screen yet.
    await expect(
      page.getByRole("heading", { name: /my\s+orders/i }),
    ).toHaveCount(0);

    // After the delayed response, the real content replaces the skeleton.
    await expect(
      page.getByRole("heading", { name: /my\s+orders/i }),
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  test("shows the error state when the orders request fails and recovers on retry", async ({
    page,
  }) => {
    // React Query retries failed queries, so keep failing until the test
    // explicitly flips the switch right before clicking "Try Again".
    let shouldFail = true;
    await page.route("**/rest/v1/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    await page.route("**/rest/v1/orders**", async (route) => {
      if (shouldFail) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Internal error" }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([makeOrder({ id: "rcv01" })]),
      });
    });

    await gotoOrders(page);

    await expect(
      page.getByRole("heading", { name: /failed to load orders/i }),
    ).toBeVisible({ timeout: 30_000 });

    shouldFail = false;
    await page.getByRole("button", { name: /try again/i }).click();

    await expect(
      page.getByRole("heading", { name: /my\s+orders/i }),
    ).toBeVisible({
      timeout: 20_000,
    });
  });

  test("shows the empty state when the user has no orders", async ({
    page,
  }) => {
    await mockOrdersRoute(page, []);
    await gotoOrders(page);

    await expect(
      page.getByRole("heading", { name: /no orders yet/i }),
    ).toBeVisible({
      timeout: 20_000,
    });
    await expect(
      page.getByText(/you haven't placed any orders yet/i),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /start creating/i }),
    ).toBeVisible();
  });
});

// ─── Desktop: list view ──────────────────────────────────────────────────────

test.describe("Orders — desktop list view", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop layout only");

  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockOrdersRoute(page, statusSpreadOrders());
    await gotoOrders(page);
    await expect(
      page.getByRole("heading", { name: /my\s+orders/i }),
    ).toBeVisible({
      timeout: 20_000,
    });
  });

  test("renders the page header with the order count", async ({ page }) => {
    await expect(page.getByText(/5 orders in archives/i)).toBeVisible();
  });

  test("renders one list card per order with its details", async ({ page }) => {
    const cards = page.locator("article");
    await expect(cards).toHaveCount(5);

    const first = cards.filter({ hasText: "Delivered Hoodie" });
    await expect(first.getByText(/^ID: /)).toBeVisible();
    await expect(first.getByText("Ordered", { exact: true })).toBeVisible();
    await expect(first.getByText("Variant", { exact: true })).toBeVisible();
    await expect(first.getByText("Black / M")).toBeVisible();
    await expect(first.getByText("Qty", { exact: true })).toBeVisible();
    await expect(first.getByText("Value", { exact: true })).toBeVisible();
    await expect(first.getByText(/\$25\.00 USD/i)).toBeVisible();
    await expect(
      first.getByRole("button", { name: /track protocol/i }),
    ).toBeVisible();
  });

  test("shows the correct status badge for every order status", async ({
    page,
  }) => {
    const badgeFor = (product: string) =>
      page.locator("article").filter({ hasText: product }).getByRole("status");

    await expect(badgeFor("Delivered Hoodie")).toHaveText(/delivered/i);
    await expect(badgeFor("Shipped Mug")).toHaveText(/shipped/i);
    await expect(badgeFor("Processing Poster")).toHaveText(/processing/i);
    await expect(badgeFor("Cancelled Cap")).toHaveText(/cancelled/i);
    await expect(badgeFor("Pending Tote")).toHaveText(/pending/i);
  });

  test("only cancellable orders expose a Cancel button", async ({ page }) => {
    const card = (product: string) =>
      page.locator("article").filter({ hasText: product });

    // pending → cancellable
    await expect(
      card("Pending Tote").getByRole("button", { name: /^cancel$/i }),
    ).toBeVisible();

    // delivered / shipped / processing / cancelled → not cancellable
    for (const product of [
      "Delivered Hoodie",
      "Shipped Mug",
      "Processing Poster",
      "Cancelled Cap",
    ]) {
      await expect(
        card(product).getByRole("button", { name: /^cancel$/i }),
      ).toHaveCount(0);
    }
  });

  test("shows Retry Payment only for orders with a failed or pending payment", async ({
    page,
  }) => {
    const card = (product: string) =>
      page.locator("article").filter({ hasText: product });

    await expect(
      card("Pending Tote").getByRole("link", { name: /retry payment/i }),
    ).toBeVisible();
    await expect(
      card("Delivered Hoodie").getByRole("link", { name: /retry payment/i }),
    ).toHaveCount(0);
    await expect(
      card("Delivered Hoodie").getByRole("button", { name: /view blueprint/i }),
    ).toBeVisible();
  });

  test("opens and closes the order details modal from a list card", async ({
    page,
  }) => {
    await page
      .locator("article")
      .filter({ hasText: "Shipped Mug" })
      .getByRole("button", { name: /track protocol/i })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/protocol ord-shp01/i)).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: /order summary/i }),
    ).toBeVisible();
    await expect(dialog.getByText(E2E_USER_EMAIL)).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: /order items/i }),
    ).toBeVisible();
    await expect(dialog.getByText("Shipped Mug")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("details modal shows tracking info when the order has been shipped", async ({
    page,
  }) => {
    await page
      .locator("article")
      .filter({ hasText: "Shipped Mug" })
      .getByRole("button", { name: /track protocol/i })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: /fulfillment timeline/i }),
    ).toBeVisible();
    await expect(dialog.getByText("TRACK-123456")).toBeVisible();

    const trackLink = dialog.getByRole("link", { name: /track package/i });
    await expect(trackLink).toBeVisible();
    await expect(trackLink).toHaveAttribute(
      "href",
      "https://tracking.example.com/TRACK-123456",
    );
  });
});

// ─── Desktop: grid view ──────────────────────────────────────────────────────

test.describe("Orders — desktop grid view", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop layout only");

  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockOrdersRoute(page, statusSpreadOrders());
    await gotoOrders(page);
    await expect(
      page.getByRole("heading", { name: /my\s+orders/i }),
    ).toBeVisible({
      timeout: 20_000,
    });
  });

  test("switches to grid view and back to list view", async ({ page }) => {
    await page.getByRole("button", { name: /grid view/i }).click();

    // Grid cards use TRACK buttons; list articles disappear.
    await expect(
      page.getByRole("button", { name: /^track$/i }).first(),
    ).toBeVisible();
    await expect(page.locator("article")).toHaveCount(0);

    await page.getByRole("button", { name: /list view/i }).click();
    await expect(page.locator("article")).toHaveCount(5);
  });

  test("grid cards show number, status, price and status-driven actions", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /grid view/i }).click();

    await expect(page.getByText("01", { exact: true }).first()).toBeVisible();

    const pendingCard = page
      .locator("div.group")
      .filter({ hasText: "Pending Tote" })
      .first();
    await expect(pendingCard.getByRole("status")).toHaveText(/pending/i);
    await expect(pendingCard.getByText("$25.00")).toBeVisible();
    await expect(
      pendingCard.getByRole("button", { name: /^cancel$/i }),
    ).toBeVisible();

    const deliveredCard = page
      .locator("div.group")
      .filter({ hasText: "Delivered Hoodie" })
      .first();
    await expect(
      deliveredCard.getByRole("button", { name: /^reorder$/i }),
    ).toBeVisible();
    await expect(
      deliveredCard.getByRole("button", { name: /^cancel$/i }),
    ).toHaveCount(0);
  });

  test("clicking a grid card opens the order details modal", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /grid view/i }).click();

    await page
      .locator("div.group")
      .filter({ hasText: "Delivered Hoodie" })
      .first()
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/protocol ord-del01/i)).toBeVisible();
  });
});

// ─── Cancel order flow ───────────────────────────────────────────────────────

test.describe("Orders — cancel flow", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop layout only");

  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
  });

  test("keeps the order when dismissing the cancel confirmation modal", async ({
    page,
  }) => {
    await mockOrdersRoute(page, statusSpreadOrders());
    await gotoOrders(page);

    await page
      .locator("article")
      .filter({ hasText: "Pending Tote" })
      .getByRole("button", { name: /^cancel$/i })
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/terminate order\?/i).first()).toBeVisible();

    await dialog.getByRole("button", { name: /keep protocol active/i }).click();
    await expect(dialog).toHaveCount(0);

    // Order unchanged.
    await expect(
      page
        .locator("article")
        .filter({ hasText: "Pending Tote" })
        .getByRole("status"),
    ).toHaveText(/pending/i);
  });

  test("confirms cancellation, calls the cancel API and updates the badge", async ({
    page,
  }) => {
    let cancelled = false;
    let cancelRequestBody: Record<string, unknown> | null = null;

    await page.route("**/rest/v1/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      }),
    );
    await page.route("**/rest/v1/orders**", async (route) => {
      const orders = statusSpreadOrders().map((order) =>
        order.id === "pnd01" && cancelled
          ? { ...order, status: "cancelled" }
          : order,
      );
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(orders),
      });
    });
    await page.route("**/functions/v1/cancel-order", async (route) => {
      cancelled = true;
      cancelRequestBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, order_id: "pnd01" }),
      });
    });

    await gotoOrders(page);

    await page
      .locator("article")
      .filter({ hasText: "Pending Tote" })
      .getByRole("button", { name: /^cancel$/i })
      .click();

    await page.getByRole("button", { name: /halt & cancel order/i }).click();

    // Modal closes and the refetched order shows the cancelled badge.
    await expect(page.getByRole("dialog")).toHaveCount(0, { timeout: 15_000 });
    await expect(
      page
        .locator("article")
        .filter({ hasText: "Pending Tote" })
        .getByRole("status"),
    ).toHaveText(/cancelled/i, { timeout: 15_000 });

    expect(cancelRequestBody).toMatchObject({ order_id: "pnd01" });
  });
});

// ─── Pagination ──────────────────────────────────────────────────────────────

test.describe("Orders — pagination", () => {
  test.skip(({ isMobile }) => isMobile, "Desktop layout only");

  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    const manyOrders = Array.from({ length: 12 }, (_, index) =>
      makeOrder({
        id: `pg${String(index + 1).padStart(2, "0")}`,
        order_items: [
          makeOrderItem(`pg${index + 1}`, {
            product_name: `Paginated Item ${index + 1}`,
          }),
        ],
      }),
    );
    await mockOrdersRoute(page, manyOrders);
    await gotoOrders(page);
    await expect(
      page.getByRole("heading", { name: /my\s+orders/i }),
    ).toBeVisible({
      timeout: 20_000,
    });
  });

  test("shows 10 orders per page and switches pages", async ({ page }) => {
    await expect(page.locator("article")).toHaveCount(10);

    await page.getByRole("button", { name: "02", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(2);
    await expect(page.getByText("Paginated Item 11")).toBeVisible();

    await page.getByRole("button", { name: "01", exact: true }).click();
    await expect(page.locator("article")).toHaveCount(10);
  });

  test("disables prev on the first page and next on the last page", async ({
    page,
  }) => {
    const prev = page.getByRole("button", { name: /previous page/i });
    const next = page.getByRole("button", { name: /next page/i });

    await expect(prev).toBeDisabled();
    await expect(next).toBeEnabled();

    await next.click();
    await expect(page.locator("article")).toHaveCount(2);
    await expect(prev).toBeEnabled();
    await expect(next).toBeDisabled();
  });
});

// ─── Mobile layout ───────────────────────────────────────────────────────────

test.describe("Orders — mobile layout", () => {
  test.skip(({ isMobile }) => !isMobile, "Mobile layout only");

  test.beforeEach(async ({ page }) => {
    await mockAuth(page);
    await mockOrdersRoute(page, statusSpreadOrders());
    await gotoOrders(page);
    await expect(
      page.getByRole("heading", { name: /my\s+orders/i }),
    ).toBeVisible({
      timeout: 20_000,
    });
  });

  test("renders mobile order cards with status and actions", async ({
    page,
  }) => {
    // Mobile cards display formatOrderId(order.id) → "#PND01".
    const card = page
      .locator("div.border")
      .filter({ has: page.getByRole("heading", { name: "#PND01" }) });

    await expect(card.getByRole("status")).toHaveText(/pending/i);
    await expect(card.getByRole("button", { name: /^view$/i })).toBeVisible();
    await expect(
      card.getByRole("button", { name: /^reorder$/i }).first(),
    ).toBeVisible();
  });

  test("expands more actions with reuse, reorder and support options", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: /more actions/i })
      .first()
      .click();

    await expect(
      page.getByRole("link", { name: /use same image/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /report about this order/i }),
    ).toBeVisible();
  });

  test("opens the order details modal from a mobile card", async ({ page }) => {
    await page
      .getByRole("button", { name: /^view$/i })
      .first()
      .click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("heading", { name: /order summary/i }),
    ).toBeVisible();
  });

  test("shows Retry Payment on mobile for failed payments", async ({
    page,
  }) => {
    await expect(
      page.getByRole("link", { name: /retry payment/i }),
    ).toBeVisible();
  });

  test("paginates with the mobile controls when there are many orders", async ({
    page,
  }) => {
    // Re-mock with 12 orders and reload.
    await page.unroute("**/rest/v1/orders**");
    const manyOrders = Array.from({ length: 12 }, (_, index) =>
      makeOrder({ id: `mp${String(index + 1).padStart(2, "0")}` }),
    );
    await page.route("**/rest/v1/orders**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(manyOrders),
      }),
    );
    await page.reload();
    await expect(
      page.getByRole("heading", { name: /my\s+orders/i }),
    ).toBeVisible({
      timeout: 20_000,
    });

    await expect(page.getByText("01/02")).toBeVisible();

    await page.getByRole("button", { name: /next page/i }).click();
    await expect(page.getByText("02/02")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /next page/i }),
    ).toBeDisabled();

    await page.getByRole("button", { name: /previous page/i }).click();
    await expect(page.getByText("01/02")).toBeVisible();
  });
});
