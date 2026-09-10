import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { PrintPositionSelector } from "../PrintPositionSelector";
import type { PrintPositionConfigType } from "../../../../lib/types/stampFlowTypes";

const PLACEMENT = { x: 0.5, y: 0.45, scale: 1, angle: 0 };

function makeConfigs(
  overrides: Partial<Record<string, Partial<PrintPositionConfigType>>> = {},
): Record<string, PrintPositionConfigType> {
  const base: Record<string, PrintPositionConfigType> = {
    front: { position: "front", enabled: true, placement: PLACEMENT, additionalCost: 0 },
    back: { position: "back", enabled: false, placement: PLACEMENT, additionalCost: 0 },
    neck: { position: "neck", enabled: false, placement: PLACEMENT, additionalCost: 250 },
  };
  for (const [position, override] of Object.entries(overrides)) {
    base[position] = { ...base[position], ...override };
  }
  return base;
}

describe("PrintPositionSelector", () => {
  it("renders a card per available position", () => {
    renderWithIntl(
      <PrintPositionSelector
        availablePositions={["front", "back", "neck"]}
        printPositionConfigs={makeConfigs()}
        onTogglePosition={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /front/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /neck/i })).toBeInTheDocument();
  });

  it("renders nothing when there are no positions", () => {
    const { container } = renderWithIntl(
      <PrintPositionSelector
        availablePositions={[]}
        printPositionConfigs={{}}
        onTogglePosition={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("marks enabled positions as pressed", () => {
    renderWithIntl(
      <PrintPositionSelector
        availablePositions={["front", "back"]}
        printPositionConfigs={makeConfigs()}
        onTogglePosition={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /front/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /back/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onTogglePosition with the clicked position", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithIntl(
      <PrintPositionSelector
        availablePositions={["front", "back"]}
        printPositionConfigs={makeConfigs()}
        onTogglePosition={onToggle}
      />,
    );

    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(onToggle).toHaveBeenCalledWith("back");
  });

  it("shows the extra cost when a position costs more", () => {
    renderWithIntl(
      <PrintPositionSelector
        availablePositions={["front", "neck"]}
        printPositionConfigs={makeConfigs()}
        onTogglePosition={() => {}}
      />,
    );

    expect(screen.getByText("+€2.50")).toBeInTheDocument();
  });

  it("disables all cards when disabled", () => {
    renderWithIntl(
      <PrintPositionSelector
        availablePositions={["front", "back"]}
        printPositionConfigs={makeConfigs()}
        onTogglePosition={() => {}}
        disabled
      />,
    );

    expect(screen.getByRole("button", { name: /front/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();
  });
});

describe("PrintPositionSelector single-select mode", () => {
  it("renders a radio group with one radio per position", () => {
    renderWithIntl(
      <PrintPositionSelector
        availablePositions={["front", "back"]}
        printPositionConfigs={makeConfigs()}
        onTogglePosition={() => {}}
        selectionMode="single"
      />,
    );

    expect(
      screen.getByRole("radiogroup", { name: /print position/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("marks only the enabled position as checked", () => {
    renderWithIntl(
      <PrintPositionSelector
        availablePositions={["front", "back"]}
        printPositionConfigs={makeConfigs()}
        onTogglePosition={() => {}}
        selectionMode="single"
      />,
    );

    expect(
      screen.getByRole("radio", { name: /print on front/i }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", { name: /print on back/i }),
    ).not.toBeChecked();
  });

  it("reports the clicked position", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithIntl(
      <PrintPositionSelector
        availablePositions={["front", "back"]}
        printPositionConfigs={makeConfigs()}
        onTogglePosition={onSelect}
        selectionMode="single"
      />,
    );

    await user.click(screen.getByRole("radio", { name: /print on back/i }));
    expect(onSelect).toHaveBeenCalledWith("back");
  });

  it("shows the single-choice help copy", () => {
    renderWithIntl(
      <PrintPositionSelector
        availablePositions={["front", "back"]}
        printPositionConfigs={makeConfigs()}
        onTogglePosition={() => {}}
        selectionMode="single"
      />,
    );

    expect(
      screen.getByText(/pick which side your design gets printed on/i),
    ).toBeInTheDocument();
  });
});
