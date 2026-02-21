import type { Database } from "@/types/database.types";
import type { OrderT, OrderWithItemsT, CreateOrderT } from "@/types/order";
import type { CartItem } from "@/types/cart";
import type { UserI } from "@/types/auth";

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
    return cartItems.map(item => ({
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      custom_image_url: item.custom_image_url,
      design_id: item.design_id,
    }));
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
   * Calculate order totals from items
   */
  static calculateOrderTotals(items: CartItem[]) {
    const subtotal = items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);

    // Future: Add tax and shipping calculations
    const taxRate = 0; // 0% for now
    const taxAmount = subtotal * taxRate;
    const shippingCost = 0; // Free shipping for now
    const totalAmount = subtotal + taxAmount + shippingCost;

    return {
      subtotal,
      tax_amount: taxAmount,
      shipping_cost: shippingCost,
      total_amount: totalAmount,
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
      shipping_address: createOrder.shipping_address as any,
      billing_address: createOrder.billing_address as any,
      subtotal: createOrder.subtotal,
      tax_amount: createOrder.tax_amount,
      shipping_cost: createOrder.shipping_cost,
      discount_amount: createOrder.discount_amount,
      total_amount: createOrder.total_amount,
      currency: createOrder.currency || 'USD',
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
      fulfillmentStatus: order.fulfillment_status,
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
   * Map fulfillment status to update payload
   */
  static mapFulfillmentStatusToUpdate(fulfillmentStatus: string) {
    return { fulfillment_status: fulfillmentStatus };
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
    const totalPrice = cartItem.unit_price * cartItem.quantity;
    return {
      order_id: orderId,
      product_id: cartItem.product_id || null,
      variant_id: cartItem.variant_id || null,
      quantity: cartItem.quantity,
      unit_price: cartItem.unit_price,
      total_price: totalPrice,
      custom_image_url: cartItem.custom_image_url || "",
      product_name: cartItem.product?.name || "Custom Product",
      variant_name: cartItem.variant?.name || null,
      design_config: cartItem.custom_image_url ? { custom_image_url: cartItem.custom_image_url } : null,
    };
  }

  /**
   * Map user and totals to create order payload
   */
  static mapUserAndTotalsToCreateOrder(
    user: UserI,
    orderNumber: string,
    totals: {
      subtotal: number;
      tax_amount: number;
      shipping_cost: number;
      total_amount: number;
    },
    discountAmount: number = 0
  ): CreateOrderT {
    return {
      user_id: user.id,
      customer_email: user.email || "",
      order_number: orderNumber,
      status: "pending",
      payment_status: "pending",
      subtotal: totals.subtotal,
      shipping_cost: totals.shipping_cost,
      tax_amount: totals.tax_amount,
      discount_amount: discountAmount,
      total_amount: totals.total_amount,
    };
  }
}
