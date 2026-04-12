import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { CartWithItems } from "@/types/cart";

export interface PaymentRecoveryRecordI {
  id: string;
  payment_provider: "stripe" | "paypal" | "mollie";
  payment_intent_id: string;
  amount: number;
  currency: string;
  cart_snapshot: CartWithItems;
  shipping_address: ShippingAddressT;
  line_items: PrintifyLineItem[];
  created_at: string;
}

export interface RecordPaymentPayloadI {
  paymentProvider: "stripe" | "paypal" | "mollie";
  paymentIntentId: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  cartSnapshot: CartWithItems;
  shippingAddress: ShippingAddressT;
  lineItems: PrintifyLineItem[];
  metadata?: Record<string, unknown>;
}

export class PaymentRecoveryService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Record a payment for recovery before processing
   * CRITICAL: Call this BEFORE attempting order creation
   *
   * If browser crashes/closes before order is created, this enables recovery
   */
  static async recordPaymentForRecovery(
    payload: RecordPaymentPayloadI
  ): Promise<string | null> {
    try {
      const supabase = this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn("⚠️ Cannot record payment recovery - user not authenticated");
        return null;
      }

      const { data, error } = await supabase.rpc(
        "record_payment_for_recovery",
        {
          p_payment_provider: payload.paymentProvider,
          p_payment_intent_id: payload.paymentIntentId,
          p_payment_status: payload.paymentStatus,
          p_user_id: user.id,
          p_user_email: user.email || "",
          p_amount: payload.amount,
          p_currency: payload.currency,
          p_cart_snapshot: payload.cartSnapshot as unknown as Record<string, unknown>,
          p_shipping_address: payload.shippingAddress as unknown as Record<string, unknown>,
          p_line_items: payload.lineItems as unknown as Record<string, unknown>[],
          p_metadata: payload.metadata || null,
        }
      );

      if (error) {
        console.error("Failed to record payment for recovery:", error);
        // Don't throw - this is non-critical for immediate payment flow
        return null;
      }

      console.log("✅ Payment recorded for recovery:", data);
      return data as string;
    } catch (error) {
      console.error("Exception recording payment for recovery:", error);
      // Non-blocking error
      return null;
    }
  }

  /**
   * Mark a payment as successfully recovered
   */
  static async markPaymentRecovered(
    paymentIntentId: string,
    paymentProvider: "stripe" | "paypal" | "mollie",
    orderId: string
  ): Promise<void> {
    try {
      const supabase = this.getSupabase();

      const { error } = await supabase.rpc("mark_payment_recovered", {
        p_payment_intent_id: paymentIntentId,
        p_payment_provider: paymentProvider,
        p_order_id: orderId,
      });

      if (error) {
        console.error("Failed to mark payment as recovered:", error);
      } else {
        console.log("✅ Payment marked as recovered");
      }
    } catch (error) {
      console.error("Exception marking payment as recovered:", error);
    }
  }

  /**
   * Get pending payment recoveries for current user
   * Returns payments that succeeded but haven't been finalized into orders
   */
  static async getPendingRecoveries(): Promise<PaymentRecoveryRecordI[]> {
    try {
      const supabase = this.getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return [];
      }

      const { data, error } = await supabase.rpc(
        "get_pending_payment_recoveries",
        {
          p_user_id: user.id,
          p_hours_ago: 24, // Look back 24 hours
        }
      );

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "PaymentRecovery",
          action: "Get Pending Recoveries",
        });
      }

      return (data || []) as PaymentRecoveryRecordI[];
    } catch (error) {
      throw ErrorClient.handleError({
        error,
        service: "PaymentRecovery",
        action: "Get Pending Recoveries",
      });
    }
  }

  /**
   * Process a payment recovery
   * Completes order creation for a previously successful payment
   */
  static async processRecovery(
    recoveryRecord: PaymentRecoveryRecordI
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      const supabase = this.getSupabase();

      // Call recovery edge function
      const { data, error } = await supabase.functions.invoke(
        "process-payment-recovery",
        {
          body: {
            recovery_id: recoveryRecord.id,
            payment_provider: recoveryRecord.payment_provider,
            payment_intent_id: recoveryRecord.payment_intent_id,
            cart_snapshot: recoveryRecord.cart_snapshot,
            shipping_address: recoveryRecord.shipping_address,
            line_items: recoveryRecord.line_items,
          },
        }
      );

      if (error) {
        console.error("Recovery processing failed:", error);
        return {
          success: false,
          error: error.message || "Recovery processing failed",
        };
      }

      console.log("✅ Payment recovery processed successfully:", data);

      return {
        success: true,
        orderId: data?.order_id,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Exception during payment recovery:", error);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Dismiss a payment recovery (user doesn't want to recover)
   */
  static async dismissRecovery(recoveryId: string): Promise<void> {
    try {
      const supabase = this.getSupabase();

      // Mark as cancelled
      const { error } = await supabase
        .from("payment_recovery")
        .update({
          recovery_status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", recoveryId);

      if (error) {
        console.error("Failed to dismiss recovery:", error);
      } else {
        console.log("✅ Recovery dismissed");
      }
    } catch (error) {
      console.error("Exception dismissing recovery:", error);
    }
  }
}
