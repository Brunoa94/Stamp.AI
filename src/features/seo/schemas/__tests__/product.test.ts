import { describe, it, expect } from "vitest";
import { productSchema } from "../product";
import type { ProductData } from "../types";

/** Structural view of the schema output for assertions */
interface ProductSchemaShapeI {
  offers?: {
    "@type"?: string;
    price?: number;
    priceCurrency?: string;
    availability?: string;
    url?: string;
    shippingDetails?: { shippingRate?: { currency?: string } };
  };
  brand?: { "@type"?: string; name?: string };
  [key: string]: unknown;
}

function buildSchema(product: ProductData): ProductSchemaShapeI {
  return productSchema(product) as unknown as ProductSchemaShapeI;
}

const baseProduct: ProductData = {
  name: "Unisex Softstyle T-Shirt",
  description: "Soft unisex tee with custom AI-generated print",
  image: "https://images.printify.com/tshirt.jpg",
};

describe("productSchema", () => {
  it("builds a schema.org Product with name, description and image", () => {
    const schema = productSchema(baseProduct);

    expect(schema).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Unisex Softstyle T-Shirt",
      description: "Soft unisex tee with custom AI-generated print",
      image: "https://images.printify.com/tshirt.jpg",
    });
  });

  it("omits offers when no price is provided", () => {
    const schema = buildSchema(baseProduct);

    expect(schema.offers).toBeUndefined();
  });

  it("includes an offer with the given price and currency", () => {
    const schema = buildSchema({
      ...baseProduct,
      price: 20,
      priceCurrency: "EUR",
      url: "https://example.com/stamp",
    });

    expect(schema.offers).toMatchObject({
      "@type": "Offer",
      price: 20,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: "https://example.com/stamp",
    });
  });

  it("uses the offer currency for shipping details", () => {
    const schema = buildSchema({
      ...baseProduct,
      price: 20,
      priceCurrency: "EUR",
    });

    expect(schema.offers?.shippingDetails?.shippingRate?.currency).toBe("EUR");
  });

  it("defaults currency to USD and availability to InStock", () => {
    const schema = buildSchema({ ...baseProduct, price: 15 });

    expect(schema.offers?.priceCurrency).toBe("USD");
    expect(schema.offers?.shippingDetails?.shippingRate?.currency).toBe("USD");
    expect(schema.offers?.availability).toBe("https://schema.org/InStock");
  });

  it("maps explicit availability values", () => {
    const schema = buildSchema({
      ...baseProduct,
      price: 15,
      availability: "OutOfStock",
    });

    expect(schema.offers?.availability).toBe("https://schema.org/OutOfStock");
  });

  it("defaults brand to the site name and allows overrides", () => {
    const defaulted = buildSchema(baseProduct);
    const overridden = buildSchema({ ...baseProduct, brand: "Acme" });

    expect(defaulted.brand?.["@type"]).toBe("Brand");
    expect(typeof defaulted.brand?.name).toBe("string");
    expect(defaulted.brand?.name?.length).toBeGreaterThan(0);
    expect(overridden.brand?.name).toBe("Acme");
  });
});
