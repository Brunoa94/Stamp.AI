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
    blueprint_id?: number | null;
    print_provider_id?: number | null;
    print_areas?: any | null;
  };
  variant?: {
    id: string;
    name: string;
  };
}

export interface CartWithItems extends CartT {
  cart_items: CartItem[];
}

// AddToCartInput based on database Insert type, excluding auto-managed fields
export type AddToCartInput = Omit<
  CreateCartItemT,
  'id' | 'cart_id' | 'created_at' | 'updated_at'
> & {
  quantity: number; // Make quantity required for cart operations
}

// UpdateCartItemInput for updating cart item quantities
export type UpdateCartItemInput = Pick<UpdateCartItemT, 'quantity'> & {
  quantity: number; // Make quantity required for update operations
}

export interface CartSummary {
  subtotal: number;
  itemCount: number;
  items: CartItem[];
}
