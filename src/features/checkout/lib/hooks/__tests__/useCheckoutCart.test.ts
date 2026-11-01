import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCheckoutCart } from "../useCheckoutCart";
import { AnalyticsService } from "@/shared/services/analyticsService";
import type { LocalCartItemT } from "@/shared/services/localCartStorageService";
import type { CartWithItems } from "@/shared/types/cart";

const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  user: null as { id: string; is_anonymous?: boolean } | null,
  localItems: null as LocalCartItemT[] | null,
  dbCart: undefined as CartWithItems | undefined,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => mocks.params,
}));
vi.mock("@/shared/queries/authQueries", () => ({
  useUser: () => ({ data: mocks.user, isLoading: false }),
}));
vi.mock("@/shared/queries/cartQueries", () => ({
  useLocalCartItems: () => mocks.localItems,
  useCartById: (cartId: string) => ({
    data: cartId ? mocks.dbCart : undefined,
    isLoading: false,
    error: null,
  }),
}));

function localItem(id: string, isSelected: boolean): LocalCartItemT {
  return {
    id,
    productId: `prod-${id}`,
    variantId: "101",
    productName: "Tee",
    unitPrice: 2500,
    quantity: 1,
    customImageUrl: null,
    blueprintId: 6,
    printProviderId: 99,
    isSelected,
    createdAt: 1,
  };
}

describe("useCheckoutCart", () => {
  beforeEach(() => {
    vi.spyOn(AnalyticsService, "track").mockImplementation(() => {});
    mocks.params = new URLSearchParams();
    mocks.user = { id: "anon-1", is_anonymous: true };
    mocks.localItems = [localItem("a", true), localItem("b", false)];
    mocks.dbCart = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the selected items of a guest's local cart when there is no cartId", () => {
    const { result } = renderHook(() => useCheckoutCart());

    expect(result.current.cartId).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.cart?.cart_items.map((item) => item.id)).toEqual(["a"]);
  });

  it("fires guest_checkout_started once for a guest", async () => {
    const { rerender } = renderHook(() => useCheckoutCart());
    rerender();
    rerender();

    await waitFor(() =>
      expect(AnalyticsService.track).toHaveBeenCalledWith(
        "guest_checkout_started",
        expect.objectContaining({ items: 1 }),
      ),
    );
    expect(
      vi.mocked(AnalyticsService.track).mock.calls.filter(
        ([name]) => name === "guest_checkout_started",
      ),
    ).toHaveLength(1);
  });

  it("is loading until the local cart has been read", () => {
    mocks.localItems = null;

    const { result } = renderHook(() => useCheckoutCart());

    expect(result.current.isLoading).toBe(true);
  });

  it("returns a registered user's database cart from the cartId", () => {
    mocks.user = { id: "user-1", is_anonymous: false };
    mocks.params = new URLSearchParams("cartId=cart-1");
    mocks.dbCart = {
      id: "cart-1",
      cart_items: [{ id: "row-1", is_selected: true }],
    } as unknown as CartWithItems;

    const { result } = renderHook(() => useCheckoutCart());

    expect(result.current.cart?.id).toBe("cart-1");
    expect(AnalyticsService.track).not.toHaveBeenCalledWith(
      "guest_checkout_started",
      expect.anything(),
    );
  });
});
