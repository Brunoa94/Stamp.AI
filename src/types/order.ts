import { Database } from "../../database.types";

export type CreateOrderT = Database['public']['Tables']['orders']['Insert']
export type OrderT = Database['public']['Tables']['orders']['Row']
export type UpdateOrderT = Database['public']['Tables']['orders']['Update']

export type OrderItemT = Database['public']['Tables']['order_items']['Row']
export type CreateOrderItemT = Database['public']['Tables']['order_items']['Insert']
export type UpdateOrderItemT = Database['public']['Tables']['order_items']['Update']

export interface OrderWithItemsT extends OrderT {
  order_items: OrderItemT[]
}

export interface Address {
  address1?: string;
  address2?: string;
  city?: string;
  region?: string;
  zip?: string;
  country?: string;
}