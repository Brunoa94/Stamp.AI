import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCart } from "../useCart";
import { mapLocalCartToCartWithItems } from "@/shared/mappers/localCartMapper";
import type { CartWithItems } from "@/shared/types/cart";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  saveSelection: vi.fn(),
  cart: undefined as CartWithItems | undefined,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
}));
vi.mock("@/shared/queries/cartQueries", () => ({
  useCartSummary: () => ({
    cart: mocks.cart,
    itemCount: mocks.cart?.cart_items.length ?? 0,
    isLoading: false,
    error: null,
  }),
  useUpdateCartItem: () => ({ mutate: vi.fn() }),
  useRemoveCartItem: () => ({ mutate: vi.fn() }),
  useUpdateCartItemsSelection: () => ({ mutateAsync: mocks.saveSelection }),
}));
vi.mock("@/shared/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: vi.fn() }),
}));
vi.mock("@/shared/services/analyticsService", () => ({
  AnalyticsService: { track: vi.fn() },
}));

const LOCAL_ITEM = {
  id: "local-1",
  productId: "prod-1",
  variantId: "101",
  productName: "Tee",
  unitPrice: 2500,
  quantity: 1,
  customImageUrl: null,
  blueprintId: 6,
  printProviderId: 99,
  isSelected: true,
  createdAt: 1,
};

describe("useCart checkout", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("saves a guest's selection and opens /checkout without a cartId", async () => {
    mocks.cart = mapLocalCartToCartWithItems([LOCAL_ITEM]);
    const { result } = renderHook(() => useCart());

    await act(() => result.current.checkout());

    expect(mocks.saveSelection).toHaveBeenCalledWith({
      cartId: mocks.cart.id,
      selectedItemIds: ["local-1"],
    });
    expect(mocks.push).toHaveBeenCalledWith("/checkout");
  });

  it("opens /checkout with the database cart id for a registered user", async () => {
    mocks.cart = {
      ...mapLocalCartToCartWithItems([LOCAL_ITEM]),
      id: "cart-1",
    };
    const { result } = renderHook(() => useCart());

    await act(() => result.current.checkout());

    expect(mocks.push).toHaveBeenCalledWith("/checkout?cartId=cart-1");
  });
});
