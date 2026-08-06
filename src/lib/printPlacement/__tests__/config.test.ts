import { describe, expect, it } from "vitest";
import { detectCategoryFromTitle, getProductConfig } from "../config";

/**
 * Product config resolution — covers the socks path (blueprint 462 and
 * title-based detection for unknown blueprints) that feeds the Step 6
 * design adjustment panel and the create-product payload.
 */

describe("getProductConfig", () => {
  it("returns the socks config for blueprint 462 with leg positions", () => {
    const config = getProductConfig(462);
    expect(config.category).toBe("socks");
    expect(config.positions).toEqual(["left_leg", "right_leg"]);
    expect(config.defaultPosition).toBe("left_leg");
    expect(config.disablePlacementAdjustment).toBe(true);
    // The client must never seed a "front" position for socks
    expect(config.positions).not.toContain("front");
  });

  it("returns known apparel config unchanged", () => {
    const config = getProductConfig(6);
    expect(config.category).toBe("apparel");
    expect(config.positions).toContain("front");
    expect(config.positions).toContain("left_sleeve");
  });

  it("falls back to front-only apparel for unknown blueprints without a title", () => {
    const config = getProductConfig(999999);
    expect(config.category).toBe("apparel");
    expect(config.positions).toEqual(["front"]);
    expect(config.disablePlacementAdjustment).toBeFalsy();
  });

  it("detects socks from the display title for unknown blueprints", () => {
    const config = getProductConfig(999999, "Comfy Ankle Socks");
    expect(config.category).toBe("socks");
    expect(config.disablePlacementAdjustment).toBe(true);
  });

  it("detects mugs from the display title and disables placement", () => {
    const config = getProductConfig(999999, "Ceramic Coffee Mug 11oz");
    expect(config.category).toBe("mug");
    expect(config.disablePlacementAdjustment).toBe(true);
  });
});

describe("detectCategoryFromTitle", () => {
  it.each([
    ["Cushioned Crew Socks", "socks"],
    ["Accent Coffee Mug", "mug"],
    ["Stainless Tumbler", "mug"],
    ["Cotton Tote", "tote"],
    ["Matte Poster 24x36", "poster"],
    ["Throw Pillow", "pillow"],
    ["Gallery Wrap Canvas", "canvas"],
    ["Unisex Heavy Cotton Tee", "apparel"],
    ["Zip Hoodie", "apparel"],
  ])("classifies %s as %s", (title, category) => {
    expect(detectCategoryFromTitle(title)).toBe(category);
  });
});

describe("sock leg placement", () => {
  it("blueprint 496 (Crew Socks) resolves to socks with leg positions", async () => {
    const { getProductConfig } = await import("../config");
    const config = getProductConfig(496);
    expect(config.category).toBe("socks");
    expect(config.positions).toEqual(["left_leg", "right_leg"]);
    expect(config.disablePlacementAdjustment).toBe(true);
  });

  it("centers the design on each leg (pixel-calibrated per-leg x)", async () => {
    const { SOCK_LEG_PLACEMENTS, sockLegPlacement } = await import("../config");
    // Left leg print area is offset on the fabric; x compensates for it
    expect(SOCK_LEG_PLACEMENTS.left_leg).toEqual({ x: 0.58, y: 0.35, scale: 0.6, angle: 0 });
    expect(SOCK_LEG_PLACEMENTS.right_leg).toEqual({ x: 0.5, y: 0.35, scale: 0.6, angle: 0 });
    expect(sockLegPlacement("left_leg")).toEqual(SOCK_LEG_PLACEMENTS.left_leg);
    expect(sockLegPlacement("right_leg")).toEqual(SOCK_LEG_PLACEMENTS.right_leg);
    // Returns a copy, not the shared object
    const placement = sockLegPlacement("left_leg");
    placement.x = 0;
    expect(SOCK_LEG_PLACEMENTS.left_leg.x).toBe(0.58);
  });
});
