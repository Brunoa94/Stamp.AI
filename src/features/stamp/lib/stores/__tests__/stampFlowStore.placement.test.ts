import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_PLACEMENT, useStampFlowStore } from "../stampFlowStore";

/**
 * Print position / placement state tests (Step 6 design adjustment).
 */

const TSHIRT_POSITIONS = ["front", "back", "neck"];
const TSHIRT_DEFAULT = { x: 0.5, y: 0.45, scale: 1, angle: 0 };

describe("stampFlowStore placement state", () => {
  beforeEach(() => {
    useStampFlowStore.getState().reset();
  });

  it("starts with no positions and a centered default placement", () => {
    const state = useStampFlowStore.getState();
    expect(state.availablePrintPositions).toEqual([]);
    expect(state.printPositionConfigs).toEqual({});
    expect(state.activeEditPosition).toBe("front");
    expect(state.defaultPlacement).toEqual(DEFAULT_PLACEMENT);
  });

  it("initializePrintPositions seeds configs with only the first position enabled", () => {
    useStampFlowStore
      .getState()
      .initializePrintPositions(TSHIRT_POSITIONS, TSHIRT_DEFAULT);

    const state = useStampFlowStore.getState();
    expect(state.availablePrintPositions).toEqual(TSHIRT_POSITIONS);
    expect(state.activeEditPosition).toBe("front");
    expect(state.defaultPlacement).toEqual(TSHIRT_DEFAULT);
    expect(state.printPositionConfigs.front.enabled).toBe(true);
    expect(state.printPositionConfigs.back.enabled).toBe(false);
    expect(state.printPositionConfigs.neck.enabled).toBe(false);
    expect(state.printPositionConfigs.back.placement).toEqual(TSHIRT_DEFAULT);
  });

  it("setPrintPositionConfig merges partial placement updates", () => {
    const store = useStampFlowStore.getState();
    store.initializePrintPositions(TSHIRT_POSITIONS, TSHIRT_DEFAULT);

    store.setPrintPositionConfig("front", { placement: { x: 0.3 } });

    const front = useStampFlowStore.getState().printPositionConfigs.front;
    expect(front.placement.x).toBe(0.3);
    // Untouched fields keep their values
    expect(front.placement.y).toBe(0.45);
    expect(front.placement.scale).toBe(1);
    expect(front.enabled).toBe(true);
  });

  it("setPrintPositionConfig ignores unknown positions", () => {
    const store = useStampFlowStore.getState();
    store.initializePrintPositions(TSHIRT_POSITIONS, TSHIRT_DEFAULT);

    store.setPrintPositionConfig("left_sleeve", { placement: { x: 0.1 } });

    expect(
      useStampFlowStore.getState().printPositionConfigs.left_sleeve,
    ).toBeUndefined();
  });

  it("togglePrintPosition enables and disables a position", () => {
    const store = useStampFlowStore.getState();
    store.initializePrintPositions(TSHIRT_POSITIONS, TSHIRT_DEFAULT);

    store.togglePrintPosition("back");
    expect(useStampFlowStore.getState().printPositionConfigs.back.enabled).toBe(
      true,
    );

    store.togglePrintPosition("back");
    expect(useStampFlowStore.getState().printPositionConfigs.back.enabled).toBe(
      false,
    );
  });

  it("resetPlacementForPosition restores the seeded default", () => {
    const store = useStampFlowStore.getState();
    store.initializePrintPositions(TSHIRT_POSITIONS, TSHIRT_DEFAULT);

    store.setPrintPositionConfig("front", {
      placement: { x: 0.2, y: 0.8, scale: 0.5, angle: 90 },
    });
    expect(
      useStampFlowStore.getState().printPositionConfigs.front.placement,
    ).toEqual({ x: 0.2, y: 0.8, scale: 0.5, angle: 90 });

    store.resetPlacementForPosition("front");
    expect(
      useStampFlowStore.getState().printPositionConfigs.front.placement,
    ).toEqual(TSHIRT_DEFAULT);
  });

  it("keeps positions independent of each other", () => {
    const store = useStampFlowStore.getState();
    store.initializePrintPositions(TSHIRT_POSITIONS, TSHIRT_DEFAULT);
    store.togglePrintPosition("back");

    store.setPrintPositionConfig("front", { placement: { x: 0.2 } });
    store.setPrintPositionConfig("back", { placement: { x: 0.9 } });

    const configs = useStampFlowStore.getState().printPositionConfigs;
    expect(configs.front.placement.x).toBe(0.2);
    expect(configs.back.placement.x).toBe(0.9);
    expect(configs.neck.placement.x).toBe(0.5);
  });

  it("setActiveEditPosition switches the position being edited", () => {
    const store = useStampFlowStore.getState();
    store.initializePrintPositions(TSHIRT_POSITIONS, TSHIRT_DEFAULT);

    store.setActiveEditPosition("back");
    expect(useStampFlowStore.getState().activeEditPosition).toBe("back");
  });

  it("reset clears placement state back to initial", () => {
    const store = useStampFlowStore.getState();
    store.initializePrintPositions(TSHIRT_POSITIONS, TSHIRT_DEFAULT);
    store.togglePrintPosition("back");

    store.reset();

    const state = useStampFlowStore.getState();
    expect(state.availablePrintPositions).toEqual([]);
    expect(state.printPositionConfigs).toEqual({});
    expect(state.defaultPlacement).toEqual(DEFAULT_PLACEMENT);
  });
});

describe("stampFlowStore socks seeding options", () => {
  beforeEach(() => {
    useStampFlowStore.getState().reset();
  });

  const SOCK_POSITIONS = ["left_leg", "right_leg"];
  const CENTERED = { x: 0.5, y: 0.35, scale: 0.45, angle: 0 };

  it("enableAll enables every position", () => {
    useStampFlowStore
      .getState()
      .initializePrintPositions(SOCK_POSITIONS, CENTERED, { enableAll: true });

    const configs = useStampFlowStore.getState().printPositionConfigs;
    expect(configs.left_leg.enabled).toBe(true);
    expect(configs.right_leg.enabled).toBe(true);
    expect(configs.left_leg.placement).toEqual(CENTERED);
    expect(configs.right_leg.placement).toEqual(CENTERED);
  });

  it("without options keeps the original behavior (first enabled)", () => {
    useStampFlowStore
      .getState()
      .initializePrintPositions(SOCK_POSITIONS, CENTERED);

    const configs = useStampFlowStore.getState().printPositionConfigs;
    expect(configs.left_leg.enabled).toBe(true);
    expect(configs.right_leg.enabled).toBe(false);
  });
});
