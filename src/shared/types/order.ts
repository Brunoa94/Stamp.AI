import { Database } from "./database.types";
import type { CartWithItems } from "./cart";
import type { ShippingAddressT } from "@/shared/schemas/checkout";
import type { PaymentProviderT } from "../../../supabase/types";

export type CreateOrderT = Database['public']['Tables']['orders']['Insert']
export type OrderT = Database['public']['Tables']['orders']['Row']
export type UpdateOrderT = Database['public']['Tables']['orders']['Update']

export type OrderItemT = Database['public']['Tables']['order_items']['Row']
export type CreateOrderItemT = Database['public']['Tables']['order_items']['Insert']
export type UpdateOrderItemT = Database['public']['Tables']['order_items']['Update']

export interface OrderWithItemsT extends OrderT {
  order_items: OrderItemT[]
}

export type OrderStatusFilterT = "all" | "pending" | "waiting_confirmation" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "unsuccessful_confirmation"
export type OrderTimeframeFilterT = "last-30" | "last-90" | "2023" | "all-time"

export interface OrderStatusHistoryT {
  id: string;
  order_id: string;
  status: string;
  printify_status: string | null;
  source: string;
  created_at: string;
}

export interface Address {
  address1?: string;
  address2?: string;
  city?: string;
  region?: string;
  zip?: string;
  country?: string;
}
/** What the checkout return pages send to finalize-order; prices come from the server. */
export interface CreateOrderFromCartInputT {
  provider: PaymentProviderT;
  paymentId: string;
  cart: CartWithItems;
  shippingAddress?: ShippingAddressT;
  billingAddress?: ShippingAddressT;
}
