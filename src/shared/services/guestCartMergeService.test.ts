import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mergeGuestCartIntoAccount } from "./guestCartMergeService";
import { AuthService } from "./authService";
import { CartService } from "./cartService";
import { LocalCartStorageService } from "./localCartStorageService";
import { GuestClaimStorageService } from "./guestClaimStorageService";
import type { CartItem, CartT } from "@/shared/types/cart";

const ACCOUNT = { id: "user-1", email: "a@b.c" };

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

describe("mergeGuestCartIntoAccount", () => {
  let accountCart: string[];

  beforeEach(() => {
    localStorage.clear();
    accountCart = [];
    vi.spyOn(AuthService, "claimGuestProducts").mockResolvedValue(undefined);
    vi.spyOn(CartService, "getOrCreateCart").mockResolvedValue({ id: "cart-1" } as CartT);
    vi.spyOn(CartService, "addToCart").mockImplementation(async (_cartId, input) => {
      accountCart.push(input.product_id!);
      return {} as CartItem;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("claims the guest's products, adds the local items to the account cart and clears the local cart", async () => {
    addLocalItem("prod-1");
    addLocalItem("prod-2");
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "anon-1" });

    await mergeGuestCartIntoAccount(ACCOUNT);

    expect(AuthService.claimGuestProducts).toHaveBeenCalledWith("guest-jwt");
    expect(CartService.getOrCreateCart).toHaveBeenCalledWith("user-1", undefined, "a@b.c");
    expect(accountCart).toEqual(["prod-1", "prod-2"]);
    expect(LocalCartStorageService.getItems()).toEqual([]);
    expect(GuestClaimStorageService.read()).toBeNull();
  });

  it("keeps the local cart and the pending claim when the claim fails", async () => {
    addLocalItem("prod-1");
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "anon-1" });
    vi.mocked(AuthService.claimGuestProducts).mockRejectedValue(new Error("NOT_A_GUEST"));

    await expect(mergeGuestCartIntoAccount(ACCOUNT)).rejects.toThrow();

    expect(accountCart).toEqual([]);
    expect(LocalCartStorageService.getItems()).toHaveLength(1);
    expect(GuestClaimStorageService.read()).not.toBeNull();
  });

  it("skips the claim when Google was linked to the same user", async () => {
    addLocalItem("prod-1");
    GuestClaimStorageService.save({ accessToken: "guest-jwt", userId: "user-1" });

    await mergeGuestCartIntoAccount(ACCOUNT);

    expect(AuthService.claimGuestProducts).not.toHaveBeenCalled();
    expect(accountCart).toEqual(["prod-1"]);
  });

  it("does nothing without a pending claim or local items", async () => {
    await mergeGuestCartIntoAccount(ACCOUNT);

    expect(AuthService.claimGuestProducts).not.toHaveBeenCalled();
    expect(CartService.getOrCreateCart).not.toHaveBeenCalled();
  });
});
