import { describe, expect, it } from "vitest";
import { mapProductsToCatalogDisplay } from "../catalogProductMapper";
import type { ProductWithPricing } from "@/lib/supabase/server-cache";

function buildProduct(
  overrides: Partial<ProductWithPricing> = {}
): ProductWithPricing {
  return {
    blueprint_id: 6,
    display_title: "Unisex Heavy Cotton Tee",
    base_image_url: "https://images.printify.com/base.jpg",
    image_urls: null,
    min_price_cents: 1500,
    shipping_cents: 500,
    is_active: true,
    print_provider_id: 99,
    selling_price_cents: null,
    original_price_cents: null,
    is_on_sale: false,
    discount_percent: null,
    is_product_of_month: false,
    last_synced_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    product_seo: null,
    totalPriceCents: 2000,
    availableColors: ["Black", "White"],
    ...overrides,
  };
}

describe("mapProductsToCatalogDisplay", () => {
  it("uses the full Printify gallery when image_urls is synced", () => {
    const [product] = mapProductsToCatalogDisplay([
      buildProduct({
        image_urls: [
          "https://images.printify.com/1.jpg",
          "https://images.printify.com/2.jpg",
        ],
      }),
    ]);

    expect(product.imageUrls).toEqual([
      "https://images.printify.com/1.jpg",
      "https://images.printify.com/2.jpg",
    ]);
  });

  it("falls back to base_image_url when the gallery is not synced", () => {
    const [product] = mapProductsToCatalogDisplay([buildProduct()]);

    expect(product.imageUrls).toEqual([
      "https://images.printify.com/base.jpg",
    ]);
  });

  it("returns an empty gallery when the product has no images at all", () => {
    const [product] = mapProductsToCatalogDisplay([
      buildProduct({ image_urls: null, base_image_url: null }),
    ]);

    expect(product.imageUrls).toEqual([]);
  });

  it("detects the category from the display title", () => {
    const [product] = mapProductsToCatalogDisplay([buildProduct()]);

    expect(product.category).toBe("tshirt");
  });

  it("prefers the selling price override over the computed total", () => {
    const [product] = mapProductsToCatalogDisplay([
      buildProduct({ selling_price_cents: 1800 }),
    ]);

    expect(product.price).toBe(18);
  });

  it("falls back to the stamp flow price when the product has no synced price", () => {
    const [product] = mapProductsToCatalogDisplay([
      buildProduct({
        selling_price_cents: null,
        min_price_cents: 0,
        totalPriceCents: 0,
      }),
    ]);

    expect(product.price).toBe(25);
  });

  it("resolves description and specs from product SEO data", () => {
    const [product] = mapProductsToCatalogDisplay([
      buildProduct({
        product_seo: {
          blueprint_id: 6,
          printify_description: "<div>.: 100% cotton</div>",
          meta_title: null,
          meta_description: "A heavyweight classic tee.",
          meta_keywords: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
        },
      }),
    ]);

    expect(product.description).toBe("A heavyweight classic tee.");
    expect(product.specs).toEqual(["100% cotton"]);
  });
});
