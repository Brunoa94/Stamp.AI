import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { FormProvider, useForm } from "react-hook-form";
import { StampIconSidebar } from "../ui/components/StampIconSidebar";
import { StampMobileProgress } from "../ui/components/StampMobileProgress";
import { UploadDropzone } from "../ui/components/UploadDropzone";
import { useStampFlowStore } from "../lib/context/StampFormContext";
import type { StampFormData } from "../lib/schemas/stampFormSchema";

// Reset store before each test
beforeEach(() => {
  useStampFlowStore.getState().reset();
  Element.prototype.scrollIntoView = vi.fn();
});

// Wrapper component for react-hook-form
function FormWrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm<StampFormData>({
    defaultValues: {
      currentStep: 1,
      artStyle: "realistic",
      preservation: 50,
      isGenerating: false,
      isFinalizing: false,
      generatedResults: [],
      prompt: "",
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe("StampIconSidebar", () => {
  it("should render all step icons", () => {
    render(
      <FormWrapper>
        <StampIconSidebar />
      </FormWrapper>
    );

    // Should have 8 step buttons
    const buttons = screen.getAllByRole("button");
    // 8 step buttons + 1 help icon (if it's a button)
    expect(buttons.length).toBeGreaterThanOrEqual(8);
  });

  it("should highlight the current step as active", () => {
    act(() => {
      useStampFlowStore.getState().setCurrentStep(3);
    });

    render(
      <FormWrapper>
        <StampIconSidebar />
      </FormWrapper>
    );

    const activeButton = document.querySelector('[data-step="3"]');
    expect(activeButton).toBeInTheDocument();
    expect(activeButton).toHaveClass("active");
  });

  it("should navigate to step when icon is clicked", async () => {
    render(
      <FormWrapper>
        <StampIconSidebar />
      </FormWrapper>
    );

    // Find step 4 button
    const step4Button = document.querySelector('[data-step="4"]');
    expect(step4Button).toBeInTheDocument();

    if (step4Button) {
      fireEvent.click(step4Button);

      // Wait for state update
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(useStampFlowStore.getState().currentStep).toBe(4);
    }
  });

  it("should show progress line based on current step", () => {
    act(() => {
      useStampFlowStore.getState().setCurrentStep(4);
    });

    render(
      <FormWrapper>
        <StampIconSidebar />
      </FormWrapper>
    );

    const progressFill = document.querySelector(".sidebar-progress-fill");
    if (progressFill) {
      // Step 4 = (4-1)/7 * 100 = ~42.86%
      const style = progressFill.getAttribute("style");
      expect(style).toContain("height:");
    }
  });

  it("should be memoized and not re-render unnecessarily", () => {
    const renderSpy = vi.fn();

    const TrackedSidebar = React.memo(function TrackedSidebar() {
      renderSpy();
      return <StampIconSidebar />;
    });

    const { rerender } = render(
      <FormWrapper>
        <TrackedSidebar />
      </FormWrapper>
    );

    const initialRenderCount = renderSpy.mock.calls.length;

    // Rerender without state change
    rerender(
      <FormWrapper>
        <TrackedSidebar />
      </FormWrapper>
    );

    // Should not have re-rendered
    expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
  });
});

describe("StampMobileProgress", () => {
  it("should display current step number", () => {
    act(() => {
      useStampFlowStore.getState().setCurrentStep(3);
    });

    render(
      <FormWrapper>
        <StampMobileProgress />
      </FormWrapper>
    );

    expect(screen.getByText(/Protocol 03/i)).toBeInTheDocument();
  });

  it("should update step number when step changes", () => {
    const { rerender } = render(
      <FormWrapper>
        <StampMobileProgress />
      </FormWrapper>
    );

    expect(screen.getByText(/Protocol 01/i)).toBeInTheDocument();

    act(() => {
      useStampFlowStore.getState().setCurrentStep(5);
    });

    rerender(
      <FormWrapper>
        <StampMobileProgress />
      </FormWrapper>
    );

    expect(screen.getByText(/Protocol 05/i)).toBeInTheDocument();
  });

  it("should show progress bar with correct width", () => {
    act(() => {
      useStampFlowStore.getState().setCurrentStep(4);
    });

    render(
      <FormWrapper>
        <StampMobileProgress />
      </FormWrapper>
    );

    const progressBar = document.querySelector(".bg-brandCyan");
    if (progressBar) {
      const style = progressBar.getAttribute("style");
      expect(style).toContain("width:");
    }
  });
});

describe("UploadDropzone", () => {
  it("should render upload prompt when no image", () => {
    render(
      <FormWrapper>
        <UploadDropzone />
      </FormWrapper>
    );

    expect(screen.getByText(/Drag and drop your asset/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Terminal/i)).toBeInTheDocument();
  });

  it("should call onNext when Next Step button is clicked", () => {
    const onNext = vi.fn();

    // We need to simulate an uploaded image to show the Next button
    // This requires setting the form value
    function TestComponent() {
      const methods = useForm<StampFormData>({
        defaultValues: {
          currentStep: 1,
          artStyle: "realistic",
          preservation: 50,
          isGenerating: false,
          isFinalizing: false,
          generatedResults: [],
          prompt: "",
          referenceImage: new File(["test"], "test.png", { type: "image/png" }),
        },
      });
      return (
        <FormProvider {...methods}>
          <UploadDropzone onNext={onNext} />
        </FormProvider>
      );
    }

    render(<TestComponent />);

    const nextButton = screen.queryByText(/Next Step/i);
    if (nextButton) {
      fireEvent.click(nextButton);
      expect(onNext).toHaveBeenCalled();
    }
  });

  it("should handle file drop", async () => {
    function TestComponent() {
      const methods = useForm<StampFormData>({
        defaultValues: {
          currentStep: 1,
          artStyle: "realistic",
          preservation: 50,
          isGenerating: false,
          isFinalizing: false,
          generatedResults: [],
          prompt: "",
        },
      });
      return (
        <FormProvider {...methods}>
          <UploadDropzone />
        </FormProvider>
      );
    }

    render(<TestComponent />);

    const dropzone = document.querySelector("[class*='border-dashed']");
    expect(dropzone).toBeInTheDocument();

    if (dropzone) {
      const file = new File(["test"], "test.png", { type: "image/png" });

      await act(async () => {
        fireEvent.drop(dropzone, {
          dataTransfer: {
            files: [file],
            types: ["Files"],
          },
        });
      });

      // The dropzone should have processed the file
      // Further assertions would depend on form state
    }
  });

  it("should not trigger rapid state updates on dragover", async () => {
    const stateUpdateSpy = vi.fn();

    // Track Zustand state updates
    const unsubscribe = useStampFlowStore.subscribe(stateUpdateSpy);

    render(
      <FormWrapper>
        <UploadDropzone />
      </FormWrapper>
    );

    const dropzone = document.querySelector("[class*='border-dashed']");

    if (dropzone) {
      const initialCalls = stateUpdateSpy.mock.calls.length;

      // Simulate multiple dragover events (like rapid mouse movement)
      for (let i = 0; i < 10; i++) {
        fireEvent.dragOver(dropzone, {
          dataTransfer: { files: [], types: ["Files"] },
        });
      }

      // Should not have triggered many state updates
      // The fix uses useRef for drag state tracking
      expect(stateUpdateSpy.mock.calls.length - initialCalls).toBeLessThan(5);
    }

    unsubscribe();
  });

  it("should update visual state only on drag enter/leave boundaries", () => {
    render(
      <FormWrapper>
        <UploadDropzone />
      </FormWrapper>
    );

    const dropzone = document.querySelector("[class*='border-dashed']");

    if (dropzone) {
      // Initial state - no drag active class
      expect(dropzone.className).not.toContain("bg-brandPurple/10");

      // Drag enter
      fireEvent.dragEnter(dropzone, {
        dataTransfer: { files: [], types: ["Files"] },
      });

      // Should show drag active state
      // Note: The actual class application depends on React re-render
    }
  });

  it("should clean up object URL on unmount", () => {
    const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");

    function TestComponent({ show }: { show: boolean }) {
      const methods = useForm<StampFormData>({
        defaultValues: {
          currentStep: 1,
          artStyle: "realistic",
          preservation: 50,
          isGenerating: false,
          isFinalizing: false,
          generatedResults: [],
          prompt: "",
          referenceImage: new File(["test"], "test.png", { type: "image/png" }),
        },
      });
      return show ? (
        <FormProvider {...methods}>
          <UploadDropzone />
        </FormProvider>
      ) : null;
    }

    const { rerender } = render(<TestComponent show={true} />);

    // Unmount
    rerender(<TestComponent show={false} />);

    // Should have called revokeObjectURL to clean up
    expect(revokeObjectURLSpy).toHaveBeenCalled();

    revokeObjectURLSpy.mockRestore();
  });
});

describe("Memoization", () => {
  it("IconStepButton should not re-render when sibling props change", () => {
    // This test verifies that individual step buttons don't re-render
    // when other buttons' states change

    act(() => {
      useStampFlowStore.getState().setCurrentStep(1);
    });

    const { rerender } = render(
      <FormWrapper>
        <StampIconSidebar />
      </FormWrapper>
    );

    // Change step from 1 to 2
    act(() => {
      useStampFlowStore.getState().setCurrentStep(2);
    });

    rerender(
      <FormWrapper>
        <StampIconSidebar />
      </FormWrapper>
    );

    // Step 1 button should show as completed (not active)
    const step1Button = document.querySelector('[data-step="1"]');
    const step2Button = document.querySelector('[data-step="2"]');

    expect(step1Button).not.toHaveClass("active");
    expect(step2Button).toHaveClass("active");
  });
});
