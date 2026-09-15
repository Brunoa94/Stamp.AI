import type { Database } from "@/types/database.types";
import type { OrderWithItemsT, CreateOrderT } from "@/types/order";
import type { CartItem } from "@/types/cart";
import type { FinalizeOrderCartItemT } from "@/types/finalizeOrder";
import { calculateOrderTotals as calculateServerOrderTotals } from "../../../supabase/functions/_shared/orderTotals";

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItemRow = Database['public']['Tables']['order_items']['Row'];

export class OrderServiceMapper {
  /**
   * Map cart items to order items
   */
  static mapCartItemsToOrderItems(
    cartItems: CartItem[],
    orderId: string
  ): Array<Omit<Database['public']['Tables']['order_items']['Insert'], 'id' | 'created_at' | 'updated_at'>> {
    return cartItems.map(item => {
      const unitPrice = item.unit_price ?? 0;
      const quantity = item.quantity ?? 1;
      return {
        order_id: orderId,
        product_id: item.product_id || null,
        product_name: item.product_name || 'Custom Product',
        variant_id: item.variant_id,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        custom_image_url: item.custom_image_url || '',
        design_config: item.custom_image_url
          ? { reusable_image_url: item.custom_image_url }
          : null,
      };
    });
  }

  /**
   * Map order row with items to OrderWithItemsT
   */
  static mapOrderRowToOrderWithItems(
    order: OrderRow,
    items: OrderItemRow[]
  ): OrderWithItemsT {
    return {
      ...order,
      order_items: items,
    };
  }

  /**
   * Calculate order totals from items (all amounts in cents).
   *
   * DISPLAY ONLY. Orders are minted server-side by the `finalize-order` edge
   * function, which reprices every item from the catalog and applies the same
   * shared rules (`_shared/orderTotals.ts`), so this mapper can never disagree
   * with the server about shipping or VAT.
   */
  static calculateOrderTotals(items: CartItem[], discountAmount: number = 0) {
    const subtotal = items.reduce((sum, item) => {
      return sum + ((item.unit_price ?? 0) * (item.quantity ?? 1));
    }, 0);

    const totals = calculateServerOrderTotals({
      subtotalCents: subtotal,
      discountCents: discountAmount,
    });

    return {
      subtotal: totals.subtotal_cents,
      tax_amount: totals.tax_cents,
      shipping_cost: totals.shipping_cents,
      discount_amount: totals.discount_cents,
      total_amount: totals.total_cents,
    };
  }

  /**
   * Generate unique order number
   */
  static generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Map CreateOrderT to OrderInsert
   */
  static mapCreateOrderToInsert(
    createOrder: CreateOrderT,
    orderNumber: string
  ): OrderInsert {
    return {
      order_number: orderNumber,
      user_id: createOrder.user_id,
      customer_email: createOrder.customer_email,
      customer_name: createOrder.customer_name,
      customer_phone: createOrder.customer_phone,
      shipping_address: createOrder.shipping_address as OrderInsert["shipping_address"],
      billing_address: createOrder.billing_address as OrderInsert["billing_address"],
      subtotal: createOrder.subtotal,
      tax_amount: createOrder.tax_amount,
      shipping_cost: createOrder.shipping_cost,
      discount_amount: createOrder.discount_amount,
      total_amount: createOrder.total_amount,
      currency: createOrder.currency || 'EUR',
      status: 'pending',
      payment_status: 'pending',
    };
  }

  /**
   * Map database order to public-facing order
   */
  static mapOrderRowToPublic(order: OrderRow) {
    return {
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      status: order.status,
      paymentStatus: order.payment_status,
      subtotal: order.subtotal,
      taxAmount: order.tax_amount,
      shippingCost: order.shipping_cost,
      discountAmount: order.discount_amount,
      totalAmount: order.total_amount,
      currency: order.currency,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      printifyOrderId: order.printify_order_id,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
    };
  }

  /**
   * Map tracking information to update payload
   */
  static mapTrackingToUpdate(trackingNumber: string, trackingUrl?: string) {
    return {
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
      shipped_at: new Date().toISOString(),
    };
  }

  /**
   * Map status to update payload
   */
  static mapStatusToUpdate(status: string) {
    return { status };
  }

  /**
   * Map payment status to update payload
   */
  static mapPaymentStatusToUpdate(paymentStatus: string) {
    return { payment_status: paymentStatus };
  }

  /**
   * Map cart item to order item insert format
   */
  static mapCartItemToOrderItem(cartItem: CartItem, orderId: string) {
    const unitPrice = cartItem.unit_price ?? 0;
    const quantity = cartItem.quantity ?? 1;
    const totalPrice = unitPrice * quantity;

    return {
      order_id: orderId,
      product_id: cartItem.product_id || null,
      variant_id: cartItem.variant_id || null,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      custom_image_url: cartItem.custom_image_url || "",
      product_name: cartItem.product?.name || "Custom Product",
      variant_name: cartItem.variant?.name || null,
      design_config: cartItem.custom_image_url
        ? {
            custom_image_url: cartItem.custom_image_url,
            reusable_image_url: cartItem.custom_image_url,
          }
        : null,
    };
  }

  /**
   * Cart items as sent to the `finalize-order` edge function. Only identity
   * and display fields are sent: the server reprices every item from the
   * catalog, so client prices never reach the order.
   */
  static mapCartItemsToFinalizeOrderItems(items: CartItem[]): FinalizeOrderCartItemT[] {
    return items.map((item) => ({
      id: item.id,
      product_id: item.product_id ?? null,
      product_name: item.product_name ?? item.product?.name ?? null,
      variant_id: item.variant_id ?? null,
      variant_name: item.variant_name ?? item.variant?.name ?? null,
      quantity: item.quantity ?? 1,
      custom_image_url: item.custom_image_url ?? null,
      printify_blueprint_id: item.printify_blueprint_id ?? item.product?.blueprint_id ?? null,
      is_selected: item.is_selected,
    }));
  }
}
