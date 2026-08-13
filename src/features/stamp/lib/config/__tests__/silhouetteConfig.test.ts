import { describe, expect, it } from "vitest";
import {
  SILHOUETTE_CONFIGS,
  getSilhouetteKey,
} from "../silhouetteConfig";

describe("getSilhouetteKey", () => {
  it("returns the back view for apparel back position", () => {
    expect(getSilhouetteKey("apparel", undefined, "back")).toBe("apparel-back");
  });

  it("returns the default apparel view for the front position", () => {
    expect(getSilhouetteKey("apparel", undefined, "front")).toBe("apparel");
  });

  it("falls back to the category when a position has no dedicated view", () => {
    expect(getSilhouetteKey("apparel", undefined, "neck")).toBe("apparel");
    expect(getSilhouetteKey("apparel", undefined, "left_sleeve")).toBe("apparel");
    expect(getSilhouetteKey("tote", undefined, "back")).toBe("tote");
    expect(getSilhouetteKey("mug", undefined, "back")).toBe("mug");
    expect(getSilhouetteKey("socks", undefined, "left_leg")).toBe("socks");
  });

  it("keeps canvas/poster keyed by orientation regardless of position", () => {
    expect(getSilhouetteKey("canvas", "horizontal", "back")).toBe(
      "canvas-horizontal",
    );
    expect(getSilhouetteKey("poster", undefined, "front")).toBe(
      "canvas-vertical",
    );
  });

  it("has a config for every key it can produce for apparel", () => {
    expect(SILHOUETTE_CONFIGS["apparel-back"]).toBeDefined();
    expect(SILHOUETTE_CONFIGS.apparel).toBeDefined();
  });

  it("gives the back view a different collar than the front view", () => {
    const front = SILHOUETTE_CONFIGS.apparel.paths?.map((path) => path.d);
    const back = SILHOUETTE_CONFIGS["apparel-back"].paths?.map(
      (path) => path.d,
    );
    expect(front).toBeDefined();
    expect(back).toBeDefined();
    expect(back).not.toEqual(front);
    // Both views share the same viewBox so the print area rect lines up.
    expect(SILHOUETTE_CONFIGS["apparel-back"].viewBox).toBe(
      SILHOUETTE_CONFIGS.apparel.viewBox,
    );
  });
});
