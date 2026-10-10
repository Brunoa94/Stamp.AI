import { describe, expect, it } from "vitest";
import { getOrderImageSrc } from "./orderImage";

describe("getOrderImageSrc", () => {
  it("uses supported image sources", () => {
    expect(getOrderImageSrc("/images/order.png")).toBe("/images/order.png");
    expect(getOrderImageSrc("https://images.printify.com/order.png")).toBe(
      "https://images.printify.com/order.png",
    );
    expect(getOrderImageSrc("https://project.supabase.co/storage/v1/order.png")).toBe(
      "https://project.supabase.co/storage/v1/order.png",
    );
  });

  it("falls back for unsupported or unsafe sources", () => {
    expect(getOrderImageSrc("https://example.com/test.jpg")).toBeNull();
    expect(getOrderImageSrc("//example.com/test.jpg")).toBeNull();
    expect(getOrderImageSrc("javascript:alert(1)")).toBeNull();
  });
});
