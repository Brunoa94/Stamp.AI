import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStampFlowStore } from "../../stores/stampFlowStore";
import { useCustomizationHandlers } from "../useCustomizationHandlers";
import { sockLegPlacement } from "@/lib/printPlacement/config";

/**
 * Regression suite for the create-product payload per product category:
 * - mugs (autoPlacement) must NOT send print positions — the server fits the
 *   image to the wrap area (a client scale of 1 printed far too big);
 * - socks must send their calibrated per-leg placements;
 * - apparel sends whatever the user adjusted in the store.
 */

function renderHandler(blueprintId: number) {
  const createProduct = vi.fn().mockResolvedValue(undefined);
  const { result } = renderHook(() =>
    useCustomizationHandlers({
      blueprintId,
      printProviderId: 99,
      selectedColor: "White",
      effectiveSelectedSize: "M",
      createProduct,
    }),
  );
  return { handleCreateProduct: result.current.handleCreateProduct, createProduct };
}

describe("useCustomizationHandlers payload", () => {
  beforeEach(() => {
    useStampFlowStore.getState().reset();
  });

  it("mug: omits print positions so the server auto-fits (regression)", async () => {
    useStampFlowStore.setState({ blueprintId: 1320 });
    // Simulate the panel having seeded the store with the generic default
    useStampFlowStore
      .getState()
      .initializePrintPositions(["front"], { x: 0.5, y: 0.5, scale: 1, angle: 0 }, {
        blueprintId: 1320,
      });

    const { handleCreateProduct, createProduct } = renderHandler(1320);
    await handleCreateProduct();

    expect(createProduct).toHaveBeenCalledTimes(1);
    const payload = createProduct.mock.calls[0][0];
    expect(payload.printPositions).toBeUndefined();
    expect(payload.scale).toBeUndefined();
  });

  it("socks: sends both legs with the calibrated presets", async () => {
    useStampFlowStore.setState({ blueprintId: 496 });
    useStampFlowStore.getState().initializePrintPositions(
      ["left_leg", "right_leg"],
      sockLegPlacement("left_leg"),
      {
        blueprintId: 496,
        enableAll: true,
        placements: {
          left_leg: sockLegPlacement("left_leg"),
          right_leg: sockLegPlacement("right_leg"),
        },
      },
    );

    const { handleCreateProduct, createProduct } = renderHandler(496);
    await handleCreateProduct();

    const payload = createProduct.mock.calls[0][0];
    expect(payload.printPositions).toEqual([
      { position: "left_leg", placement: sockLegPlacement("left_leg") },
      { position: "right_leg", placement: sockLegPlacement("right_leg") },
    ]);
  });

  it("apparel: sends the user's adjusted placement from the store", async () => {
    useStampFlowStore.setState({ blueprintId: 6 });
    const store = useStampFlowStore.getState();
    store.initializePrintPositions(
      ["front", "back", "neck", "left_sleeve", "right_sleeve"],
      { x: 0.5, y: 0.45, scale: 1, angle: 0 },
      { blueprintId: 6 },
    );
    store.setPrintPositionConfig("front", {
      placement: { x: 0.4, y: 0.3, scale: 0.8, angle: 0 },
    });

    const { handleCreateProduct, createProduct } = renderHandler(6);
    await handleCreateProduct();

    const payload = createProduct.mock.calls[0][0];
    expect(payload.printPositions).toEqual([
      { position: "front", placement: { x: 0.4, y: 0.3, scale: 0.8, angle: 0 } },
    ]);
    expect(payload.scale).toBe(0.8);
  });
});
