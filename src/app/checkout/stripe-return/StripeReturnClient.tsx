"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import PaymentSuccess from "@/features/checkout/ui/PaymentSuccess/PaymentSuccess";
import PaymentError from "@/features/checkout/ui/components/PaymentError";
import { OrderService } from "@/services/orderService";
import { CartService } from "@/services/cartService";
import { RefundService } from "@/services/refundService";
import { PaymentRecoveryService } from "@/services/paymentRecoveryService";
import type { CreatePrintifyOrderRequest } from "@/types/printifyOrder";
import { validatePrintifyLineItem } from "@/types/printifyOrder";
import { mapShippingAddressToPrintifyAddress } from "@/mappers/mapShippingAddressToPrintifyAddress";
import type { UserI } from "../../../../supabase/types";
import {
  useCreateOrderFromCart,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/queries/orderQueries";
import { useCreatePrintifyOrder } from "@/queries/printifyOrderQueries";
import { useClearCart } from "@/queries/cartQueries";
import { useUser } from "@/hooks/useAuth";

type PageStatus = "loading" | "processing" | "success" | "failed" | "error";

const STRIPE_PIPELINE_TIMEOUT_MS = 120_000; // 2 minutes
const STRIPE_CHECKOUT_DATA_KEY = "stripe_checkout_data";

class StripePipelineTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(
      `Order processing timed out after ${Math.round(timeoutMs / 1000)} seconds. ` +
        `A full refund has been initiated and will appear within 3–5 business days.`,
    );
    this.name = "StripePipelineTimeoutError";
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new StripePipelineTimeoutError(ms)),
      ms,
    );
  });

  return Promise.race([promise, timeout]).finally(() =>
    clearTimeout(timeoutId),
  );
}

export interface StripeCheckoutData {
  paymentIntentId: string;
  amount: number;
  lineItems: any[];
  shippingAddress: any;
  billing: any;
  cartId: string | null;
  timestamp: number;
}

export function getStoredStripeCheckoutData(): StripeCheckoutData | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STRIPE_CHECKOUT_DATA_KEY);
    if (!stored) return null;

    const data: StripeCheckoutData = JSON.parse(stored);

    // Check if data is not expired (30 minutes max)
    const maxAge = 30 * 60 * 1000; // 30 minutes
    if (Date.now() - data.timestamp > maxAge) {
      localStorage.removeItem(STRIPE_CHECKOUT_DATA_KEY);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function clearStoredStripeCheckoutData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STRIPE_CHECKOUT_DATA_KEY);
}

export default function StripeReturnClient() {
  // useSearchParams() requires a Suspense boundary for static prerendering
  return (
    <Suspense fallback={null}>
      <StripeReturnContent />
    </Suspense>
  );
}

function StripeReturnContent() {
  const t = useTranslations("checkout.returns.stripe");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  // React Query mutations
  const createOrderFromCart = useCreateOrderFromCart();
  const createPrintifyOrder = useCreatePrintifyOrder();
  const updateOrderStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const clearCart = useClearCart();
  const { data: user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading) return;
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processStripeReturn = async () => {
      try {
        // Get payment intent ID from URL
        const paymentIntent = searchParams.get("payment_intent");

        if (!paymentIntent) {
          setStatus("error");
          setErrorMessage(t("errorNoPaymentInfo"));
          return;
        }

        setPaymentIntentId(paymentIntent);

        // Get stored checkout data
        const checkoutData = getStoredStripeCheckoutData();
        if (!checkoutData) {
          setStatus("error");
          setErrorMessage(t("errorCheckoutDataExpired"));
          return;
        }

        // Verify user is authenticated
        if (!user) {
          setStatus("error");
          setErrorMessage(t("errorMustBeLoggedIn"));
          return;
        }

        // Idempotency check
        const finalizationDoneKey = `stripe_finalized_${paymentIntent}`;
        const finalizationLockKey = `stripe_finalizing_${paymentIntent}`;

        if (sessionStorage.getItem(finalizationDoneKey) === "true") {
          setStatus("success");
          return;
        }

        if (sessionStorage.getItem(finalizationLockKey) === "true") {
          return;
        }

        sessionStorage.setItem(finalizationLockKey, "true");
        setStatus("processing");

        // Extract checkout data
        const {
          lineItems,
          shippingAddress,
          amount,
          cartId,
          billing: billingAddress,
        } = checkoutData;
        const validatedLineItems = lineItems.map((item, index) =>
          validatePrintifyLineItem(item, index),
        );

        const idempotencyKey = `stripe_${paymentIntent}`;

        // Validate cart ID
        if (!cartId) {
          clearStoredStripeCheckoutData();
          setStatus("error");
          setErrorMessage(
            t("errorCartNotFound", { paymentId: paymentIntent }),
          );
          return;
        }

        // Record payment for recovery
        try {
          const cart = await CartService.getCart(cartId);
          await PaymentRecoveryService.recordPaymentForRecovery({
            paymentProvider: "stripe",
            paymentIntentId: paymentIntent,
            paymentStatus: "succeeded",
            amount,
            currency: "USD",
            cartSnapshot: cart,
            shippingAddress,
            lineItems: validatedLineItems,
            metadata: {
              idempotency_key: idempotencyKey,
            },
          });
        } catch (recoveryError) {
          console.error("Payment recovery recording failed:", recoveryError);
        }

        // Check for existing order
        const existingOrder =
          await OrderService.getOrderByIdempotencyKey(idempotencyKey);
        if (existingOrder) {
          sessionStorage.setItem(finalizationDoneKey, "true");
          sessionStorage.removeItem(finalizationLockKey);
          clearStoredStripeCheckoutData();
          setStatus("success");
          return;
        }

        // Helpers
        const triggerRefund = async (reason: string) => {
          try {
            if (amount > 0) {
              // Use real order ID if available, otherwise use temporary ID
              const refundOrderId =
                createdOrderId || `temp_stripe_${paymentIntent}`;

              await RefundService.processRefund({
                orderId: refundOrderId,
                paymentProvider: "stripe",
                amount,
                reason,
                stripePaymentIntentId: paymentIntent,
              });

              console.log(`✅ Refund triggered for order ${refundOrderId}`);
            }
          } catch (refundError) {
            console.error("❌ Refund initiation failed:", refundError);
            // Log to refund_failures table via RefundService
          }
        };

        const markOrderFailed = async (
          orderId: string,
          failureStatus: string,
        ) => {
          try {
            await updateOrderStatus.mutateAsync({
              orderId,
              status: failureStatus,
            });
            // Do NOT change payment_status - payment has been successfully captured
            // The payment_transactions table will track refund status
            // Keeping payment_status as "paid" accurately reflects that payment was captured
            console.log(`✅ Order ${orderId} marked as ${failureStatus}`);
          } catch (updateError) {
            console.error(
              `❌ Failed to mark order ${orderId} as ${failureStatus}:`,
              updateError,
            );
          }
        };

        let createdOrderId: string | null = null;

        // Run fulfillment pipeline with timeout
        const runFulfillmentPipeline = async () => {
          // Stage 1: Create DB order
          try {
            const cart = await CartService.getCart(cartId);
            createdOrderId =
              (await createOrderFromCart.mutateAsync({
                user: user as UserI,
                cart,
                paymentStatus: "paid",
                shippingAddress,
                billingAddress,
                idempotencyKey,
              })) ?? null;

            if (createdOrderId) {
              await OrderService.linkPaymentTransactionToOrder({
                paymentProvider: "stripe",
                paymentIntentId: paymentIntent,
                orderId: createdOrderId,
              });
            }
          } catch (orderError) {
            await triggerRefund("Order creation failed");
            throw new Error(t("orderCreationFailedRefund"));
          }

          if (!createdOrderId) {
            await triggerRefund("Order ID not returned");
            throw new Error(t("orderCreationFailedRefund"));
          }

          // Get order number
          try {
            const fullOrder = await OrderService.getOrder(createdOrderId);
            if (fullOrder?.order_number) {
              setOrderNumber(fullOrder.order_number);
            }
          } catch {
            // Non-blocking
          }

          // Stage 2: Create Printify order
          const printifyPayload: CreatePrintifyOrderRequest = {
            line_items: validatedLineItems,
            shipping_address:
              mapShippingAddressToPrintifyAddress(shippingAddress),
            is_test: false,
            metadata: {
              payment_intent_id: paymentIntent,
              order_id: createdOrderId,
              provider: "stripe",
            },
          };

          try {
            const printifyResult =
              await createPrintifyOrder.mutateAsync(printifyPayload);
            const printifyOrderId = printifyResult?.order?.id;

            if (printifyOrderId && createdOrderId) {
              await OrderService.updateOrder(createdOrderId, {
                printify_order_id: printifyOrderId,
              });
            }
          } catch (printifyError) {
            console.error("❌ Printify order creation failed:", printifyError);

            if (createdOrderId) {
              // Mark order as failed BEFORE triggering refund
              await markOrderFailed(
                createdOrderId,
                "unsuccessful_confirmation",
              );
              // Trigger refund with real order ID
              await triggerRefund("Printify fulfillment failed");
            } else {
              // No order created yet, trigger refund with temp ID
              console.warn(
                "⚠️ No order ID available, triggering refund with temp ID",
              );
              await triggerRefund("Order creation failed before Printify");
            }

            throw new Error(t("orderFulfillmentFailedRefund"));
          }

          // Stage 3: Mark payment recovered
          if (createdOrderId) {
            await PaymentRecoveryService.markPaymentRecovered(
              paymentIntent,
              "stripe",
              createdOrderId,
            );
          }

          // Stage 4: Clear cart
          try {
            await clearCart.mutateAsync();
          } catch {
            // Non-blocking
          }
        };

        try {
          await withTimeout(
            runFulfillmentPipeline(),
            STRIPE_PIPELINE_TIMEOUT_MS,
          );
        } catch (pipelineError) {
          if (pipelineError instanceof StripePipelineTimeoutError) {
            if (createdOrderId) {
              await markOrderFailed(createdOrderId, "fulfillment_failed");
            }
            await triggerRefund("Stripe checkout pipeline timed out");
          }
          throw pipelineError;
        }

        // Success!
        sessionStorage.setItem(finalizationDoneKey, "true");
        sessionStorage.removeItem(finalizationLockKey);
        clearStoredStripeCheckoutData();
        setStatus("success");
      } catch (err) {
        console.error("Stripe return error:", err);

        const currentPaymentIntent = searchParams.get("payment_intent");
        if (currentPaymentIntent) {
          sessionStorage.removeItem(
            `stripe_finalizing_${currentPaymentIntent}`,
          );
        }

        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : t("errorFallback"),
        );
      }
    };

    processStripeReturn();
  }, [isUserLoading, user, searchParams]);

  const handleRetryPayment = () => {
    router.push("/checkout");
  };

  const handleCreateAnother = () => {
    router.push("/dashboard");
  };

  // Loading state
  if (status === "loading" || status === "processing") {
    return (
      <div className="min-h-screen flex justify-center pt-32 lg:pt-40 px-6 bg-(--color-stamp-cream)">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <section
            className="bg-(--color-stamp-white) border border-(--color-stamp-divider) p-12 md:p-16 text-center relative overflow-hidden"
            aria-label={t("processingAria")}
          >
            <div
              className="absolute top-0 left-0 w-full h-1 bg-(--color-stamp-gold)"
              aria-hidden="true"
            />
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 bg-(--color-stamp-gold)/10 text-(--color-stamp-gold)"
              aria-hidden="true"
            >
              <Loader2 className="w-12 h-12 animate-spin" />
            </div>
            <Heading as="h1" variant="card" className="text-(--color-stamp-chocolate) mb-4">
              {status === "processing"
                ? t("completingTitle")
                : t("processingTitle")}
            </Heading>
            <Paragraph variant="sm" className="text-(--color-stamp-taupe) max-w-sm mx-auto">
              {status === "processing"
                ? t("completingMessage")
                : t("processingMessage")}
            </Paragraph>
          </section>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <PaymentSuccess
        details={{
          id: paymentIntentId || "",
          provider: "stripe",
          status: "succeeded",
          orderNumber:
            orderNumber ||
            (paymentIntentId
              ? `#ST-${paymentIntentId.slice(-6).toUpperCase()}`
              : "—"),
          totalPaid: t("totalPaid"),
          estimatedDelivery: t("estimatedDelivery"),
          confirmationEmail: "",
        }}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  // Failed state
  if (status === "failed") {
    return (
      <PaymentError
        details={{
          paymentId: paymentIntentId || "",
          orderNumber: paymentIntentId
            ? `#ST-${paymentIntentId.slice(-6).toUpperCase()}`
            : "—",
          amountDue: "—",
          attemptedOn: new Date().toLocaleString(),
          status: t("declinedStatus"),
          reasonTitle: t("paymentDeclinedTitle"),
          reasonMessage: errorMessage || t("paymentDeclinedMessage"),
          availableMethods: ["stripe", "paypal"],
        }}
        onTryAgain={handleRetryPayment}
        onSelectMethod={handleRetryPayment}
      />
    );
  }

  // Error state
  return (
    <div className="min-h-screen flex justify-center pt-32 lg:pt-40 px-6 bg-(--color-stamp-cream)">
      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <section
          className="bg-(--color-stamp-white) border border-(--color-stamp-divider) p-12 md:p-16 text-center relative overflow-hidden"
          aria-label={t("errorAria")}
        >
          <div
            className="absolute top-0 left-0 w-full h-1 bg-(--color-stamp-error)"
            aria-hidden="true"
          />
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 bg-(--color-stamp-error)/10 text-(--color-stamp-error)"
            aria-hidden="true"
          >
            <AlertCircle className="w-12 h-12" />
          </div>
          <Heading as="h1" variant="card" className="text-(--color-stamp-chocolate) mb-4">
            {t("somethingWentWrongTitle")}
          </Heading>
          <Paragraph variant="sm" className="text-(--color-stamp-taupe) max-w-sm mx-auto mb-12">
            {errorMessage || t("somethingWentWrongMessage")}
          </Paragraph>
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleRetryPayment}
              className="w-full py-5 h-auto font-heading text-xs tracking-widest uppercase bg-(--color-stamp-chocolate) text-(--color-stamp-white) hover:bg-(--color-stamp-chocolate)/90"
            >
              {t("returnToCheckout")}
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full py-5 h-auto font-heading text-xs tracking-widest uppercase border-(--color-stamp-divider) text-(--color-stamp-taupe) hover:border-(--color-stamp-gold) hover:text-(--color-stamp-chocolate)"
            >
              <Link href="/dashboard">{t("goToDashboard")}</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
