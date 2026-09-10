import { createClient } from "@/lib/supabase/client";
import {
  AddToCartInput,
  CartItem,
  CartSummary,
  CartT,
  CartWithItems,
  UpdateCartItemInput,
} from "@/types/cart";
import {
  addToCartSchema,
  CartSchema,
  updateCartItemSchema,
} from "@/schemas/cart";
import { CartServiceMapper } from "@/mappers/services/cartServiceMapper";
import { ErrorClient } from "./errorClient";

export class CartService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Get or create cart for user/session
   */
  static async getOrCreateCart(
    userId?: string,
    sessionId?: string,
    userEmail?: string,
  ): Promise<CartT> {
    try {
      const supabase = this.getSupabase();

      // Try to find existing cart
      let query = supabase.from("carts").select("*");

      if (userId) {
        query = query.eq("user_id", userId);
      } else if (sessionId) {
        query = query.eq("session_id", sessionId);
      } else {
        throw ErrorClient.handleError({
          error: new Error("Either userId or sessionId must be provided"),
          service: "Cart",
          action: "Get Or Create Cart",
        });
      }

      const { data: existingCart, error: fetchError } = await query
        .maybeSingle();

      if (fetchError) {
        throw ErrorClient.handleError({
          error: fetchError,
          service: "Cart",
          action: "Get Or Create Cart",
        });
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
        throw ErrorClient.handleError({
          error: createError,
          service: "Cart",
          action: "Get Or Create Cart",
        });
      }

      if (!newCart) {
        throw ErrorClient.handleError({
          error: new Error("Failed to create cart"),
          service: "Cart",
          action: "Get Or Create Cart",
        });
      }

      const validatedCart = CartSchema.parse(newCart);

      return validatedCart as CartT;
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Cart",
        action: "Get Or Create Cart",
      });
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
            *
          )
        `,
        )
        .eq("id", cartId)
        .single();

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Cart",
          action: "Get Cart",
        });
      }

      if (!data) {
        throw ErrorClient.handleError({
          error: new Error(`Cart not found with id: ${cartId}`),
          service: "Cart",
          action: "Get Cart",
        });
      }

      return data as CartWithItems;
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Cart",
        action: "Get Cart",
      });
    }
  }

  /**
   * Add item to cart
   * Returns CartItem with full product and variant information
   */
  static async addToCart(
    cartId: string,
    item: AddToCartInput,
  ): Promise<CartItem> {
    try {
      // DEBUG: Log raw input before validation
      console.log("[CartService.addToCart] Raw input received:", {
        cartId,
        item,
        hasProductName: "product_name" in item,
        hasUnitPrice: "unit_price" in item,
        productNameValue: item.product_name,
        unitPriceValue: item.unit_price,
      });

      // Validate input
      const validatedInput = addToCartSchema.parse(item);

      // DEBUG: Log validated input
      console.log("[CartService.addToCart] Validated input:", {
        validatedInput,
        hasProductName: "product_name" in validatedInput,
        hasUnitPrice: "unit_price" in validatedInput,
      });

      const supabase = this.getSupabase();

      // Build RPC params explicitly to trace what's being sent
      const rpcParams = {
        p_cart_id: cartId,
        p_product_id: validatedInput.product_id || null,
        p_variant_id: validatedInput.variant_id,
        p_quantity: validatedInput.quantity,
        p_custom_image_url: validatedInput.custom_image_url || null,
        p_product_name: validatedInput.product_name || "Product",
        p_unit_price: validatedInput.unit_price,
      };

      // DEBUG: Log exact RPC params being sent to Supabase
      console.log("[CartService.addToCart] RPC params to Supabase:", rpcParams);

      // Validate critical fields
      if (!rpcParams.p_product_name) {
        console.error("[CartService.addToCart] CRITICAL: p_product_name is missing!");
      }
      if (typeof rpcParams.p_unit_price !== "number") {
        console.error("[CartService.addToCart] CRITICAL: p_unit_price is not a number!", {
          type: typeof rpcParams.p_unit_price,
          value: rpcParams.p_unit_price,
        });
      }

      // CRITICAL: Use atomic UPSERT to prevent duplicate cart items
      // Handles race condition where same item added twice quickly
      const { data, error } = await supabase.rpc("upsert_cart_item", rpcParams);

      // DEBUG: Log response
      console.log("[CartService.addToCart] RPC response:", { data, error });

      if (error) {
        console.error("[CartService.addToCart] RPC error:", error);
        throw ErrorClient.handleError({
          error,
          service: "Cart",
          action: "Add To Cart",
        });
      }

      if (!data) {
        throw ErrorClient.handleError({
          error: new Error("Failed to add item to cart"),
          service: "Cart",
          action: "Add To Cart",
        });
      }

      return data as CartItem;
    } catch (error) {
      console.error("[CartService.addToCart] Exception caught:", error);
      throw ErrorClient.handleError({
        error,
        service: "Cart",
        action: "Add To Cart",
      });
    }
  }

  /**
   * Update cart item quantity
   * Returns CartItem with full product and variant information
   */
  static async updateCartItem(
    itemId: string,
    update: UpdateCartItemInput,
  ): Promise<CartItem> {
    try {
      // Validate input
      const validatedUpdate = updateCartItemSchema.parse(update);

      const supabase = this.getSupabase();

      // Use mapper to create update object
      const updateData = CartServiceMapper.mapQuantityUpdate(
        validatedUpdate.quantity,
      );

      const { data, error } = await supabase
        .from("cart_items")
        .update(updateData)
        .eq("id", itemId)
        .select("*")
        .single();

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Cart",
          action: "Update Cart Item",
        });
      }

      if (!data) {
        throw ErrorClient.handleError({
          error: new Error(`Cart item not found with id: ${itemId}`),
          service: "Cart",
          action: "Update Cart Item",
        });
      }

      return data as CartItem;
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Cart",
        action: "Update Cart Item",
      });
    }
  }

  /**
   * Remove item from cart
   */
  static async removeCartItem(itemId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();

      const { error } = await supabase.from("cart_items").delete().eq(
        "id",
        itemId,
      );

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Cart",
          action: "Remove Cart Item",
        });
      }
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Cart",
        action: "Remove Cart Item",
      });
    }
  }

  /**
   * Clear all items from cart
   */
  static async clearCart(cartId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();

      const { error } = await supabase.from("cart_items").delete().eq(
        "cart_id",
        cartId,
      );

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Cart",
          action: "Clear Cart",
        });
      }
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Cart",
        action: "Clear Cart",
      });
    }
  }

  /**
   * Get cart summary (totals, item count)
   * Delegates to CartServiceMapper for calculation logic
   */
  static calculateCartSummary(cart?: CartWithItems): CartSummary {
    if (!cart) {
      return {
        subtotal: 0,
        itemCount: 0,
        items: [],
      };
    }

    const items = cart.cart_items || [];
    return CartServiceMapper.mapItemsToCartSummary(items);
  }

  /**
   * Update which cart items are selected for checkout
   * Called when user proceeds to checkout to persist their selection
   */
  static async updateCartItemsSelection(
    cartId: string,
    selectedItemIds: string[],
  ): Promise<void> {
    try {
      const supabase = this.getSupabase();

      const { error } = await supabase.rpc("update_cart_items_selection", {
        p_cart_id: cartId,
        p_selected_item_ids: selectedItemIds,
      });

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Cart",
          action: "Update Cart Items Selection",
        });
      }
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Cart",
        action: "Update Cart Items Selection",
      });
    }
  }

  /**
   * Merge guest cart with user cart on login
   */
  static async mergeCart(
    guestCartId: string,
    userCartId: string,
  ): Promise<void> {
    try {
      const supabase = this.getSupabase();

      // Get guest cart items
      const { data: guestItems, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("cart_id", guestCartId);

      if (fetchError) {
        throw ErrorClient.handleError({
          error: fetchError,
          service: "Cart",
          action: "Merge Cart",
        });
      }

      if (!guestItems || guestItems.length === 0) {
        return; // Nothing to merge
      }

      // Move items to user cart using mapper
      for (const item of guestItems) {
        const addToCartInput = CartServiceMapper.mapCartItemRowToAddToCartInput(
          item,
        );
        await this.addToCart(userCartId, addToCartInput);
      }

      // Delete guest cart
      await supabase.from("carts").delete().eq("id", guestCartId);
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "Cart",
        action: "Merge Cart",
      });
    }
  }
}
