import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { PlacementPreview } from "../PlacementPreview";

const SAFE_ZONE = { top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 };
const PLACEMENT = { x: 0.5, y: 0.45, scale: 0.8, angle: 90 };
const IMAGE_URL = "https://images.unsplash.com/test-design.png";

describe("PlacementPreview", () => {
  it("positions and transforms the design per the placement", () => {
    renderWithIntl(
      <PlacementPreview
        imageUrl={IMAGE_URL}
        placement={PLACEMENT}
        productCategory="apparel"
        position="front"
        safeZone={SAFE_ZONE}
      />,
    );

    const overlay = screen.getByTestId("design-overlay");
    expect(overlay.style.left).toBe("50%");
    expect(overlay.style.top).toBe("45%");
    expect(overlay.style.width).toBe("80%");
    expect(overlay.style.transform).toContain("rotate(90deg)");
  });

  it("renders the safe-zone inset from the product config", () => {
    renderWithIntl(
      <PlacementPreview
        imageUrl={IMAGE_URL}
        placement={PLACEMENT}
        productCategory="apparel"
        position="front"
        safeZone={SAFE_ZONE}
      />,
    );

    const safeZone = screen.getByTestId("safe-zone");
    expect(safeZone.style.top).toBe("5%");
    expect(safeZone.style.left).toBe("3%");
  });

  it("skips the design overlay when no image is given", () => {
    renderWithIntl(
      <PlacementPreview
        imageUrl=""
        placement={PLACEMENT}
        productCategory="apparel"
        position="front"
        safeZone={SAFE_ZONE}
      />,
    );

    expect(screen.queryByTestId("design-overlay")).not.toBeInTheDocument();
  });

  it("renders for every supported position", () => {
    for (const position of ["front", "back", "neck", "left_sleeve", "right_sleeve"]) {
      const { unmount } = renderWithIntl(
        <PlacementPreview
          imageUrl={IMAGE_URL}
          placement={PLACEMENT}
          productCategory="apparel"
          position={position}
          safeZone={SAFE_ZONE}
        />,
      );
      expect(screen.getByTestId("print-area")).toBeInTheDocument();
      unmount();
    }
  });

  it("renders the tote silhouette without crashing", () => {
    renderWithIntl(
      <PlacementPreview
        imageUrl={IMAGE_URL}
        placement={PLACEMENT}
        productCategory="tote"
        position="front"
        safeZone={SAFE_ZONE}
      />,
    );
    expect(screen.getByTestId("placement-preview")).toBeInTheDocument();
  });
});
