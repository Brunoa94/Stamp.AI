import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useStampFlowStore } from "../../stores/stampFlowStore";
import { useDesignAdjustment } from "../useDesignAdjustment";

/**
 * Selection-mode behavior of the design adjustment hook:
 * - apparel picks exactly one side (front OR back) — "single" mode;
 * - socks keep both legs enabled — "multiple" mode;
 * - selecting a side drives the preview (activeEditPosition) with it.
 */

function seedApparel(blueprintId = 6) {
  useStampFlowStore.setState({ blueprintId });
  return renderHook(() => useDesignAdjustment());
}

describe("useDesignAdjustment selection mode", () => {
  beforeEach(() => {
    useStampFlowStore.getState().reset();
  });

  it("uses single-select for apparel", async () => {
    const { result } = seedApparel(6);

    await waitFor(() => {
      expect(result.current.availablePrintPositions).toContain("back");
    });
    expect(result.current.positionSelectionMode).toBe("single");
  });

  it("uses multi-select for socks", async () => {
    useStampFlowStore.setState({ blueprintId: 496 });
    const { result } = renderHook(() => useDesignAdjustment());

    await waitFor(() => {
      expect(result.current.availablePrintPositions).toEqual([
        "left_leg",
        "right_leg",
      ]);
    });
    expect(result.current.positionSelectionMode).toBe("multiple");
    // Both legs stay enabled — single-select must not regress this.
    expect(result.current.enabledPositions).toEqual(["left_leg", "right_leg"]);
  });

  it("selecting back enables only back and previews it", async () => {
    const { result } = seedApparel(6);
    await waitFor(() => {
      expect(result.current.availablePrintPositions).toContain("back");
    });

    act(() => {
      result.current.selectPrintPosition("back");
    });

    await waitFor(() => {
      expect(result.current.enabledPositions).toEqual(["back"]);
    });
    expect(result.current.activeEditPosition).toBe("back");
    expect(result.current.activeConfig?.position).toBe("back");
  });

  it("switching back to front preserves each side's placement", async () => {
    const { result } = seedApparel(6);
    await waitFor(() => {
      expect(result.current.availablePrintPositions).toContain("back");
    });

    act(() => {
      result.current.updateActivePlacement({ x: 0.3 });
      result.current.selectPrintPosition("back");
    });
    act(() => {
      result.current.updateActivePlacement({ x: 0.7 });
      result.current.selectPrintPosition("front");
    });

    await waitFor(() => {
      expect(result.current.activeEditPosition).toBe("front");
    });
    expect(result.current.printPositionConfigs.front.placement.x).toBe(0.3);
    expect(result.current.printPositionConfigs.back.placement.x).toBe(0.7);
    expect(result.current.enabledPositions).toEqual(["front"]);
  });

  it("seeds apparel with the product anchor and only front enabled", async () => {
    const { result } = seedApparel(77); // Gildan hoodie, anchorY 0.42
    await waitFor(() => {
      expect(result.current.availablePrintPositions).toContain("back");
    });

    expect(result.current.enabledPositions).toEqual(["front"]);
    expect(result.current.printPositionConfigs.back.placement).toEqual({
      x: 0.5,
      y: 0.42,
      scale: 1,
      angle: 0,
    });
  });
});
