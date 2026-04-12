import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { OrderSummarySection } from "./OrderDetailsModal/OrderSummarySection";
import { OrderItemsList } from "./OrderItemsList";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    const { fill: _fill, ...imgProps } = props;
    return React.createElement("img", imgProps);
  },
}));

describe("order details modal sections", () => {
  it("renders order summary data and total breakdown", () => {
    const order = {
      customer_email: "customer@stamp.ai",
      subtotal: 35,
      shipping_cost: 5,
      tax_amount: 3.5,
      discount_amount: 2,
      total_amount: 41.5,
    } as any;

    const html = renderToStaticMarkup(
      React.createElement(OrderSummarySection, {
        order,
        formattedDate: "April 09, 2026 at 12:18 AM",
      }),
    );

    expect(html).toContain("Order Date");
    expect(html).toContain("Customer Email");
    expect(html).toContain("customer@stamp.ai");
    expect(html).toContain("Order Summary");
    expect(html).toContain("$35.00");
    expect(html).toContain("$5.00");
    expect(html).toContain("$3.50");
    expect(html).toContain("-$2.00");
    expect(html).toContain("$41.50");
  });

  it("shows empty state when order has no items", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrderItemsList, {
        items: [],
      }),
    );

    expect(html).toContain("Order Items");
    expect(html).toContain("No items found for this order.");
  });

  it("renders item card data, quantity and discount pricing", () => {
    const html = renderToStaticMarkup(
      React.createElement(OrderItemsList, {
        items: [
          {
            id: "item-1",
            product_name: "Unisex Cotton Crew Tee – Custom Design",
            variant_name: "Solid Black / Large",
            quantity: 2,
            unit_price: 35,
            total_price: 40,
            custom_image_url: "https://example.com/design.png",
          },
        ] as any,
      }),
    );

    expect(html).toContain("Unisex Cotton Crew Tee – Custom Design");
    expect(html).toContain("Solid Black / Large");
    expect(html).toContain("Qty: 2");
    expect(html).toContain("$70.00");
    expect(html).toContain("$40.00");
  });
});
