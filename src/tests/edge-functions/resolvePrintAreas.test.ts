import { describe, expect, it } from "vitest";
import { resolvePrintAreas } from "../../../supabase/functions/_shared/resolvePrintAreas";

/**
 * Regression suite for the socks IMAGE_REQUIRED bug: clients send
 * `{ front: imageId }` but some blueprints (socks) only offer
 * left_leg/right_leg — the resolver must fall back instead of
 * returning no print areas.
 */

const IMAGE_ID = "6a70d64dbce32fa63384af72";

describe("resolvePrintAreas", () => {
  describe("positions the blueprint offers", () => {
    it("keeps every valid requested position", () => {
      const result = resolvePrintAreas(
        { front: IMAGE_ID, back: "img-back" },
        undefined,
        ["front", "back", "neck"],
      );
      expect(result.areas).toEqual({ front: IMAGE_ID, back: "img-back" });
      expect(result.remappedFrom).toBeNull();
      expect(result.droppedPositions).toEqual([]);
    });

    it("drops unknown positions but keeps valid ones (no fallback needed)", () => {
      const result = resolvePrintAreas(
        { front: IMAGE_ID, waist: "img-waist" },
        undefined,
        ["front", "back"],
      );
      expect(result.areas).toEqual({ front: IMAGE_ID });
      expect(result.remappedFrom).toBeNull();
      expect(result.droppedPositions).toEqual(["waist"]);
    });

    it("skips entries with missing or non-string image ids", () => {
      const result = resolvePrintAreas(
        { front: IMAGE_ID, back: undefined, neck: 42 },
        undefined,
        ["front", "back", "neck"],
      );
      expect(result.areas).toEqual({ front: IMAGE_ID });
    });
  });

  describe("socks regression: no requested position exists on the blueprint", () => {
    it("prints the provided image on all available positions", () => {
      // Exact repro from production: front requested, socks offer legs only
      const result = resolvePrintAreas({ front: IMAGE_ID }, undefined, [
        "left_leg",
        "right_leg",
      ]);
      expect(result.areas).toEqual({
        left_leg: IMAGE_ID,
        right_leg: IMAGE_ID,
      });
      expect(result.remappedFrom).toBe("front");
      expect(result.droppedPositions).toEqual(["front"]);
    });

    it("falls back for the legacy image_id path too", () => {
      const result = resolvePrintAreas(undefined, IMAGE_ID, [
        "left_leg",
        "right_leg",
      ]);
      expect(result.areas).toEqual({
        left_leg: IMAGE_ID,
        right_leg: IMAGE_ID,
      });
      expect(result.remappedFrom).toBe("front");
    });
  });

  describe("legacy image_id", () => {
    it("maps to front when the blueprint offers it", () => {
      const result = resolvePrintAreas(undefined, IMAGE_ID, ["front", "back"]);
      expect(result.areas).toEqual({ front: IMAGE_ID });
      expect(result.remappedFrom).toBeNull();
    });
  });

  describe("genuinely empty input", () => {
    it("returns no areas when nothing was provided", () => {
      expect(resolvePrintAreas(undefined, undefined, ["front"]).areas).toEqual({});
      expect(resolvePrintAreas({}, undefined, ["front"]).areas).toEqual({});
      expect(
        resolvePrintAreas({ front: null }, undefined, ["front"]).areas,
      ).toEqual({});
    });

    it("returns no areas when the blueprint offers no positions at all", () => {
      const result = resolvePrintAreas({ front: IMAGE_ID }, undefined, []);
      expect(result.areas).toEqual({});
      expect(result.remappedFrom).toBeNull();
    });

    it("tolerates malformed print_areas payloads", () => {
      expect(resolvePrintAreas("front", undefined, ["front"]).areas).toEqual({});
      expect(resolvePrintAreas([IMAGE_ID], undefined, ["front"]).areas).toEqual({});
      expect(resolvePrintAreas(42, undefined, ["front"]).areas).toEqual({});
    });
  });
});
