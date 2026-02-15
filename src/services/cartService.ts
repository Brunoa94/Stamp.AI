import { createClient } from "@/lib/supabase/client";
import {
  CartT,
  CartItemT,
  CartWithItems,
  AddToCartInput,
  UpdateCartItemInput,
  CartSummary,
} from "@/types/cart";
import {
  CartSchema,
  CartItemSchema,
  CartWithItemsSchema,
} from "@/schemas/cart";
import { z } from "zod";

export class CartService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Get or create cart for user/session
   */
  static async getOrCreateCart(userId?: string, sessionId?: string, userEmail?: string): Promise<CartT> {
    try {
      const supabase = this.getSupabase();

      // Try to find existing cart
      let query = supabase.from("carts").select("*");

      if (userId) {
        query = query.eq("user_id", userId);
      } else if (sessionId) {
        query = query.eq("session_id", sessionId);
      } else {
        throw new Error("Either userId or sessionId must be provided");
      }

      const { data: existingCart, error: fetchError } = await query.maybeSingle();

      if (fetchError) {
        throw new Error(`Supabase error: ${fetchError.message}`);
      }

      // Return existing cart if found
      if (existingCart) {
        const validatedCart = CartSchema.parse(existingCart);
        return validatedCart as CartT;
      }

      // Create new cart
      const { data: newCart, error: createError } = await supabase
        .from("carts")
        .insert({
          user_id: userId || null,
          session_id: sessionId || null,
          user_email: userEmail || null,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Supabase error: ${createError.message}`);
      }

      if (!newCart) {
        throw new Error("Failed to create cart");
      }

      const validatedCart = CartSchema.parse(newCart);

      return validatedCart as CartT;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Cart validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Get or create cart failed: ${error.message}`);
      }
      throw new Error("Get or create cart failed: Unknown error");
    }
  }

  /**
   * Get cart with items and product details
   */
  static async getCart(cartId: string): Promise<CartWithItems> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from("carts")
        .select(
          `
          *,
          cart_items (
            *,
            product:products (
              id,
              name,
              slug,
              base_price
            )
          )
        `
        )
        .eq("id", cartId)
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Cart not found with id: ${cartId}`);
      }

      const validatedCart = CartWithItemsSchema.parse(data);
      return validatedCart as CartWithItems;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Cart validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Get cart failed: ${error.message}`);
      }
      throw new Error("Get cart failed: Unknown error");
    }
  }

  /**
   * Add item to cart
   */
  static async addToCart(cartId: string, item: AddToCartInput): Promise<CartItemT> {
    try {
      const supabase = this.getSupabase();

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", cartId)
        .eq("product_id", item.product_id)
        .eq("variant_id", item.variant_id || "")
        .maybeSingle();

      // If item exists, update quantity
      if (existingItem) {
        return await this.updateCartItem(existingItem.id, {
          quantity: existingItem.quantity + item.quantity,
        });
      }

      // Add new item
      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cartId,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          custom_image_url: item.custom_image_url || null,
          design_id: item.design_id || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error("Failed to add item to cart");
      }

      const validatedItem = CartItemSchema.parse(data);
      return validatedItem as CartItemT;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Cart item validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Add to cart failed: ${error.message}`);
      }
      throw new Error("Add to cart failed: Unknown error");
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(
    itemId: string,
    update: UpdateCartItemInput
  ): Promise<CartItemT> {
    try {
      const supabase = this.getSupabase();

      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: update.quantity })
        .eq("id", itemId)
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        throw new Error(`Cart item not found with id: ${itemId}`);
      }

      const validatedItem = CartItemSchema.parse(data);
      return validatedItem as CartItemT;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Cart item validation failed: ${error.message}`);
      }
      if (error instanceof Error) {
        throw new Error(`Update cart item failed: ${error.message}`);
      }
      throw new Error("Update cart item failed: Unknown error");
    }
  }

  /**
   * Remove item from cart
   */
  static async removeCartItem(itemId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();

      const { error } = await supabase.from("cart_items").delete().eq("id", itemId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Remove cart item failed: ${error.message}`);
      }
      throw new Error("Remove cart item failed: Unknown error");
    }
  }

  /**
   * Clear all items from cart
   */
  static async clearCart(cartId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();

      const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Clear cart failed: ${error.message}`);
      }
      throw new Error("Clear cart failed: Unknown error");
    }
  }

  /**
   * Get cart summary (totals, item count)
   */
  static calculateCartSummary(cart?: CartWithItems): CartSummary {
    if(!cart){
      return{
        subtotal: 0,
        itemCount: 0,
        items: []
      }
    }

    const items = cart.cart_items || [];
    const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return {
      subtotal,
      itemCount,
      items,
    };
  }

  /**
   * Merge guest cart with user cart on login
   */
  static async mergeCart(guestCartId: string, userCartId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();

      // Get guest cart items
      const { data: guestItems, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", guestCartId);

      if (fetchError) {
        throw new Error(`Supabase error: ${fetchError.message}`);
      }

      if (!guestItems || guestItems.length === 0) {
        return; // Nothing to merge
      }

      // Move items to user cart
      for (const item of guestItems) {
        await this.addToCart(userCartId, {
          product_id: item.product_id!,
          variant_id: item.variant_id || undefined,
          quantity: item.quantity,
          unit_price: item.unit_price,
          custom_image_url: item.custom_image_url || undefined,
          design_id: item.design_id || undefined,
        });
      }

      // Delete guest cart
      await supabase.from("carts").delete().eq("id", guestCartId);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Merge cart failed: ${error.message}`);
      }
      throw new Error("Merge cart failed: Unknown error");
    }
  }
}
