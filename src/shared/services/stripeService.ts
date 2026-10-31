import { createClient } from "@/lib/supabase/client";
import { AppError, ErrorClient } from "./errorClient";
import { getAuthenticatedHeaders } from "./authHelpers";
import { readFunctionErrorCode } from "@/lib/functionErrorCode";
import type { ErrorCodeT } from "@/shared-types";
import type {
  CreateCreditPaymentPayloadI,
  CreateCreditPaymentResponseI,
  CreatePaymentIntentPayloadI,
  CreatePaymentIntentResponseI,
} from "@/shared/types/payment";

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
            test_mode: payload.testMode === true,
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
        const code = await readFunctionErrorCode(error);
        throw new AppError(
          code ?? error.message,
          (code ?? undefined) as ErrorCodeT | undefined,
        );
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
