import { describe, expect, it, vi, beforeEach, type MockInstance } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithIntl } from "@/tests/utils/renderWithIntl";
import { BackButton } from "../BackButton";
import * as navigationModule from "../../../../lib/hooks/useStampNavigation";

describe("BackButton", () => {
  let mockPrevStepSkipLoading: MockInstance;
  let useStampNavigationSpy: MockInstance;

  beforeEach(() => {
    cleanup();
    mockPrevStepSkipLoading = vi.fn();
    useStampNavigationSpy = vi.spyOn(navigationModule, "useStampNavigation");
  });

  function setupMock(currentStep: number) {
    useStampNavigationSpy.mockReturnValue({
      currentStep,
      goToStep: vi.fn(),
      nextStep: vi.fn(),
      prevStep: vi.fn(),
      prevStepSkipLoading: mockPrevStepSkipLoading,
    });
  }

  it("does not render when on step 0 (hero)", () => {
    setupMock(0);
    renderWithIntl(<BackButton />);

    expect(screen.queryByTestId("back-button")).not.toBeInTheDocument();
  });

  it("renders when on step 1 or later", () => {
    setupMock(1);
    renderWithIntl(<BackButton />);

    expect(screen.getByTestId("back-button")).toBeInTheDocument();
  });

  it("shows the target step label (step 0 from step 1)", () => {
    setupMock(1);
    renderWithIntl(<BackButton />);

    // Step 0 is "hero" with label "Start Here"
    expect(screen.getByTestId("back-button")).toHaveTextContent("Start Here");
  });

  it("shows step 1 label when on step 2", () => {
    setupMock(2);
    renderWithIntl(<BackButton />);

    // Step 1 is "step-1" with label "Step 01 / Upload"
    expect(screen.getByTestId("back-button")).toHaveTextContent("Step 01 / Upload");
  });

  it("skips step 3 (loading state) when navigating from step 4", () => {
    setupMock(4);
    renderWithIntl(<BackButton />);

    // Should show step 2's label, skipping step 3
    expect(screen.getByTestId("back-button")).toHaveTextContent("Step 02 / Describe");
  });

  it("skips step 7 (loading state) when navigating from step 8", () => {
    setupMock(8);
    renderWithIntl(<BackButton />);

    // Should show step 6's label, skipping step 7
    expect(screen.getByTestId("back-button")).toHaveTextContent("Step 06 / Customize");
  });

  it("calls prevStepSkipLoading when clicked", async () => {
    const user = userEvent.setup();
    setupMock(2);
    renderWithIntl(<BackButton />);

    await user.click(screen.getByTestId("back-button"));

    expect(mockPrevStepSkipLoading).toHaveBeenCalledTimes(1);
  });

  it("has accessible aria-label with target step info", () => {
    setupMock(2);
    renderWithIntl(<BackButton />);

    const button = screen.getByTestId("back-button");
    expect(button).toHaveAttribute("aria-label", expect.stringContaining("Step 01 / Upload"));
  });

  it("uses the secondary-compact button variant", () => {
    setupMock(1);
    renderWithIntl(<BackButton />);

    const button = screen.getByTestId("back-button");
    expect(button).toHaveAttribute("data-variant", "secondary-compact");
  });

  it("renders the arrow icon", () => {
    setupMock(1);
    renderWithIntl(<BackButton />);

    const button = screen.getByTestId("back-button");
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
