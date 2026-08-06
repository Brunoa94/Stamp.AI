import { beforeEach, describe, expect, it } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { useStampFlowStore } from "../../../../lib/stores/stampFlowStore";
import { DesignAdjustmentPanel } from "../DesignAdjustmentPanel";

/**
 * Integration test: store -> useDesignAdjustment -> panel -> child components.
 * Blueprint 6 (Gildan Heavy Cotton Tee) offers front/back/neck/sleeves.
 */

const IMAGE_URL = "https://images.unsplash.com/test-design.png";

describe("DesignAdjustmentPanel", () => {
  beforeEach(() => {
    useStampFlowStore.getState().reset();
    useStampFlowStore.setState({ blueprintId: 6 });
  });

  it("seeds print positions from the product config", () => {
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    expect(
      screen.getByRole("button", { name: /toggle front print/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: /toggle back print/i }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: /toggle left sleeve print/i }),
    ).toBeInTheDocument();
  });

  it("renders nothing when no product is selected", () => {
    useStampFlowStore.getState().reset();
    const { container } = renderWithIntl(
      <DesignAdjustmentPanel imageUrl={IMAGE_URL} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("toggling a position updates the store and the card state", async () => {
    const user = userEvent.setup();
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    await user.click(screen.getByRole("button", { name: /toggle back print/i }));

    expect(
      screen.getByRole("button", { name: /toggle back print/i }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      useStampFlowStore.getState().printPositionConfigs.back.enabled,
    ).toBe(true);
  });

  it("adjusting placement updates the live preview", async () => {
    const user = userEvent.setup();
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    const before = screen.getByTestId("design-overlay").style.top;
    await user.click(screen.getByRole("button", { name: "Move up" }));
    const after = screen.getByTestId("design-overlay").style.top;

    expect(before).toBe("45%"); // t-shirt anchorY 0.45
    expect(after).toBe("35%");
  });

  it("clamps adjustments to the safe zone and shows the warning", async () => {
    const user = userEvent.setup();
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    const moveUp = screen.getByRole("button", { name: "Move up" });
    for (let i = 0; i < 10; i += 1) {
      await user.click(moveUp);
    }

    // T-shirt safe zone: top margin 0.05 -> y never goes below 0.05
    expect(
      useStampFlowStore.getState().printPositionConfigs.front.placement.y,
    ).toBeCloseTo(0.05);
    expect(screen.getByRole("status")).toHaveTextContent(/safe print area/i);
  });

  it("reset restores the default placement", async () => {
    const user = userEvent.setup();
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    await user.click(screen.getByRole("button", { name: "Move up" }));
    await user.click(screen.getByRole("button", { name: /reset placement/i }));

    expect(
      useStampFlowStore.getState().printPositionConfigs.front.placement,
    ).toEqual({ x: 0.5, y: 0.45, scale: 1, angle: 0 });
  });

  it("hides preview and placement adjuster for products with disablePlacementAdjustment", () => {
    // Use mug blueprint (1320) which has disablePlacementAdjustment: true
    useStampFlowStore.setState({ blueprintId: 1320 });
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    // Preview and placement controls should be hidden
    expect(screen.queryByTestId("placement-preview")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Move up" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Move down" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reset placement/i })).not.toBeInTheDocument();
  });

  it("shows placement adjuster for products without disablePlacementAdjustment", () => {
    // Use tshirt blueprint (6) which does not have disablePlacementAdjustment
    useStampFlowStore.setState({ blueprintId: 6 });
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    // Placement controls should be visible
    expect(screen.getByRole("button", { name: "Move up" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Move down" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reset placement/i })).toBeInTheDocument();
  });
});

describe("DesignAdjustmentPanel — socks (blueprint 496)", () => {
  beforeEach(() => {
    useStampFlowStore.getState().reset();
    useStampFlowStore.setState({ blueprintId: 496 });
  });

  it("seeds both legs enabled with the centered placement", () => {
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    const configs = useStampFlowStore.getState().printPositionConfigs;
    expect(configs.left_leg.enabled).toBe(true);
    expect(configs.right_leg.enabled).toBe(true);
    expect(configs.left_leg.placement).toEqual({ x: 0.58, y: 0.35, scale: 0.6, angle: 0 });
    expect(configs.right_leg.placement).toEqual({ x: 0.5, y: 0.35, scale: 0.6, angle: 0 });
  });

  it("hides the free-form placement controls for socks", () => {
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);
    expect(screen.queryByRole("button", { name: "Move up" })).not.toBeInTheDocument();
  });

  it("still allows toggling a leg off", async () => {
    const user = userEvent.setup();
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    await user.click(
      screen.getByRole("button", { name: /toggle right sock print/i }),
    );
    expect(
      useStampFlowStore.getState().printPositionConfigs.right_leg.enabled,
    ).toBe(false);
  });

  it("builds a payload with both legs centered", async () => {
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    const { buildPrintPositionsPayload } = await import(
      "../../../../lib/hooks/useDesignAdjustment"
    );
    const payload = buildPrintPositionsPayload(
      useStampFlowStore.getState().printPositionConfigs,
    );
    expect(payload).toEqual([
      { position: "left_leg", placement: { x: 0.58, y: 0.35, scale: 0.6, angle: 0 } },
      { position: "right_leg", placement: { x: 0.5, y: 0.35, scale: 0.6, angle: 0 } },
    ]);
  });
});

describe("DesignAdjustmentPanel — reset on product change", () => {
  beforeEach(() => {
    useStampFlowStore.getState().reset();
  });

  it("resets placement when a different product with identical positions is selected", async () => {
    // Blueprints 145 and 5 are both tees with positions [front, back, neck]
    // and the same anchor — the case a positions-based guard would miss.
    useStampFlowStore.setState({ blueprintId: 145 });
    const user = userEvent.setup();
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    await user.click(screen.getByRole("button", { name: "Move up" }));
    expect(
      useStampFlowStore.getState().printPositionConfigs.front.placement.y,
    ).toBeCloseTo(0.35);

    act(() => {
      useStampFlowStore.setState({ blueprintId: 5 });
    });

    await waitFor(() => {
      expect(
        useStampFlowStore.getState().printPositionConfigs.front.placement.y,
      ).toBeCloseTo(0.45);
    });
    expect(useStampFlowStore.getState().placementSeededBlueprintId).toBe(5);
  });

  it("keeps adjustments when Step 6 re-mounts with the same product", async () => {
    useStampFlowStore.setState({ blueprintId: 145 });
    const user = userEvent.setup();
    const { unmount } = renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    await user.click(screen.getByRole("button", { name: "Move up" }));
    unmount();

    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);
    expect(
      useStampFlowStore.getState().printPositionConfigs.front.placement.y,
    ).toBeCloseTo(0.35);
  });

  it("switching from apparel to socks reseeds sock defaults", async () => {
    useStampFlowStore.setState({ blueprintId: 6 });
    renderWithIntl(<DesignAdjustmentPanel imageUrl={IMAGE_URL} />);

    act(() => {
      useStampFlowStore.setState({ blueprintId: 496 });
    });

    await waitFor(() => {
      const configs = useStampFlowStore.getState().printPositionConfigs;
      expect(configs.left_leg?.placement).toEqual({ x: 0.58, y: 0.35, scale: 0.6, angle: 0 });
      expect(configs.right_leg?.enabled).toBe(true);
    });
  });
});
