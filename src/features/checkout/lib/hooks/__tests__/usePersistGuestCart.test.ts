import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePersistGuestCart } from "../usePersistGuestCart";
import { CartService } from "@/shared/services/cartService";
import { LocalCartStorageService } from "@/shared/services/localCartStorageService";
import { AnalyticsService } from "@/shared/services/analyticsService";
import type { CartWithItems } from "@/shared/types/cart";

const mocks = vi.hoisted(() => ({
  ensureGuestSession: vi.fn(),
  handleError: vi.fn(),
}));

vi.mock("@/shared/queries/authQueries", () => ({
  useEnsureGuestSession: () => mocks.ensureGuestSession,
}));
vi.mock("@/shared/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: mocks.handleError }),
}));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const SAVED_CART = {
  id: "cart-1",
  user_id: "anon-1",
  cart_items: [
    { id: "row-1", product_id: "prod-1", is_selected: true },
    { id: "row-2", product_id: "prod-2", is_selected: false },
  ],
} as unknown as CartWithItems;

function addLocalItem(productId: string) {
  LocalCartStorageService.addItem({
    productId,
    variantId: "101",
    productName: "Tee",
    unitPrice: 2500,
    quantity: 1,
    customImageUrl: null,
    blueprintId: 6,
    printProviderId: 99,
  });
}

describe("usePersistGuestCart", () => {
  beforeEach(() => {
    localStorage.clear();
    addLocalItem("prod-1");
    addLocalItem("prod-2");
    mocks.ensureGuestSession.mockResolvedValue({ id: "anon-1", is_anonymous: true });
    vi.spyOn(CartService, "saveCartFromLocalItems").mockResolvedValue(SAVED_CART);
    vi.spyOn(AnalyticsService, "track").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("saves the local items to the anonymous user's database cart and returns its checkout cart", async () => {
    const localBefore = LocalCartStorageService.getItems();
    const { result } = renderHook(() => usePersistGuestCart());

    const cart = await act(() => result.current.persistGuestCart());

    expect(CartService.saveCartFromLocalItems).toHaveBeenCalledWith("anon-1", localBefore);
    expect(cart.id).toBe("cart-1");
    expect(cart.cart_items.map((item) => item.id)).toEqual(["row-1"]);
  });

  it("leaves localStorage unchanged", async () => {
    const localBefore = LocalCartStorageService.getItems();
    const { result } = renderHook(() => usePersistGuestCart());

    await act(() => result.current.persistGuestCart());

    expect(LocalCartStorageService.getItems()).toEqual(localBefore);
  });

  it("fires guest_payment_started", async () => {
    const { result } = renderHook(() => usePersistGuestCart());

    await act(() => result.current.persistGuestCart());

    expect(AnalyticsService.track).toHaveBeenCalledWith(
      "guest_payment_started",
      expect.objectContaining({ items: 1 }),
    );
  });

  it("shows guestCartPersist and rejects when saving fails", async () => {
    vi.mocked(CartService.saveCartFromLocalItems).mockRejectedValue(new Error("RLS"));
    const { result } = renderHook(() => usePersistGuestCart());

    await expect(act(() => result.current.persistGuestCart())).rejects.toThrow("guestCartPersist");
    expect(mocks.handleError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "guestCartPersist" }),
    );
  });

  it("shows guestCartPersist when the guest session cannot start", async () => {
    mocks.ensureGuestSession.mockRejectedValue(new Error("rate limited"));
    const { result } = renderHook(() => usePersistGuestCart());

    await expect(act(() => result.current.persistGuestCart())).rejects.toThrow("guestCartPersist");
    expect(CartService.saveCartFromLocalItems).not.toHaveBeenCalled();
  });

  it("does not save twice when clicked again while a call is still running", async () => {
    let finish: (cart: CartWithItems) => void = () => {};
    vi.mocked(CartService.saveCartFromLocalItems).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { result } = renderHook(() => usePersistGuestCart());

    const first = result.current.persistGuestCart();
    const second = result.current.persistGuestCart();
    await act(async () => finish(SAVED_CART));

    await expect(first).resolves.toMatchObject({ id: "cart-1" });
    await expect(second).resolves.toMatchObject({ id: "cart-1" });
    expect(CartService.saveCartFromLocalItems).toHaveBeenCalledTimes(1);
  });
});
