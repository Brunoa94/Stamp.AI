import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useHydrateFromOrderReuse } from "../useHydrateFromOrderReuse";
import type { FormState, NavigationState } from "../../context/types";
import { OrderService } from "@/services/orderService";

vi.mock("@/services/orderService", () => ({
  OrderService: {
    getOrder: vi.fn(),
  },
}));

const STORAGE_KEY = "stamp:create-product:generated-history";

function createNavigationStore(initialStep: NavigationState["currentStep"] = "synthesis") {
  let state: NavigationState = {
    currentStep: initialStep,
    completedSteps: [],
  };

  return {
    getState: () => state,
    setState: vi.fn((newState: NavigationState) => {
      state = newState;
    }),
  };
}

function createFormStore() {
  const formMock = {
    setValue: vi.fn(),
  } as unknown as FormState["form"];

  let state: FormState = {
    form: formMock,
    uploadedImage: null,
    prompt: "",
    showPromptCustomization: false,
    preservation: 80,
    selectedStyle: "na",
    isGenerating: false,
    generatedResult: null,
    generatedHistory: [],
    generationError: null,
    selectedTshirt: null,
    selectedColor: null,
    selectedSize: null,
    isCreatingProduct: false,
    createdProduct: null,
  };

  return {
    getState: () => state,
    setState: vi.fn((newState: FormState) => {
      state = newState;
    }),
    formMock,
  };
}

describe("useHydrateFromOrderReuse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does nothing when sourceOrder is missing", async () => {
    const formStore = createFormStore();
    const navigationStore = createNavigationStore();

    renderHook(() =>
      useHydrateFromOrderReuse({
        searchParams: new URLSearchParams() as any,
        formStore,
        navigationStore,
        storageKey: STORAGE_KEY,
      }),
    );

    await waitFor(() => {
      expect(OrderService.getOrder).not.toHaveBeenCalled();
    });
  });

  it("hydrates uploaded image and keeps wizard on upload step", async () => {
    const formStore = createFormStore();
    const navigationStore = createNavigationStore("results");

    vi.mocked(OrderService.getOrder).mockResolvedValue({
      id: "order-1",
      order_number: "ORD-1",
      order_items: [
        { id: "item-1", custom_image_url: "https://cdn.example.com/1.png" },
      ],
    } as any);

    const blob = new Blob(["abc"], { type: "image/png" });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      blob: async () => blob,
    } as any);

    renderHook(() =>
      useHydrateFromOrderReuse({
        searchParams: new URLSearchParams("sourceOrder=order-1") as any,
        formStore,
        navigationStore,
        storageKey: STORAGE_KEY,
      }),
    );

    await waitFor(() => {
      expect(navigationStore.getState().currentStep).toBe("upload");
    });

    expect(formStore.getState().uploadedImage).toBeInstanceOf(File);
    expect(formStore.getState().generatedResult).toBeNull();
    expect(formStore.getState().generatedHistory[0]?.imageUrl).toBe(
      "https://cdn.example.com/1.png",
    );
    expect((formStore.formMock as any).setValue).toHaveBeenCalledWith(
      "image",
      expect.any(File),
      expect.objectContaining({ shouldValidate: true }),
    );

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    expect(stored[0].imageUrl).toBe("https://cdn.example.com/1.png");
  });

  it("uses sourceOrderItem when provided; otherwise falls back to first reusable item", async () => {
    const formStore = createFormStore();
    const navigationStore = createNavigationStore();

    vi.mocked(OrderService.getOrder).mockResolvedValue({
      id: "order-2",
      order_number: "ORD-2",
      order_items: [
        { id: "item-a", custom_image_url: "" },
        { id: "item-b", custom_image_url: "https://cdn.example.com/b.png" },
      ],
    } as any);

    const blob = new Blob(["xyz"], { type: "image/png" });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      blob: async () => blob,
    } as any);

    renderHook(() =>
      useHydrateFromOrderReuse({
        searchParams: new URLSearchParams(
          "sourceOrder=order-2&sourceOrderItem=missing-item",
        ) as any,
        formStore,
        navigationStore,
        storageKey: STORAGE_KEY,
      }),
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("https://cdn.example.com/b.png", {
        cache: "no-store",
      });
    });
  });

  it("falls back to proxy fetch when direct fetch fails", async () => {
    const formStore = createFormStore();
    const navigationStore = createNavigationStore();

    vi.mocked(OrderService.getOrder).mockResolvedValue({
      id: "order-3",
      order_number: "ORD-3",
      order_items: [
        { id: "item-c", custom_image_url: "https://remote.example.com/c.png" },
      ],
    } as any);

    const blob = new Blob(["fallback"], { type: "image/png" });

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.startsWith("https://remote.example.com")) {
        throw new Error("CORS blocked");
      }

      if (url.startsWith("/api/fetch-remote-image")) {
        return {
          ok: true,
          blob: async () => blob,
        } as any;
      }

      return { ok: false } as any;
    });

    renderHook(() =>
      useHydrateFromOrderReuse({
        searchParams: new URLSearchParams("sourceOrder=order-3") as any,
        formStore,
        navigationStore,
        storageKey: STORAGE_KEY,
      }),
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/fetch-remote-image?url=https%3A%2F%2Fremote.example.com%2Fc.png",
        { cache: "no-store" },
      );
    });

    expect(formStore.getState().uploadedImage).toBeInstanceOf(File);
    expect(navigationStore.getState().currentStep).toBe("upload");
  });

  it("does not change state when order has no reusable image", async () => {
    const formStore = createFormStore();
    const navigationStore = createNavigationStore("synthesis");

    vi.mocked(OrderService.getOrder).mockResolvedValue({
      id: "order-4",
      order_number: "ORD-4",
      order_items: [{ id: "item-z", custom_image_url: "" }],
    } as any);

    renderHook(() =>
      useHydrateFromOrderReuse({
        searchParams: new URLSearchParams("sourceOrder=order-4") as any,
        formStore,
        navigationStore,
        storageKey: STORAGE_KEY,
      }),
    );

    await waitFor(() => {
      expect(OrderService.getOrder).toHaveBeenCalledTimes(1);
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(navigationStore.getState().currentStep).toBe("synthesis");
    expect(formStore.getState().uploadedImage).toBeNull();
  });
});
