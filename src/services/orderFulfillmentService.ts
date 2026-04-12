import { UserI } from "@/types/auth";
import type { PaymentExecutionResult } from "@/types/payment";
import { CartWithItems } from "@/types/cart";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import { validatePrintifyLineItem } from "@/types/printifyOrder";
import type { ShippingAddressT } from "@/schemas/checkout";
import { OrderService } from "./orderService";
import { PrintifyService } from "./printifyService";
import { CartService } from "./cartService";
import { RefundService } from "./refundService";
import { mapShippingAddressToPrintifyAddress } from "@/mappers/mapShippingAddressToPrintifyAddress";

/**
 * Input required to run the full order fulfillment pipeline
 */
export interface FulfillmentInput {
  user: UserI;
  cart: CartWithItems;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  payment: PaymentExecutionResult;
  orderAmount: number;
  isTestMode?: boolean;
}

/**
 * Result returned by OrderFulfillmentService.fulfill()
 */
export interface FulfillmentResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Orchestrates the complete post-payment order fulfillment pipeline,
 * uniformly for all payment methods (Stripe, PayPal, Mollie).
 *
 * Pipeline:
 *   1. Create local order in the database (with automatic retries)
 *   2. Create Printify production order
 *   3. Update order status to "confirmed"
 *   4. Clear the cart
 *
 * On order creation failure after all retries: auto-initiates a refund.
 */
export class OrderFulfillmentService {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_BASE_DELAY_MS = 500;

  static async fulfill(input: FulfillmentInput): Promise<FulfillmentResult> {
    const {
      user,
      cart,
      lineItems,
      shippingAddress,
      payment,
      orderAmount,
      isTestMode = false,
    } = input;

    // ── Step 1: Create local order (with retries) ────────────────────────────
    let orderId: string | null = null;
    try {
      orderId = await this.createOrderWithRetry(user, cart);
      console.log(`✅ Order created: ${orderId}`);
    } catch (orderError) {
      console.error("❌ All order creation attempts failed. Initiating refund...");
      await this.tryRefund({
        payment,
        orderAmount,
        fallbackOrderId: `temp_${payment.paymentId}`,
      });
      return {
        success: false,
        error: this.buildRefundErrorMessage(orderError),
      };
    }

    // ── Step 2: Create Printify order ────────────────────────────────────────
    try {
      const validatedLineItems = lineItems.map((item, index) =>
        validatePrintifyLineItem(item, index)
      );
      await PrintifyService.createPrintifyOrder({
        line_items: validatedLineItems,
        shipping_address: mapShippingAddressToPrintifyAddress(shippingAddress),
        is_test: isTestMode,
        metadata: {
          payment_intent_id: payment.paymentId,
          order_id: orderId ?? `order_${Date.now()}`,
          ...(payment.provider === "mollie" ? { provider: "mollie" } : {}),
        },
      });
      console.log("✅ Printify order created");
    } catch (printifyError) {
      console.error("❌ Printify order creation failed:", printifyError);
      return {
        success: false,
        orderId: orderId ?? undefined,
        error:
          "Your order was placed but we encountered an issue sending it for production. Our team will review and contact you.",
      };
    }

    // ── Step 3: Mark order as confirmed ──────────────────────────────────────
    if (orderId) {
      try {
        await OrderService.updateOrderStatus(orderId, "confirmed");
        console.log(`✅ Order ${orderId} confirmed`);
      } catch (statusError) {
        // Non-critical — order still placed; log and continue
        console.error("Failed to update order status to confirmed:", statusError);
      }
    }

    // ── Step 4: Clear cart (non-critical) ─────────────────────────────────────
    try {
      await CartService.clearCart(cart.id);
      console.log("✅ Cart cleared");
    } catch (cartError) {
      console.error("Failed to clear cart:", cartError);
    }

    return { success: true, orderId: orderId ?? undefined };
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private static async createOrderWithRetry(
    user: UserI,
    cart: CartWithItems
  ): Promise<string> {
    let lastError: unknown;
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const id = await OrderService.createOrderFromCart({
          user,
          cart,
          paymentStatus: "paid",
        });
        return id;
      } catch (err) {
        lastError = err;
        console.warn(
          `Order creation attempt ${attempt + 1}/${this.MAX_RETRIES} failed:`,
          err
        );
        if (attempt < this.MAX_RETRIES - 1) {
          await new Promise((r) =>
            setTimeout(r, this.RETRY_BASE_DELAY_MS * (attempt + 1))
          );
        }
      }
    }
    throw lastError;
  }

  private static async tryRefund({
    payment,
    orderAmount,
    fallbackOrderId,
  }: {
    payment: PaymentExecutionResult;
    orderAmount: number;
    fallbackOrderId: string;
  }): Promise<void> {
    try {
      await RefundService.processRefund({
        orderId: fallbackOrderId,
        paymentProvider: payment.provider,
        amount: orderAmount,
        reason: "Order creation failed after retry attempts",
        stripePaymentIntentId:
          payment.provider === "stripe" ? payment.paymentId : undefined,
        paypalCaptureId:
          payment.provider === "paypal" ? payment.captureId : undefined,
        molliePaymentId:
          payment.provider === "mollie" ? payment.paymentId : undefined,
      });
      console.log("✅ Refund initiated");
    } catch (refundError) {
      console.error("❌ Refund initiation failed:", refundError);
    }
  }

  private static buildRefundErrorMessage(error: unknown): string {
    const reason =
      error instanceof Error
        ? error.message
        : "Order creation failed after retry attempts.";
    return `${reason} A full refund has been initiated and will appear within 3–5 business days.`;
  }
}
