import { describe, expect, it } from "vitest";
import { itemListSchema } from "../itemList";
import type { ProductData } from "../types";

const PRODUCTS: ProductData[] = [
  {
    name: "Unisex Heavy Cotton Tee",
    description: "A heavyweight classic tee.",
    image: "https://images.printify.com/1.jpg",
    price: 20,
    priceCurrency: "EUR",
    availability: "InStock",
    url: "https://example.com/catalog",
  },
  {
    name: "Ceramic Mug",
    description: "An 11oz ceramic mug.",
    image: "https://images.printify.com/2.jpg",
  },
];

describe("itemListSchema", () => {
  it("builds an ItemList with one ListItem per product", () => {
    const schema = itemListSchema("Product Catalog", PRODUCTS);

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("ItemList");
    expect(schema.name).toBe("Product Catalog");
    expect(schema.numberOfItems).toBe(2);
    expect(schema.itemListElement).toHaveLength(2);
  });

  it("numbers positions from 1 in product order", () => {
    const schema = itemListSchema("Product Catalog", PRODUCTS);

    expect(schema.itemListElement.map((e) => e.position)).toEqual([1, 2]);
    expect(schema.itemListElement[0].item.name).toBe(
      "Unisex Heavy Cotton Tee"
    );
  });

  it("embeds Product items without a nested @context", () => {
    const schema = itemListSchema("Product Catalog", PRODUCTS);
    const [first] = schema.itemListElement;

    expect(first["@type"]).toBe("ListItem");
    expect(first.item["@type"]).toBe("Product");
    expect(first.item).not.toHaveProperty("@context");
  });
});
