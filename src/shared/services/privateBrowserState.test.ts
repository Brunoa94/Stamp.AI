import { beforeEach, describe, expect, it } from "vitest";
import { clearPrivateBrowserState, syncPrivateBrowserStateOwner } from "./privateBrowserState";
describe("private browser state", () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });
  it("removes designs, addresses and cart state while preserving consent", () => {
    for (const key of ["stamp:generated-images", "stripe_checkout_data", "paypal_checkout_data", "guest_products", "local_cart", "guest_session_id"]) localStorage.setItem(key, "private");
    localStorage.setItem("stamp_consent", "denied"); sessionStorage.setItem("mollie_shipping_address", "private");
    clearPrivateBrowserState();
    expect(localStorage.length).toBe(1); expect(localStorage.getItem("stamp_consent")).toBe("denied");
    expect(sessionStorage.length).toBe(0);
  });
});

describe("syncPrivateBrowserStateOwner", () => {
  const GUEST = { id: "anon-1", is_anonymous: true };
  const ACCOUNT = { id: "user-1", is_anonymous: false };
  const OTHER_ACCOUNT = { id: "user-2", is_anonymous: false };

  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

  function seedCart() { localStorage.setItem("local_cart", "items"); }

  it("keeps a guest's local cart when the guest logs in to an account", () => {
    syncPrivateBrowserStateOwner("SIGNED_IN", GUEST);
    seedCart();

    syncPrivateBrowserStateOwner("SIGNED_IN", ACCOUNT);

    expect(localStorage.getItem("local_cart")).toBe("items");
  });

  it("keeps the local cart when a visitor without a session starts a guest session", () => {
    seedCart();

    syncPrivateBrowserStateOwner("SIGNED_IN", GUEST);

    expect(localStorage.getItem("local_cart")).toBe("items");
  });

  it("clears private state when an account signs in on a browser with no owner", () => {
    seedCart();

    syncPrivateBrowserStateOwner("SIGNED_IN", ACCOUNT);

    expect(localStorage.getItem("local_cart")).toBeNull();
  });

  it("keeps the cart while the same guest's token refreshes", () => {
    syncPrivateBrowserStateOwner("SIGNED_IN", GUEST);
    seedCart();

    syncPrivateBrowserStateOwner("TOKEN_REFRESHED", GUEST);

    expect(localStorage.getItem("local_cart")).toBe("items");
  });

  it("clears private state when one account switches to another", () => {
    syncPrivateBrowserStateOwner("SIGNED_IN", ACCOUNT);
    seedCart();

    syncPrivateBrowserStateOwner("SIGNED_IN", OTHER_ACCOUNT);

    expect(localStorage.getItem("local_cart")).toBeNull();
  });

  it("clears private state on sign-out", () => {
    syncPrivateBrowserStateOwner("SIGNED_IN", ACCOUNT);
    seedCart();

    syncPrivateBrowserStateOwner("SIGNED_OUT", null);

    expect(localStorage.getItem("local_cart")).toBeNull();
    expect(localStorage.getItem("stamp:storage-owner")).toBeNull();
  });
});
