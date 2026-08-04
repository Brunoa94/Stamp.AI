import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { PlacementAdjuster } from "../PlacementAdjuster";
import {
  ADJUST_STEP,
  boundsFromSafeZone,
} from "../../../../lib/hooks/useDesignAdjustment";

const BOUNDS = boundsFromSafeZone({ top: 0.05, bottom: 0.03, left: 0.03, right: 0.03 });
const PLACEMENT = { x: 0.5, y: 0.45, scale: 1, angle: 0 };

function renderAdjuster(overrides: Partial<Parameters<typeof PlacementAdjuster>[0]> = {}) {
  const props = {
    positions: ["front", "back"],
    activePosition: "front",
    placement: PLACEMENT,
    bounds: BOUNDS,
    atBounds: false,
    onPositionChange: vi.fn(),
    onPlacementChange: vi.fn(),
    onNudge: vi.fn(),
    onCenter: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  };
  renderWithIntl(<PlacementAdjuster {...props} />);
  return props;
}

describe("PlacementAdjuster", () => {
  it("nudges by 10% steps via the arrow buttons", async () => {
    const user = userEvent.setup();
    const props = renderAdjuster();

    await user.click(screen.getByRole("button", { name: "Move up" }));
    expect(props.onNudge).toHaveBeenCalledWith(0, -ADJUST_STEP);

    await user.click(screen.getByRole("button", { name: "Move down" }));
    expect(props.onNudge).toHaveBeenCalledWith(0, ADJUST_STEP);

    await user.click(screen.getByRole("button", { name: "Move left" }));
    expect(props.onNudge).toHaveBeenCalledWith(-ADJUST_STEP, 0);

    await user.click(screen.getByRole("button", { name: "Move right" }));
    expect(props.onNudge).toHaveBeenCalledWith(ADJUST_STEP, 0);
  });

  it("calls onCenter from the center button", async () => {
    const user = userEvent.setup();
    const props = renderAdjuster();

    await user.click(screen.getByRole("button", { name: "Center" }));
    expect(props.onCenter).toHaveBeenCalled();
  });

  it("sets the rotation from a preset button", async () => {
    const user = userEvent.setup();
    const props = renderAdjuster();

    await user.click(screen.getByRole("button", { name: /rotate to 90/i }));
    expect(props.onPlacementChange).toHaveBeenCalledWith({ angle: 90 });
  });

  it("marks the active rotation preset as pressed", () => {
    renderAdjuster({ placement: { ...PLACEMENT, angle: 180 } });
    expect(screen.getByRole("button", { name: /rotate to 180/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /rotate to 90/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("steps the scale from the smaller/larger buttons", async () => {
    const user = userEvent.setup();
    const props = renderAdjuster();

    await user.click(screen.getByRole("button", { name: "Larger" }));
    expect(props.onPlacementChange).toHaveBeenCalledWith({
      scale: PLACEMENT.scale + ADJUST_STEP,
    });

    await user.click(screen.getByRole("button", { name: "Smaller" }));
    expect(props.onPlacementChange).toHaveBeenCalledWith({
      scale: PLACEMENT.scale - ADJUST_STEP,
    });
  });

  it("calls onReset", async () => {
    const user = userEvent.setup();
    const props = renderAdjuster();

    await user.click(screen.getByRole("button", { name: /reset placement/i }));
    expect(props.onReset).toHaveBeenCalled();
  });

  it("offers a position picker only when several positions are enabled", () => {
    renderAdjuster({ positions: ["front"] });
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("switches the edited position via the picker", async () => {
    const user = userEvent.setup();
    const props = renderAdjuster();

    await user.selectOptions(screen.getByRole("combobox"), "back");
    expect(props.onPositionChange).toHaveBeenCalledWith("back");
  });

  it("shows the safe-zone warning only when at the bounds", () => {
    renderAdjuster({ atBounds: true });
    expect(screen.getByRole("status")).toHaveTextContent(/safe print area/i);
  });

  it("disables every control when disabled", () => {
    renderAdjuster({ disabled: true });
    screen.getAllByRole("button").forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
