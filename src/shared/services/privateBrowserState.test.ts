import { beforeEach, describe, expect, it } from "vitest";
import { clearPrivateBrowserState } from "./privateBrowserState";
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
