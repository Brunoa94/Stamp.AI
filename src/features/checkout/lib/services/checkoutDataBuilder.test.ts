import { describe, expect, it } from "vitest";
import { CheckoutDataBuilder } from "./checkoutDataBuilder";
import type { CheckoutFormData } from "../context/CheckoutFormContext";
import type { CartWithItems } from "@/shared/types/cart";

describe("CheckoutDataBuilder", () => {
  it("freezes the exact checkout cart for use after the payment redirect", () => {
    const formData = {
      billing: {
        first_name: "Ada",
        email: "ada@example.com",
        country: "NL",
        address1: "Dam 1",
        city: "Amsterdam",
        zip: "1012JS",
      },
      useShippingAddress: false,
      paymentMethod: "stripe",
    } as CheckoutFormData;
    const cart = {
      id: "cart_123",
      cart_items: [
        {
          id: "item_selected_at_payment_time",
          product_id: "printify_product_1",
          variant_id: "42",
          quantity: 1,
          unit_price: 2500,
          is_selected: true,
        },
      ],
    } as unknown as CartWithItems;

    const checkoutData = CheckoutDataBuilder.buildCheckoutData(
      formData,
      cart,
      cart.id,
      2500,
    );

    // Simulate the live cart changing while the customer is at the provider.
    cart.cart_items[0].quantity = 5;
    cart.cart_items.push({
      id: "item_added_in_another_tab",
    } as (typeof cart.cart_items)[number]);

    expect(checkoutData.cartSnapshot.cart_items).toHaveLength(1);
    expect(checkoutData.cartSnapshot.cart_items[0]).toMatchObject({
      id: "item_selected_at_payment_time",
      quantity: 1,
      unit_price: 2500,
    });
  });
});
