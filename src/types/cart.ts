import { Database } from "./database.types";

export type CartT = Database['public']['Tables']['carts']['Row'];
export type CreateCartT = Database['public']['Tables']['carts']['Insert'];
export type UpdateCartT = Database['public']['Tables']['carts']['Update'];

// Base database types (used internally for service operations)
type CartItemRow = Database['public']['Tables']['cart_items']['Row'];
export type CreateCartItemT = Database['public']['Tables']['cart_items']['Insert'];
export type UpdateCartItemT = Database['public']['Tables']['cart_items']['Update'];

// Primary cart item type with relations (use this in components and business logic)
export interface CartItem extends CartItemRow {
  product?: {
    id: string;
    name: string;
    slug: string;
    base_price: number;
  };
  variant?: {
    id: string;
    name: string;
  };
}

export interface CartWithItems extends CartT {
  cart_items: CartItem[];
}

export interface AddToCartInput {
  product_id: string | null;
  product_name: string;
  variant_id?: string | null;
  quantity: number;
  unit_price: number;
  custom_image_url: string;
  design_id?: string;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CartSummary {
  subtotal: number;
  itemCount: number;
  items: CartItem[];
}
