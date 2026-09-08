import { createClient } from "@/lib/supabase/client";
import { ErrorClient } from "./errorClient";
import { getAuthenticatedHeaders } from "./authHelpers";
import type {
  CreateCreditPaymentPayloadI,
  CreateCreditPaymentResponseI,
  CreatePaymentIntentPayloadI,
  CreatePaymentIntentResponseI,
} from "@/types/payment";

export class StripeService {
  private static getSupabase() {
    return createClient();
  }

  /**
   * Create a Stripe Payment Intent for credit purchase
   */
  static async createCreditPayment(
    payload: CreateCreditPaymentPayloadI
  ): Promise<CreateCreditPaymentResponseI> {
    try {
      const headers = await getAuthenticatedHeaders("Stripe");

      const { data, error } = await this.getSupabase().functions.invoke(
        "create-credit-payment",
        {
          body: {
            amount: payload.amount,
            credits: payload.credits,
            currency: payload.currency || "eur",
          },
          headers,
        }
      );

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Stripe",
          action: "Create Credit Payment"
        });
      }

      if (!data?.clientSecret) {
        throw ErrorClient.handleError({
          error: new Error("No payment data received from server"),
          service: "Stripe",
          action: "Create Credit Payment"
        });
      }

      return {
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId || data.id,
      };
    } catch (error) {
      throw ErrorClient.handleError({
        error: error instanceof Error ? error : new Error("Unknown error"),
        service: "Stripe",
        action: "Create Credit Payment"
      });
    }
  }

  /**
   * Create a Stripe Payment Intent for checkout
   */
  static async createPaymentIntent(
    payload: CreatePaymentIntentPayloadI
  ): Promise<CreatePaymentIntentResponseI> {
    try {
      const headers = await getAuthenticatedHeaders("Stripe");

      const { data, error } = await this.getSupabase().functions.invoke(
        "create-payment-intent",
        {
          body: payload,
          headers,
        }
      );

      if (error) {
        throw ErrorClient.handleError({
          error,
          service: "Stripe",
          action: "Create Payment Intent"
        });
      }

      if (!data?.clientSecret || !data?.paymentIntentId) {
        throw ErrorClient.handleError({
          error: new Error("No payment data received from server"),
          service: "Stripe",
          action: "Create Payment Intent"
        });
      }

      return data as CreatePaymentIntentResponseI;
    } catch (error) {
      throw ErrorClient.handleError({
        error: error instanceof Error ? error : new Error("Unknown error"),
        service: "Stripe",
        action: "Create Payment Intent"
      });
    }
  }
}
