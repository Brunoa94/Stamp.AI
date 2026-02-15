import { Database } from "../../database.types";

export type CartT = Database['public']['Tables']['carts']['Row'];
export type CreateCartT = Database['public']['Tables']['carts']['Insert'];
export type UpdateCartT = Database['public']['Tables']['carts']['Update'];

export type CartItemT = Database['public']['Tables']['cart_items']['Row'];
export type CreateCartItemT = Database['public']['Tables']['cart_items']['Insert'];
export type UpdateCartItemT = Database['public']['Tables']['cart_items']['Update'];

export interface CartItemWithProduct extends CartItemT {
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
  cart_items: CartItemWithProduct[];
}

export interface AddToCartInput {
  product_id: string | null;
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
  items: CartItemWithProduct[];
}
