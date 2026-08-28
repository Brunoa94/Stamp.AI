import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSkipGeneration } from "../useSkipGeneration";
import { useStampFlowStore } from "../../stores/stampFlowStore";
import * as generatedImagesStorage from "../../services/generatedImagesStorage";

/**
 * useSkipGeneration Hook Tests
 *
 * Tests for the skip generation flow when user has no coins.
 *
 * Priority logic (NEW):
 * 1. Uploaded image (highest) → step 5 (product selection)
 * 2. Cached images → step 4 (results)
 * 3. Neither → step 1 (upload)
 */

// Mock the storage service
vi.mock("../../services/generatedImagesStorage", () => ({
  getStoredImages: vi.fn(() => []),
}));

// Mock the logger
vi.mock("../../helpers/stampLogger", () => ({
  logStampInfo: vi.fn(),
  logStampWarn: vi.fn(),
}));

describe("useSkipGeneration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStampFlowStore.getState().reset();
  });

  describe("state detection", () => {
    it("should detect hasUploadedImage=true when uploadedImageUrl exists in store", () => {
      useStampFlowStore.setState({
        uploadedImageUrl: "https://example.com/uploaded.jpg",
      });

      const { result } = renderHook(() => useSkipGeneration());

      expect(result.current.hasUploadedImage).toBe(true);
    });

    it("should detect hasUploadedImage=false when uploadedImageUrl is null", () => {
      useStampFlowStore.setState({ uploadedImageUrl: null });

      const { result } = renderHook(() => useSkipGeneration());

      expect(result.current.hasUploadedImage).toBe(false);
    });

    it("should detect hasCachedImages=true when localStorage has cached images", () => {
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([
        {
          imageUrl: "https://example.com/cached.jpg",
          enhancedPrompt: "test prompt",
          timestamp: Date.now(),
        },
      ]);

      const { result } = renderHook(() => useSkipGeneration());

      expect(result.current.hasCachedImages).toBe(true);
    });

    it("should detect hasCachedImages=false when localStorage is empty", () => {
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([]);

      const { result } = renderHook(() => useSkipGeneration());

      expect(result.current.hasCachedImages).toBe(false);
    });
  });

  describe("canSkip logic", () => {
    it("should return canSkip=true when hasUploadedImage=true", () => {
      useStampFlowStore.setState({
        uploadedImageUrl: "https://example.com/uploaded.jpg",
      });

      const { result } = renderHook(() => useSkipGeneration());

      expect(result.current.canSkip).toBe(true);
    });

    it("should return canSkip=true when hasCachedImages=true", () => {
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([
        {
          imageUrl: "https://example.com/cached.jpg",
          enhancedPrompt: "test prompt",
          timestamp: Date.now(),
        },
      ]);

      const { result } = renderHook(() => useSkipGeneration());

      expect(result.current.canSkip).toBe(true);
    });

    it("should return canSkip=true when both uploaded and cached images exist", () => {
      useStampFlowStore.setState({
        uploadedImageUrl: "https://example.com/uploaded.jpg",
      });
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([
        {
          imageUrl: "https://example.com/cached.jpg",
          enhancedPrompt: "test prompt",
          timestamp: Date.now(),
        },
      ]);

      const { result } = renderHook(() => useSkipGeneration());

      expect(result.current.canSkip).toBe(true);
    });

    it("should return canSkip=false when neither uploaded nor cached images exist", () => {
      useStampFlowStore.setState({ uploadedImageUrl: null });
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([]);

      const { result } = renderHook(() => useSkipGeneration());

      expect(result.current.canSkip).toBe(false);
    });
  });

  describe("handleSkipGeneration priority logic", () => {
    it("should navigate to step 5 when hasUploadedImage=true (highest priority)", () => {
      useStampFlowStore.setState({
        uploadedImageUrl: "https://example.com/uploaded.jpg",
      });

      const { result } = renderHook(() => useSkipGeneration());

      act(() => {
        result.current.handleSkipGeneration();
      });

      const state = useStampFlowStore.getState();
      expect(state.currentStep).toBe(5);
      expect(state.selectedImageUrl).toBe("https://example.com/uploaded.jpg");
    });

    it("should navigate to step 5 when hasUploadedImage=true even if cached images exist (priority test)", () => {
      useStampFlowStore.setState({
        uploadedImageUrl: "https://example.com/uploaded.jpg",
      });
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([
        {
          imageUrl: "https://example.com/cached.jpg",
          enhancedPrompt: "cached prompt",
          timestamp: Date.now(),
        },
      ]);

      const { result } = renderHook(() => useSkipGeneration());

      act(() => {
        result.current.handleSkipGeneration();
      });

      const state = useStampFlowStore.getState();
      expect(state.currentStep).toBe(5);
      expect(state.selectedImageUrl).toBe("https://example.com/uploaded.jpg");
      // Should NOT use the cached image
      expect(state.selectedImageUrl).not.toBe("https://example.com/cached.jpg");
    });

    it("should navigate to step 4 when hasCachedImages=true and no uploaded image", () => {
      useStampFlowStore.setState({ uploadedImageUrl: null });
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([
        {
          imageUrl: "https://example.com/cached.jpg",
          enhancedPrompt: "cached prompt",
          timestamp: Date.now(),
        },
      ]);

      const { result } = renderHook(() => useSkipGeneration());

      act(() => {
        result.current.handleSkipGeneration();
      });

      const state = useStampFlowStore.getState();
      expect(state.currentStep).toBe(4);
      expect(state.selectedImageUrl).toBe("https://example.com/cached.jpg");
    });

    it("should navigate to step 1 when neither uploaded nor cached images exist", () => {
      useStampFlowStore.setState({ uploadedImageUrl: null });
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([]);

      const { result } = renderHook(() => useSkipGeneration());

      act(() => {
        result.current.handleSkipGeneration();
      });

      const state = useStampFlowStore.getState();
      expect(state.currentStep).toBe(1);
    });

    it("should return true when skip succeeds with uploaded image", () => {
      useStampFlowStore.setState({
        uploadedImageUrl: "https://example.com/uploaded.jpg",
      });

      const { result } = renderHook(() => useSkipGeneration());

      let returnValue: boolean = false;
      act(() => {
        returnValue = result.current.handleSkipGeneration();
      });

      expect(returnValue).toBe(true);
    });

    it("should return true when skip succeeds with cached images", () => {
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([
        {
          imageUrl: "https://example.com/cached.jpg",
          enhancedPrompt: "cached prompt",
          timestamp: Date.now(),
        },
      ]);

      const { result } = renderHook(() => useSkipGeneration());

      let returnValue: boolean = false;
      act(() => {
        returnValue = result.current.handleSkipGeneration();
      });

      expect(returnValue).toBe(true);
    });

    it("should return false when no images are available", () => {
      useStampFlowStore.setState({ uploadedImageUrl: null });
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([]);

      const { result } = renderHook(() => useSkipGeneration());

      let returnValue: boolean = true;
      act(() => {
        returnValue = result.current.handleSkipGeneration();
      });

      expect(returnValue).toBe(false);
    });
  });

  describe("state updates on skip", () => {
    it("should set enhancedPrompt when using uploaded image", () => {
      useStampFlowStore.setState({
        uploadedImageUrl: "https://example.com/uploaded.jpg",
      });

      const { result } = renderHook(() => useSkipGeneration());

      act(() => {
        result.current.handleSkipGeneration();
      });

      const state = useStampFlowStore.getState();
      expect(state.enhancedPrompt).toBe(
        "Original uploaded image (no AI generation)",
      );
    });

    it("should set enhancedPrompt from cached image when using cached", () => {
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([
        {
          imageUrl: "https://example.com/cached.jpg",
          enhancedPrompt: "A beautiful design with flowers",
          timestamp: Date.now(),
        },
      ]);

      const { result } = renderHook(() => useSkipGeneration());

      act(() => {
        result.current.handleSkipGeneration();
      });

      const state = useStampFlowStore.getState();
      expect(state.enhancedPrompt).toBe("A beautiful design with flowers");
    });

    it("should add generated result when using uploaded image", () => {
      useStampFlowStore.setState({
        uploadedImageUrl: "https://example.com/uploaded.jpg",
      });

      const { result } = renderHook(() => useSkipGeneration());

      act(() => {
        result.current.handleSkipGeneration();
      });

      const state = useStampFlowStore.getState();
      expect(state.generatedResults.length).toBe(1);
      expect(state.generatedResults[0].imageUrl).toBe(
        "https://example.com/uploaded.jpg",
      );
    });

    it("should set all cached images as generated results when using cached", () => {
      vi.mocked(generatedImagesStorage.getStoredImages).mockReturnValue([
        {
          imageUrl: "https://example.com/cached1.jpg",
          enhancedPrompt: "prompt 1",
          timestamp: Date.now(),
        },
        {
          imageUrl: "https://example.com/cached2.jpg",
          enhancedPrompt: "prompt 2",
          timestamp: Date.now() - 1000,
        },
      ]);

      const { result } = renderHook(() => useSkipGeneration());

      act(() => {
        result.current.handleSkipGeneration();
      });

      const state = useStampFlowStore.getState();
      expect(state.generatedResults.length).toBe(2);
    });
  });
});
