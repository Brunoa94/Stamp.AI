import { Database } from "../../database.types";

export type CreateOrderItemT = Database['public']['Tables']['order_items']['Insert']
export type OrderItemT = Database['public']['Tables']['order_items']['Row']
export type UpdateOrderItemT = Database['public']['Tables']['order_items']['Update']
