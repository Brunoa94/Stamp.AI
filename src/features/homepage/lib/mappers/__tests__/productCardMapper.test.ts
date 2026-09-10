import { describe, it, expect } from "vitest";
import { mapProductsToCards } from "../productCardMapper";
import type { ProductWithPricing } from "@/lib/supabase/server-cache";
import type { ProductSeo } from "@/types/catalog";

function buildSeo(overrides: Partial<ProductSeo> = {}): ProductSeo {
  return {
    blueprint_id: 145,
    printify_description: "<p>Soft unisex tee</p>",
    meta_title: null,
    meta_description: null,
    meta_keywords: null,
    created_at: "2026-08-13T00:00:00Z",
    updated_at: "2026-08-13T00:00:00Z",
    ...overrides,
  };
}

function buildProduct(
  overrides: Partial<ProductWithPricing> = {}
): ProductWithPricing {
  return {
    blueprint_id: 145,
    display_title: "Unisex Softstyle T-Shirt",
    base_image_url: "https://images.printify.com/tshirt.jpg",
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
    created_at: "2026-08-13T00:00:00Z",
    updated_at: "2026-08-13T00:00:00Z",
    product_seo: buildSeo(),
    totalPriceCents: 2000,
    availableColors: ["Black", "White"],
    ...overrides,
  };
}

describe("mapProductsToCards", () => {
  it("maps core product fields to card data", () => {
    const [card] = mapProductsToCards([buildProduct()]);

    expect(card).toMatchObject({
      blueprintId: 145,
      name: "Unisex Softstyle T-Shirt",
      price: 20,
      originalPrice: undefined,
      isOnSale: false,
      discountPercent: undefined,
      imageUrl: "https://images.printify.com/tshirt.jpg",
      href: "/stamp",
      availableColors: ["Black", "White"],
    });
  });

  it("maps the SEO description as plain text", () => {
    const [card] = mapProductsToCards([buildProduct()]);

    expect(card.description).toBe("Soft unisex tee");
  });

  it("prefers meta_description over printify_description", () => {
    const [card] = mapProductsToCards([
      buildProduct({
        product_seo: buildSeo({
          meta_description: "Hand-finished premium tee",
          printify_description: "<p>Printify text</p>",
        }),
      }),
    ]);

    expect(card.description).toBe("Hand-finished premium tee");
  });

  it("returns null description when product has no SEO row", () => {
    const [card] = mapProductsToCards([buildProduct({ product_seo: null })]);

    expect(card.description).toBeNull();
  });

  it("uses selling price override when set", () => {
    const [card] = mapProductsToCards([
      buildProduct({ selling_price_cents: 1799 }),
    ]);

    expect(card.price).toBe(17.99);
  });

  it("maps sale fields when the product is on sale", () => {
    const [card] = mapProductsToCards([
      buildProduct({
        is_on_sale: true,
        original_price_cents: 2500,
        discount_percent: 20,
      }),
    ]);

    expect(card.isOnSale).toBe(true);
    expect(card.originalPrice).toBe(25);
    expect(card.discountPercent).toBe(20);
  });

  it("falls back to empty image URL when base image is missing", () => {
    const [card] = mapProductsToCards([buildProduct({ base_image_url: null })]);

    expect(card.imageUrl).toBe("");
  });
});
