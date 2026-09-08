import { describe, expect, it } from "vitest";
import { selectCheckoutCartItems } from "../../../supabase/functions/_shared/cartSelection";

/**
 * process-payment-recovery rebuilds an order from the cart snapshot stored
 * when the payment was made. When only part of the cart was checked out,
 * the recovered order (and therefore its invoice) must contain only the
 * selected items.
 */

describe("selectCheckoutCartItems", () => {
  it("keeps only items whose is_selected flag is not false", () => {
    const items = [
      { id: "a", is_selected: true },
      { id: "b", is_selected: false },
      { id: "c" },
    ];

    expect(selectCheckoutCartItems(items).map((i) => i.id)).toEqual([
      "a",
      "c",
    ]);
  });

  it("falls back to all items when none is selected", () => {
    const items = [
      { id: "a", is_selected: false },
      { id: "b", is_selected: false },
    ];

    expect(selectCheckoutCartItems(items)).toHaveLength(2);
  });

  it("returns an empty array for an empty snapshot", () => {
    expect(selectCheckoutCartItems([])).toEqual([]);
  });

  it("returns an empty array for a missing snapshot", () => {
    expect(selectCheckoutCartItems(undefined)).toEqual([]);
  });
});
