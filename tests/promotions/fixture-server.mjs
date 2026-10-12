// Local-only HTTP fixtures for storefront screenshots. No real credentials/payments.
import http from "node:http";
const now = "2026-10-12T00:00:00Z";
const user = { id: "10000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated",
  email: "launch@example.test", created_at: now, app_metadata: { provider: "email" },
  user_metadata: { first_name: "Launch", last_name: "Tester" } };
const products = [
  { blueprint_id: 6, display_title: "Unisex Heavy Cotton Tee", selling_price_cents: 3000, promotional_price: 2000 },
  { blueprint_id: 68, display_title: "Ceramic Mug", selling_price_cents: 2500, promotional_price: 1750 },
  { blueprint_id: 145, display_title: "Unisex Softstyle T-Shirt", selling_price_cents: 3500, promotional_price: null },
].map((p) => ({ min_price_cents: 1000, shipping_cents: 499, is_active: true, print_provider_id: 99,
  original_price_cents: null, is_on_sale: false, discount_percent: null, is_product_of_month: p.blueprint_id === 6,
  base_image_url: "/stamp-steps/product.png", image_urls: ["/stamp-steps/product.png"],
  created_at: now, updated_at: now, last_synced_at: now,
  product_seo: { blueprint_id: p.blueprint_id, meta_title: null, meta_description: "Create something personal for our launch.",
    printify_description: "<p>Made for your own design.</p>", meta_keywords: null, created_at: now, updated_at: now }, ...p }));
const cart = { id: "20000000-0000-4000-8000-000000000001", user_id: user.id, session_id: null,
  user_email: user.email, created_at: now, updated_at: now, cart_items: [
    { id: "30000000-0000-4000-8000-000000000001", product_id: "launchtee", variant_id: "101", product_name: "Unisex Heavy Cotton Tee", quantity: 2, unit_price: 3000, is_selected: true },
    { id: "30000000-0000-4000-8000-000000000002", product_id: "launchmug", variant_id: "102", product_name: "Ceramic Mug", quantity: 1, unit_price: 2500, is_selected: true },
  ].map((p) => ({ cart_id: "20000000-0000-4000-8000-000000000001", custom_image_url: "/stamp-steps/product.png",
    variant_name: "White / M", image_index: 0, created_at: now, updated_at: now, ...p })) };
http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:55432");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Content-Type", "application/json");
  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
  let data = [];
  let body = "";
  for await (const chunk of req) body += chunk;
  const payload = body ? JSON.parse(body) : {};
  if (url.pathname === "/health") data = { ready: true };
  else if (url.pathname === "/__fixtures/promotions") {
    products[0].promotional_price = payload.enabled ? 2000 : null;
    products[1].promotional_price = payload.enabled ? 1750 : null;
    data = { enabled: payload.enabled };
  }
  else if (url.pathname === "/auth/v1/user") data = user;
  else if (url.pathname === "/auth/v1/token") data = { user };
  else if (url.pathname === "/rest/v1/catalog_products") {
    data = products.filter((p) => url.searchParams.get("is_product_of_month") !== "eq.true" || p.is_product_of_month);
    if (url.searchParams.has("blueprint_id")) data = data.filter((p) => url.searchParams.get("blueprint_id") === `eq.${p.blueprint_id}`);
    if (req.headers.accept?.includes("vnd.pgrst.object")) data = data[0];
  } else if (url.pathname === "/rest/v1/product_variants") data = [{ color: "White", size: "M", price_cents: 1000, is_available: true, printify_variant_id: 101 }];
  else if (url.pathname === "/rest/v1/carts") data = req.headers.accept?.includes("vnd.pgrst.object") ? cart : [cart];
  else if (url.pathname === "/rest/v1/cart_items") {
    const id = url.searchParams.get("id")?.replace("eq.", "");
    if (req.method === "PATCH") cart.cart_items.forEach((item) => { if (!id || id === item.id) Object.assign(item, payload); });
    data = cart.cart_items;
  } else if (url.pathname === "/functions/v1/checkout-quote") {
    const items = payload.line_items.map((line) => {
      const product = products.find((p) => p.blueprint_id === line.blueprint_id ||
        (line.product_id === "launchtee" ? p.blueprint_id === 6 : p.blueprint_id === 68));
      return { blueprintId: product.blueprint_id, variantId: line.variant_id, quantity: line.quantity,
        productId: line.product_id, unitPriceCents: product.promotional_price ?? product.selling_price_cents,
        regularPriceCents: product.selling_price_cents };
    });
    const subtotalCents = items.reduce((sum, p) => sum + p.unitPriceCents * p.quantity, 0);
    const discountCents = payload.promo_code ? Math.round(subtotalCents * .1) : 0;
    const shippingCents = subtotalCents - discountCents >= 6000 ? 0 : 499;
    data = { items, subtotalCents, discountCents, shippingCents, totalCents: subtotalCents - discountCents + shippingCents, promoCode: payload.promo_code ?? null };
  } else if (url.pathname.includes("payment") || url.pathname.includes("paypal")) {
    res.writeHead(400); res.end(JSON.stringify({ error: "FIXTURE_PAYMENT_DISABLED" })); return;
  }
  res.end(JSON.stringify(data));
}).listen(55432, "127.0.0.1", () => console.log("Promotion fixtures listening on 55432"));
