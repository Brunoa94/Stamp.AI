import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { SockFaceSelector } from "../SockFaceSelector";
import type { PrintPositionConfigType } from "../../../../lib/types/stampFlowTypes";

const BACK = { x: 0.75, y: 0.35, scale: 0.45, angle: 0 };

function makeConfigs(): Record<string, PrintPositionConfigType> {
  return {
    left_leg: {
      position: "left_leg",
      enabled: true,
      placement: BACK,
      additionalCost: 0,
      face: "back",
    },
    right_leg: {
      position: "right_leg",
      enabled: true,
      placement: BACK,
      additionalCost: 0,
      face: "back",
    },
  };
}

describe("SockFaceSelector", () => {
  it("shows a front/back choice per enabled leg, defaulting to back", () => {
    renderWithIntl(
      <SockFaceSelector
        positions={["left_leg", "right_leg"]}
        printPositionConfigs={makeConfigs()}
        onFaceChange={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Print on the Back of the Left Sock" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "Print on the Front of the Left Sock" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "Print on the Back of the Right Sock" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onFaceChange with the leg and chosen face", async () => {
    const user = userEvent.setup();
    const onFaceChange = vi.fn();
    renderWithIntl(
      <SockFaceSelector
        positions={["left_leg", "right_leg"]}
        printPositionConfigs={makeConfigs()}
        onFaceChange={onFaceChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Print on the Front of the Right Sock" }),
    );
    expect(onFaceChange).toHaveBeenCalledWith("right_leg", "front");
  });

  it("hides disabled legs", () => {
    const configs = makeConfigs();
    configs.right_leg.enabled = false;
    renderWithIntl(
      <SockFaceSelector
        positions={["left_leg", "right_leg"]}
        printPositionConfigs={configs}
        onFaceChange={() => {}}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /right sock/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /back of the left sock/i }),
    ).toBeInTheDocument();
  });

  it("treats a missing face as back", () => {
    const configs = makeConfigs();
    delete configs.left_leg.face;
    renderWithIntl(
      <SockFaceSelector
        positions={["left_leg"]}
        printPositionConfigs={configs}
        onFaceChange={() => {}}
      />,
    );

    expect(
      screen.getByRole("button", { name: /back of the left sock/i }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("disables the controls when disabled", () => {
    renderWithIntl(
      <SockFaceSelector
        positions={["left_leg"]}
        printPositionConfigs={makeConfigs()}
        onFaceChange={() => {}}
        disabled
      />,
    );

    screen.getAllByRole("button").forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
