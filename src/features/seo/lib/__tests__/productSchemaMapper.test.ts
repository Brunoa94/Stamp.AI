import { describe, it, expect } from "vitest";
import {
  mapProductToSchemaData,
  mapProductsToSchemaData,
} from "../productSchemaMapper";
import { SITE_URL } from "../../config/site";
import type { ProductWithPricing } from "@/lib/supabase/server-cache";

const FALLBACK = "Custom AI-designed products, printed on demand";

function buildProduct(
  overrides: Partial<ProductWithPricing> = {}
): ProductWithPricing {
  return {
    blueprint_id: 553,
    display_title: "Cotton Tote Bag",
    base_image_url: "https://images.printify.com/tote.jpg",
    min_price_cents: 1200,
    shipping_cents: 400,
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
    product_seo: {
      blueprint_id: 553,
      printify_description: "<p>Heavyweight cotton tote</p>",
      meta_title: null,
      meta_description: null,
      meta_keywords: null,
      created_at: "2026-08-13T00:00:00Z",
      updated_at: "2026-08-13T00:00:00Z",
    },
    totalPriceCents: 1600,
    availableColors: [],
    ...overrides,
  };
}

describe("mapProductToSchemaData", () => {
  it("maps product fields into ProductData", () => {
    const data = mapProductToSchemaData(buildProduct(), FALLBACK);

    expect(data).toEqual({
      name: "Cotton Tote Bag",
      description: "Heavyweight cotton tote",
      image: "https://images.printify.com/tote.jpg",
      price: 16,
      priceCurrency: "EUR",
      availability: "InStock",
      url: `${SITE_URL}/stamp`,
    });
  });

  it("uses the fallback description when the product has no SEO data", () => {
    const data = mapProductToSchemaData(
      buildProduct({ product_seo: null }),
      FALLBACK
    );

    expect(data.description).toBe(FALLBACK);
  });

  it("prefers the selling price override", () => {
    const data = mapProductToSchemaData(
      buildProduct({ selling_price_cents: 1999 }),
      FALLBACK
    );

    expect(data.price).toBe(19.99);
  });

  it("omits the price when it resolves to zero", () => {
    const data = mapProductToSchemaData(
      buildProduct({ selling_price_cents: null, totalPriceCents: 0 }),
      FALLBACK
    );

    expect(data.price).toBeUndefined();
  });

  it("falls back to empty image when base image is missing", () => {
    const data = mapProductToSchemaData(
      buildProduct({ base_image_url: null }),
      FALLBACK
    );

    expect(data.image).toBe("");
  });
});

describe("mapProductsToSchemaData", () => {
  it("maps every product in the list", () => {
    const products = [
      buildProduct(),
      buildProduct({ blueprint_id: 145, display_title: "T-Shirt" }),
    ];

    const data = mapProductsToSchemaData(products, FALLBACK);

    expect(data).toHaveLength(2);
    expect(data[1].name).toBe("T-Shirt");
  });
});
