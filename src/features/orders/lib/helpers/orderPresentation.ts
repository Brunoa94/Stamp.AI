import type { OrderWithItemsT } from "@/types/order";

export function getFirstOrderItem(order: OrderWithItemsT) {
  return order.order_items?.[0];
}

/**
 * Returns the city/country summary for an order's shipping address, or null
 * when neither is available. Callers render a localized fallback label.
 */
export function getAddressSummary(order: OrderWithItemsT): string | null {
  const shippingAddress = order.shipping_address as
    | {
        city?: string;
        country?: string;
      }
    | null;

  const city = shippingAddress?.city;
  const country = shippingAddress?.country;
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return null;
}
