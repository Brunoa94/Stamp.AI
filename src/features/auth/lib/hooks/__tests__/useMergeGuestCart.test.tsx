import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMergeGuestCart } from "../useMergeGuestCart";
import { AuthService } from "@/shared/services/authService";
import { CartService } from "@/shared/services/cartService";
import { LocalCartStorageService } from "@/shared/services/localCartStorageService";
import { GuestClaimStorageService } from "@/shared/services/guestClaimStorageService";
import type { CartItem, CartT } from "@/shared/types/cart";

const mocks = vi.hoisted(() => ({
  user: null as { id: string; email: string; is_anonymous?: boolean } | null,
  handleError: vi.fn(),
}));

vi.mock("@/shared/queries/authQueries", () => ({
  useUser: () => ({ data: mocks.user, isLoading: false }),
}));
vi.mock("@/shared/hooks/useErrorHandler", () => ({
  useErrorHandler: () => ({ handleError: mocks.handleError }),
}));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/lib/observability/errorCapture", () => ({ captureError: vi.fn() }));

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

describe("useMergeGuestCart", () => {
  let accountCart: string[];
  let queryClient: QueryClient;

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  beforeEach(() => {
    localStorage.clear();
    queryClient = new QueryClient();
    accountCart = [];
    addLocalItem("prod-1");
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "anon-1", expiresAt: Date.now() + 3_600_000 });
    vi.spyOn(AuthService, "claimGuestProducts").mockResolvedValue(undefined);
    vi.spyOn(CartService, "getOrCreateCart").mockResolvedValue({ id: "cart-1" } as CartT);
    vi.spyOn(CartService, "addToCart").mockImplementation(async (_cartId, input) => {
      accountCart.push(input.product_id!);
      return {} as CartItem;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("adds the local items to the user's database cart after login and clears localStorage", async () => {
    mocks.user = { id: "user-1", email: "a@b.c", is_anonymous: false };

    renderHook(() => useMergeGuestCart(), { wrapper });

    await waitFor(() => expect(LocalCartStorageService.getItems()).toEqual([]));
    expect(accountCart).toEqual(["prod-1"]);
    expect(AuthService.claimGuestProducts).toHaveBeenCalledWith("guest-jwt");
  });

  it("keeps the local cart and shows guestClaim when the claim fails", async () => {
    mocks.user = { id: "user-1", email: "a@b.c", is_anonymous: false };
    vi.mocked(AuthService.claimGuestProducts).mockRejectedValue(new Error("NOT_A_GUEST"));

    renderHook(() => useMergeGuestCart(), { wrapper });

    await waitFor(() =>
      expect(mocks.handleError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "guestClaim" }),
      ),
    );
    expect(LocalCartStorageService.getItems()).toHaveLength(1);
    expect(accountCart).toEqual([]);
  });

  it("shows guestClaimExpired when the guest's products can no longer be claimed", async () => {
    mocks.user = { id: "user-1", email: "a@b.c", is_anonymous: false };
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "anon-1", expiresAt: Date.now() - 1000 });

    renderHook(() => useMergeGuestCart(), { wrapper });

    await waitFor(() =>
      expect(mocks.handleError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "guestClaimExpired" }),
      ),
    );
    expect(accountCart).toEqual([]);
  });

  it("does nothing while the visitor is still a guest", async () => {
    mocks.user = { id: "anon-1", email: "", is_anonymous: true };

    renderHook(() => useMergeGuestCart(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(AuthService.claimGuestProducts).not.toHaveBeenCalled();
    expect(LocalCartStorageService.getItems()).toHaveLength(1);
  });

  it("merges only once when it re-renders while merging", async () => {
    mocks.user = { id: "user-1", email: "a@b.c", is_anonymous: false };

    const { rerender } = renderHook(() => useMergeGuestCart(), { wrapper });
    rerender();
    rerender();

    await waitFor(() => expect(LocalCartStorageService.getItems()).toEqual([]));
    expect(AuthService.claimGuestProducts).toHaveBeenCalledTimes(1);
  });
});
