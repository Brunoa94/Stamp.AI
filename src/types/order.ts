import { Database } from "../../database.types";

export type CreateOrderT = Database['public']['Tables']['orders']['Insert']
export type OrderT = Database['public']['Tables']['orders']['Row']
export type UpdateOrderT = Database['public']['Tables']['orders']['Update']