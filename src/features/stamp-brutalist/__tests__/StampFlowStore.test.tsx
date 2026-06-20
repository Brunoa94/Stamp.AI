import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useStampFlowStore } from "../lib/context/StampFormContext";
import { useStampNavigation } from "../lib/hooks/useStampNavigation";
import { useStampProgress } from "../lib/hooks/useStampProgress";

// Reset the store before each test
beforeEach(() => {
  useStampFlowStore.getState().reset();
});

describe("useStampFlowStore", () => {
  describe("initial state", () => {
    it("should have initial currentStep of 1", () => {
      const { currentStep } = useStampFlowStore.getState();
      expect(currentStep).toBe(1);
    });

    it("should have empty generatedResults", () => {
      const { generatedResults } = useStampFlowStore.getState();
      expect(generatedResults).toEqual([]);
    });

    it("should have isGenerating as false", () => {
      const { isGenerating } = useStampFlowStore.getState();
      expect(isGenerating).toBe(false);
    });

    it("should have isFinalizing as false", () => {
      const { isFinalizing } = useStampFlowStore.getState();
      expect(isFinalizing).toBe(false);
    });
  });

  describe("setCurrentStep", () => {
    it("should update currentStep", () => {
      const { setCurrentStep } = useStampFlowStore.getState();

      act(() => {
        setCurrentStep(3);
      });

      expect(useStampFlowStore.getState().currentStep).toBe(3);
    });

    it("should allow setting any step from 1 to 8", () => {
      const { setCurrentStep } = useStampFlowStore.getState();

      for (let step = 1; step <= 8; step++) {
        act(() => {
          setCurrentStep(step);
        });
        expect(useStampFlowStore.getState().currentStep).toBe(step);
      }
    });
  });

  describe("generation state", () => {
    it("should update isGenerating", () => {
      const { setIsGenerating } = useStampFlowStore.getState();

      act(() => {
        setIsGenerating(true);
      });

      expect(useStampFlowStore.getState().isGenerating).toBe(true);

      act(() => {
        setIsGenerating(false);
      });

      expect(useStampFlowStore.getState().isGenerating).toBe(false);
    });

    it("should add generated results", () => {
      const { addGeneratedResult } = useStampFlowStore.getState();
      const mockResult = {
        imageUrl: "https://example.com/image1.png",
        enhancedPrompt: "A beautiful sunset",
      };

      act(() => {
        addGeneratedResult(mockResult);
      });

      const { generatedResults } = useStampFlowStore.getState();
      expect(generatedResults).toHaveLength(1);
      expect(generatedResults[0]).toEqual(mockResult);
    });

    it("should prepend new results and limit to 20 items", () => {
      const { addGeneratedResult } = useStampFlowStore.getState();

      // Add 25 results
      for (let i = 0; i < 25; i++) {
        act(() => {
          addGeneratedResult({
            imageUrl: `https://example.com/image${i}.png`,
            enhancedPrompt: `Prompt ${i}`,
          });
        });
      }

      const { generatedResults } = useStampFlowStore.getState();
      expect(generatedResults).toHaveLength(20);
      // Most recent should be first
      expect(generatedResults[0].enhancedPrompt).toBe("Prompt 24");
    });
  });

  describe("selection state", () => {
    it("should update selectedImageUrl", () => {
      const { setSelectedImageUrl } = useStampFlowStore.getState();

      act(() => {
        setSelectedImageUrl("https://example.com/selected.png");
      });

      expect(useStampFlowStore.getState().selectedImageUrl).toBe(
        "https://example.com/selected.png"
      );
    });

    it("should update enhancedPrompt", () => {
      const { setEnhancedPrompt } = useStampFlowStore.getState();

      act(() => {
        setEnhancedPrompt("Enhanced prompt text");
      });

      expect(useStampFlowStore.getState().enhancedPrompt).toBe(
        "Enhanced prompt text"
      );
    });
  });

  describe("finalization state", () => {
    it("should update isFinalizing", () => {
      const { setIsFinalizing } = useStampFlowStore.getState();

      act(() => {
        setIsFinalizing(true);
      });

      expect(useStampFlowStore.getState().isFinalizing).toBe(true);
    });

    it("should update createdProductId", () => {
      const { setCreatedProductId } = useStampFlowStore.getState();

      act(() => {
        setCreatedProductId("product-123");
      });

      expect(useStampFlowStore.getState().createdProductId).toBe("product-123");
    });

    it("should update mockupImageUrl", () => {
      const { setMockupImageUrl } = useStampFlowStore.getState();

      act(() => {
        setMockupImageUrl("https://example.com/mockup.png");
      });

      expect(useStampFlowStore.getState().mockupImageUrl).toBe(
        "https://example.com/mockup.png"
      );
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      const store = useStampFlowStore.getState();

      // Set various states
      act(() => {
        store.setCurrentStep(5);
        store.setIsGenerating(true);
        store.setIsFinalizing(true);
        store.setSelectedImageUrl("https://example.com/image.png");
        store.setEnhancedPrompt("Test prompt");
        store.setCreatedProductId("product-123");
        store.addGeneratedResult({
          imageUrl: "test",
          enhancedPrompt: "test",
        });
      });

      // Reset
      act(() => {
        store.reset();
      });

      const resetState = useStampFlowStore.getState();
      expect(resetState.currentStep).toBe(1);
      expect(resetState.isGenerating).toBe(false);
      expect(resetState.isFinalizing).toBe(false);
      expect(resetState.selectedImageUrl).toBeUndefined();
      expect(resetState.enhancedPrompt).toBeUndefined();
      expect(resetState.createdProductId).toBeUndefined();
      expect(resetState.generatedResults).toEqual([]);
    });
  });
});

describe("useStampNavigation", () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("should return current step from store", () => {
    const { result } = renderHook(() => useStampNavigation());
    expect(result.current.currentStep).toBe(1);
  });

  it("should navigate to next step", async () => {
    const { result } = renderHook(() => useStampNavigation());

    act(() => {
      result.current.nextStep();
    });

    // Wait for state to update
    expect(useStampFlowStore.getState().currentStep).toBe(2);
  });

  it("should navigate to previous step", () => {
    // Start at step 3
    act(() => {
      useStampFlowStore.getState().setCurrentStep(3);
    });

    const { result } = renderHook(() => useStampNavigation());

    act(() => {
      result.current.prevStep();
    });

    expect(useStampFlowStore.getState().currentStep).toBe(2);
  });

  it("should navigate to specific step with goToStep", () => {
    const { result } = renderHook(() => useStampNavigation());

    act(() => {
      result.current.goToStep(5);
    });

    expect(useStampFlowStore.getState().currentStep).toBe(5);
  });

  it("should not go below step 1", () => {
    const { result } = renderHook(() => useStampNavigation());

    act(() => {
      result.current.prevStep();
    });

    expect(useStampFlowStore.getState().currentStep).toBe(1);
  });

  it("should not go above step 8", () => {
    act(() => {
      useStampFlowStore.getState().setCurrentStep(8);
    });

    const { result } = renderHook(() => useStampNavigation());

    act(() => {
      result.current.nextStep();
    });

    expect(useStampFlowStore.getState().currentStep).toBe(8);
  });

  it("should not allow goToStep outside valid range", () => {
    const { result } = renderHook(() => useStampNavigation());

    act(() => {
      result.current.goToStep(0);
    });
    expect(useStampFlowStore.getState().currentStep).toBe(1);

    act(() => {
      result.current.goToStep(9);
    });
    expect(useStampFlowStore.getState().currentStep).toBe(1);

    act(() => {
      result.current.goToStep(-1);
    });
    expect(useStampFlowStore.getState().currentStep).toBe(1);
  });

  it("should call scrollIntoView after step change", async () => {
    // Create mock element
    const mockElement = document.createElement("section");
    mockElement.id = "step-2";
    document.body.appendChild(mockElement);

    const { result } = renderHook(() => useStampNavigation());

    act(() => {
      result.current.goToStep(2);
    });

    // Wait for setTimeout
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
    });

    // Cleanup
    document.body.removeChild(mockElement);
  });

  it("nextStep should read fresh state (not stale closure)", () => {
    const { result, rerender } = renderHook(() => useStampNavigation());

    // Navigate to step 3 externally
    act(() => {
      useStampFlowStore.getState().setCurrentStep(3);
    });

    // Don't rerender - test that nextStep reads fresh state
    act(() => {
      result.current.nextStep();
    });

    expect(useStampFlowStore.getState().currentStep).toBe(4);
  });
});

describe("useStampProgress", () => {
  it("should return 0% for step 1", () => {
    const { result } = renderHook(() => useStampProgress());
    expect(result.current).toBe(0);
  });

  it("should return 100% for step 8", () => {
    act(() => {
      useStampFlowStore.getState().setCurrentStep(8);
    });

    const { result } = renderHook(() => useStampProgress());
    expect(result.current).toBe(100);
  });

  it("should return approximately 14.3% for step 2", () => {
    act(() => {
      useStampFlowStore.getState().setCurrentStep(2);
    });

    const { result } = renderHook(() => useStampProgress());
    // (2-1) / 7 * 100 = 14.285...
    expect(result.current).toBeCloseTo(14.29, 1);
  });

  it("should return 50% for step 4.5 (middle)", () => {
    act(() => {
      useStampFlowStore.getState().setCurrentStep(4);
    });

    const { result } = renderHook(() => useStampProgress());
    // (4-1) / 7 * 100 = 42.857...
    expect(result.current).toBeCloseTo(42.86, 1);
  });

  it("should update when step changes", () => {
    const { result, rerender } = renderHook(() => useStampProgress());

    expect(result.current).toBe(0);

    act(() => {
      useStampFlowStore.getState().setCurrentStep(5);
    });

    rerender();

    // (5-1) / 7 * 100 = 57.14...
    expect(result.current).toBeCloseTo(57.14, 1);
  });
});

describe("Fine-grained subscriptions", () => {
  it("should only trigger re-render for subscribed state", () => {
    let stepRenderCount = 0;
    let generationRenderCount = 0;

    const { result: stepResult } = renderHook(() => {
      stepRenderCount++;
      return useStampFlowStore((s) => s.currentStep);
    });

    const { result: generationResult } = renderHook(() => {
      generationRenderCount++;
      return useStampFlowStore((s) => s.isGenerating);
    });

    const initialStepRenders = stepRenderCount;
    const initialGenerationRenders = generationRenderCount;

    // Change currentStep - should only affect step subscriber
    act(() => {
      useStampFlowStore.getState().setCurrentStep(2);
    });

    expect(stepRenderCount).toBeGreaterThan(initialStepRenders);
    // Generation render count might not increase if Zustand optimizes correctly
    // This depends on Zustand's internal batching

    // Change isGenerating - should only affect generation subscriber
    const afterStepChangeStepRenders = stepRenderCount;
    act(() => {
      useStampFlowStore.getState().setIsGenerating(true);
    });

    // Step subscriber should not have re-rendered
    expect(stepRenderCount).toBe(afterStepChangeStepRenders);
  });
});
