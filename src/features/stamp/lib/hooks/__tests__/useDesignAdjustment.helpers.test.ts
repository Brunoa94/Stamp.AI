import { describe, expect, it } from "vitest";
import {
  boundsFromSafeZone,
  buildPrintPositionsPayload,
  clampPlacement,
  isAtBounds,
  MAX_SCALE,
} from "../useDesignAdjustment";
import type { PrintPositionConfigType } from "../../types/stampFlowTypes";

const TSHIRT_SAFE_ZONE = { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 };

describe("boundsFromSafeZone", () => {
  it("converts safe-zone margins into center bounds", () => {
    const bounds = boundsFromSafeZone(TSHIRT_SAFE_ZONE);
    expect(bounds).toEqual({
      minX: 0.03,
      maxX: 0.97,
      minY: 0.05,
      maxY: 0.97,
      minScale: 0.1,
      maxScale: MAX_SCALE,
    });
  });
});

describe("clampPlacement", () => {
  const bounds = boundsFromSafeZone(TSHIRT_SAFE_ZONE);

  it("keeps in-range values untouched", () => {
    const placement = { x: 0.5, y: 0.45, scale: 1, angle: 90 };
    expect(clampPlacement(placement, bounds)).toEqual(placement);
  });

  it("clamps x/y to the safe zone", () => {
    expect(clampPlacement({ x: -0.2, y: 1.4, scale: 1, angle: 0 }, bounds)).toEqual({
      x: 0.03,
      y: 0.97,
      scale: 1,
      angle: 0,
    });
  });

  it("clamps scale between min and max", () => {
    expect(
      clampPlacement({ x: 0.5, y: 0.5, scale: 0.01, angle: 0 }, bounds).scale,
    ).toBe(0.1);
    expect(
      clampPlacement({ x: 0.5, y: 0.5, scale: 9, angle: 0 }, bounds).scale,
    ).toBe(MAX_SCALE);
  });

  it("normalizes angle into 0-359", () => {
    expect(clampPlacement({ x: 0.5, y: 0.5, scale: 1, angle: 450 }, bounds).angle).toBe(90);
    expect(clampPlacement({ x: 0.5, y: 0.5, scale: 1, angle: -90 }, bounds).angle).toBe(270);
  });
});

describe("isAtBounds", () => {
  const bounds = boundsFromSafeZone(TSHIRT_SAFE_ZONE);

  it("is false in the middle of the safe zone", () => {
    expect(isAtBounds({ x: 0.5, y: 0.5, scale: 1, angle: 0 }, bounds)).toBe(false);
  });

  it("is true at an edge", () => {
    expect(isAtBounds({ x: 0.03, y: 0.5, scale: 1, angle: 0 }, bounds)).toBe(true);
    expect(isAtBounds({ x: 0.5, y: 0.97, scale: 1, angle: 0 }, bounds)).toBe(true);
  });
});

describe("buildPrintPositionsPayload", () => {
  it("includes only enabled positions with their placements", () => {
    const configs: Record<string, PrintPositionConfigType> = {
      front: {
        position: "front",
        enabled: true,
        placement: { x: 0.5, y: 0.45, scale: 1, angle: 0 },
        additionalCost: 0,
      },
      back: {
        position: "back",
        enabled: false,
        placement: { x: 0.5, y: 0.45, scale: 1, angle: 0 },
        additionalCost: 0,
      },
      neck: {
        position: "neck",
        enabled: true,
        placement: { x: 0.4, y: 0.2, scale: 0.3, angle: 90 },
        additionalCost: 0,
      },
    };

    expect(buildPrintPositionsPayload(configs)).toEqual([
      { position: "front", placement: { x: 0.5, y: 0.45, scale: 1, angle: 0 } },
      { position: "neck", placement: { x: 0.4, y: 0.2, scale: 0.3, angle: 90 } },
    ]);
  });

  it("returns an empty array when nothing is enabled", () => {
    expect(buildPrintPositionsPayload({})).toEqual([]);
  });
});
