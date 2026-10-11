import type { Database } from "@/shared/types/database.types";
import type { CreateOrderT, OrderWithItemsT } from "@/shared/types/order";
import type { CartItem } from "@/shared/types/cart";
import type { UserI } from "../../../../supabase/types";
import type { ShippingAddressT } from "@/shared/schemas/checkout";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export class OrderServiceMapper {
  /**
   * Map cart items to order items
   */
  static mapCartItemsToOrderItems(
    cartItems: CartItem[],
    orderId: string,
  ): Array<
    Omit<
      Database["public"]["Tables"]["order_items"]["Insert"],
      "id" | "created_at" | "updated_at"
    >
  > {
    return cartItems.map((item) => {
      const unitPrice = item.unit_price ?? 0;
      const quantity = item.quantity ?? 1;
      return {
        order_id: orderId,
        product_id: item.product_id || null,
        product_name: item.product_name || "Custom Product",
        variant_id: item.variant_id,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        custom_image_url: item.custom_image_url || "",
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
    items: OrderItemRow[],
  ): OrderWithItemsT {
    return {
      ...order,
      order_items: items,
    };
  }

  /**
   * Map CreateOrderT to OrderInsert
   */
  static mapCreateOrderToInsert(
    createOrder: CreateOrderT,
    orderNumber: string,
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
      currency: createOrder.currency || "EUR",
      status: "pending",
      payment_status: "pending",
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
   * Identity and display fields of the selected cart rows sent to
   * finalize-order. Prices are deliberately left out: the server uses the
   * pricing stored with the payment.
   */
  static mapCartItemsToFinalizeItems(cartItems: CartItem[]) {
    return cartItems.map((item) => ({
      id: item.id,
      product_id: item.product_id || null,
      variant_id: item.variant_id || null,
      quantity: item.quantity ?? 1,
      product_name: item.product_name || item.product?.name || null,
      variant_name: item.variant_name || item.variant?.name || null,
      custom_image_url: item.custom_image_url || null,
    }));
  }
}
