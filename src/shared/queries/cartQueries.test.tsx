import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import {
  useCartSummary,
  useRemoveCartItem,
  useRemoveCartItems,
  useUpdateCartItem,
  useUpdateCartItemsSelection,
} from "./cartQueries";
import { CartService } from "@/shared/services/cartService";
import {
  LocalCartStorageService,
  type NewLocalCartItemT,
} from "@/shared/services/localCartStorageService";
import { LOCAL_CART_ID } from "@/shared/mappers/localCartMapper";
import type { CartWithItems } from "@/shared/types/cart";

const mocks = vi.hoisted(() => ({
  user: null as { id: string; email: string; is_anonymous?: boolean } | null,
}));

vi.mock("@/shared/services/cartService");
vi.mock("@/shared/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({
    handleError: vi.fn(),
    handleSuccess: vi.fn(),
  }),
}));
vi.mock("@/shared/queries/authQueries", () => ({
  useUser: () => ({ data: mocks.user, isLoading: false }),
}));

const ANONYMOUS = { id: "anon-1", email: "", is_anonymous: true };
const REGISTERED = { id: "user-1", email: "a@b.c", is_anonymous: false };

function localItem(overrides: Partial<NewLocalCartItemT> = {}): NewLocalCartItemT {
  return {
    productId: "prod-1",
    variantId: "101",
    productName: "Tee",
    unitPrice: 2500,
    quantity: 2,
    customImageUrl: null,
    blueprintId: 6,
    printProviderId: 99,
    ...overrides,
  };
}

describe("cartQueries", () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }
    return Wrapper;
  };

  beforeEach(() => {
    localStorage.clear();
    mocks.user = null;
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe("useCartSummary", () => {
    it.each([
      ["with no session", null],
      ["with an anonymous session (even one that already has a database cart)", ANONYMOUS],
    ])("returns the mapped local cart for a guest %s", async (_label, user) => {
      mocks.user = user;
      LocalCartStorageService.addItem(localItem());
      LocalCartStorageService.addItem(localItem({ productId: "prod-2", unitPrice: 1000, quantity: 1 }));

      const { result } = renderHook(() => useCartSummary(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.cart?.id).toBe(LOCAL_CART_ID);
      expect(result.current.cart?.cart_items.map((item) => item.product_id)).toEqual([
        "prod-1",
        "prod-2",
      ]);
      expect(result.current.subtotal).toBe(6000);
      expect(result.current.itemCount).toBe(3);
      expect(CartService.getOrCreateCart).not.toHaveBeenCalled();
    });

    it("shows a guest the items added after the page loaded", async () => {
      const { result } = renderHook(() => useCartSummary(), { wrapper: createWrapper() });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.itemCount).toBe(0);

      act(() => LocalCartStorageService.addItem(localItem()));

      expect(result.current.itemCount).toBe(2);
    });

    it("reads a registered user's database cart", async () => {
      mocks.user = REGISTERED;
      const dbCart = { id: "cart-1", cart_items: [] } as unknown as CartWithItems;
      vi.mocked(CartService.getOrCreateCart).mockResolvedValue(dbCart);
      vi.mocked(CartService.getCart).mockResolvedValue(dbCart);
      vi.mocked(CartService.calculateCartSummary).mockReturnValue({
        subtotal: 0,
        itemCount: 0,
        items: [],
      });

      const { result } = renderHook(() => useCartSummary(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.cart?.id).toBe("cart-1"));
      expect(CartService.getOrCreateCart).toHaveBeenCalledWith("user-1", undefined, "a@b.c");
    });
  });

  describe("guest cart mutations", () => {
    it("updates the quantity in localStorage", async () => {
      mocks.user = ANONYMOUS;
      LocalCartStorageService.addItem(localItem());
      const [{ id }] = LocalCartStorageService.getItems();
      const { result } = renderHook(() => useUpdateCartItem(), { wrapper: createWrapper() });

      await result.current.mutateAsync({ itemId: id, update: { quantity: 5 } });

      expect(LocalCartStorageService.getItems()[0].quantity).toBe(5);
      expect(CartService.updateCartItem).not.toHaveBeenCalled();
    });

    it("removes the item from localStorage", async () => {
      LocalCartStorageService.addItem(localItem());
      const [{ id }] = LocalCartStorageService.getItems();
      const { result } = renderHook(() => useRemoveCartItem(), { wrapper: createWrapper() });

      await result.current.mutateAsync(id);

      expect(LocalCartStorageService.getItems()).toEqual([]);
      expect(CartService.removeCartItem).not.toHaveBeenCalled();
    });

    it("stores the checkout selection of the local cart in localStorage", async () => {
      LocalCartStorageService.addItem(localItem());
      LocalCartStorageService.addItem(localItem({ productId: "prod-2" }));
      const [first] = LocalCartStorageService.getItems();
      const { result } = renderHook(() => useUpdateCartItemsSelection(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({ cartId: LOCAL_CART_ID, selectedItemIds: [first.id] });

      expect(LocalCartStorageService.getItems().map((item) => item.isSelected)).toEqual([
        true,
        false,
      ]);
      expect(CartService.updateCartItemsSelection).not.toHaveBeenCalled();
    });
  });

  describe("useRemoveCartItems", () => {
    it("removes only the given item ids", async () => {
      vi.mocked(CartService.removeCartItems).mockResolvedValue(undefined);

      const { result } = renderHook(() => useRemoveCartItems(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(["item_1", "item_3"]);

      expect(CartService.removeCartItems).toHaveBeenCalledWith([
        "item_1",
        "item_3",
      ]);
      expect(CartService.clearCart).not.toHaveBeenCalled();
    });

    it("invalidates the cart cache after removing items", async () => {
      vi.mocked(CartService.removeCartItems).mockResolvedValue(undefined);
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useRemoveCartItems(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync(["item_1"]);

      await waitFor(() => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cart"] });
      });
    });
  });
});
