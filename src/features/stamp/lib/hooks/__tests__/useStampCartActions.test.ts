import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useStampCartActions } from "../useStampCartActions";
import { LocalCartStorageService } from "@/shared/services/localCartStorageService";
import { AnalyticsService } from "@/shared/services/analyticsService";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  mutateAsync: vi.fn(),
  user: null as { id: string; is_anonymous?: boolean } | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("sonner", () => ({ toast: { info: vi.fn() } }));
vi.mock("../useStampSelectors", () => ({
  useStampFinalization: () => ({
    createdProductId: "prod-1",
    createdVariantId: 101,
    mockupImageUrl: "https://cdn/mockup.png",
  }),
  useStampSelectedImage: () => ({ selectedImageUrl: "https://cdn/design.png" }),
  useStampCustomization: () => ({ selectedPriceCents: 2500 }),
  useStampProductSelection: () => ({
    selectedProductTitle: "Tee",
    blueprintId: 6,
    printProviderId: 99,
  }),
}));
vi.mock("@/shared/queries/cartQueries", () => ({
  useAddToCart: () => ({ mutateAsync: mocks.mutateAsync, isPending: false }),
}));
vi.mock("@/shared/queries/authQueries", () => ({
  useUser: () => ({ data: mocks.user }),
}));
vi.mock("@/shared/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: vi.fn(), handleSuccess: vi.fn() }),
}));
vi.mock("../../helpers/stampLogger", () => ({
  logStampError: vi.fn(),
  logStampInfo: vi.fn(),
  logStampWarn: vi.fn(),
}));

describe("useStampCartActions", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.spyOn(AnalyticsService, "track").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it.each([
    ["with no session", null],
    ["with an anonymous session", { id: "anon-1", is_anonymous: true }],
  ])("adds a guest's product %s to the local cart", async (_label, user) => {
    mocks.user = user;
    const { result } = renderHook(() => useStampCartActions());

    await act(() => result.current.handleBagIt());

    expect(LocalCartStorageService.getItems()).toEqual([
      expect.objectContaining({
        productId: "prod-1",
        variantId: "101",
        productName: "Tee",
        unitPrice: 2500,
        quantity: 1,
        customImageUrl: "https://cdn/mockup.png",
        blueprintId: 6,
        printProviderId: 99,
      }),
    ]);
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
    expect(AnalyticsService.track).toHaveBeenCalledWith(
      "guest_add_to_cart",
      expect.objectContaining({ currency: "EUR" }),
    );
    expect(mocks.push).toHaveBeenCalledWith("/cart");
  });

  it("adds a guest's product to the local cart when they create another", async () => {
    mocks.user = { id: "anon-1", is_anonymous: true };
    const { result } = renderHook(() => useStampCartActions());

    await act(() => result.current.handleBagItAndCreateAnother());

    expect(LocalCartStorageService.getItems()).toHaveLength(1);
    expect(mocks.mutateAsync).not.toHaveBeenCalled();
  });

  it("adds a registered user's product to their database cart", async () => {
    mocks.user = { id: "user-1", is_anonymous: false };
    mocks.mutateAsync.mockResolvedValue({});
    const { result } = renderHook(() => useStampCartActions());

    await act(() => result.current.handleBagIt());

    expect(mocks.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ product_id: "prod-1", variant_id: "101" }),
    );
    expect(LocalCartStorageService.getItems()).toEqual([]);
  });
});
