import { formatOrderDate } from "../utils/formatOrderDate";
import type { OrderWithItemsT } from "@/types/order";

export function getFirstOrderItem(order: OrderWithItemsT) {
  return order.order_items?.[0];
}

export function getAddressSummary(order: OrderWithItemsT): string {
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
  return "Archive Address";
}

export function getArchiveLine(order: OrderWithItemsT): string {
  return `Archive ${formatOrderDate(order.created_at)} • ${getAddressSummary(order)}`;
}
