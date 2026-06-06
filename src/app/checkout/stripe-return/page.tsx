"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/features/ui/button";
import { PageDividers } from "@/features/ui/page-dividers";
import PaymentSuccess from "@/features/checkout/ui/PaymentSuccess/PaymentSuccess";
import PaymentError from "@/features/checkout/ui/components/PaymentError";
import { OrderService } from "@/services/orderService";
import { CartService } from "@/services/cartService";
import { RefundService } from "@/services/refundService";
import { PaymentRecoveryService } from "@/services/paymentRecoveryService";
import type { CreatePrintifyOrderRequest } from "@/types/printifyOrder";
import { validatePrintifyLineItem } from "@/types/printifyOrder";
import { mapShippingAddressToPrintifyAddress } from "@/mappers/mapShippingAddressToPrintifyAddress";
import { paymentSuccessTheme, paymentErrorTheme } from "@/theme/components";
import type { UserI } from "@/types/auth";
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
        `A full refund has been initiated and will appear within 3–5 business days.`
    );
    this.name = "StripePipelineTimeoutError";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new StripePipelineTimeoutError(ms)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export interface StripeCheckoutData {
  paymentIntentId: string;
  amount: number;
  lineItems: any[];
  shippingAddress: any;
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

export default function StripeReturnPage() {
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
          setErrorMessage("Payment information not found. Please try again from the checkout page.");
          return;
        }

        setPaymentIntentId(paymentIntent);

        // Get stored checkout data
        const checkoutData = getStoredStripeCheckoutData();
        if (!checkoutData) {
          setStatus("error");
          setErrorMessage(
            "Checkout data expired or not found. Please try again from the checkout page."
          );
          return;
        }

        // Verify user is authenticated
        if (!user) {
          setStatus("error");
          setErrorMessage(
            "You must be logged in to complete your order. Please log in and try again."
          );
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
        const { lineItems, shippingAddress, amount, cartId } = checkoutData;
        const validatedLineItems = lineItems.map((item, index) =>
          validatePrintifyLineItem(item, index)
        );

        const idempotencyKey = `stripe_${paymentIntent}`;

        // Validate cart ID
        if (!cartId) {
          clearStoredStripeCheckoutData();
          setStatus("error");
          setErrorMessage(
            "Cart information not found. Your payment was processed but we couldn't create your order. Please contact support with payment ID: " + paymentIntent
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
        const existingOrder = await OrderService.getOrderByIdempotencyKey(idempotencyKey);
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
              await RefundService.processRefund({
                orderId: `temp_stripe_${paymentIntent}`,
                paymentProvider: "stripe",
                amount,
                reason,
                stripePaymentIntentId: paymentIntent,
              });
            }
          } catch (refundError) {
            console.error("Refund initiation failed:", refundError);
          }
        };

        const markOrderFailed = async (orderId: string, failureStatus: string) => {
          try {
            await updateOrderStatus.mutateAsync({ orderId, status: failureStatus });
            await updatePaymentStatus.mutateAsync({ orderId, paymentStatus: "refund_pending" });
          } catch (updateError) {
            console.error(`Failed to mark order ${orderId} as ${failureStatus}:`, updateError);
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
            throw new Error(
              "Order creation failed. A full refund has been initiated."
            );
          }

          if (!createdOrderId) {
            await triggerRefund("Order ID not returned");
            throw new Error(
              "Order creation failed. A full refund has been initiated."
            );
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
            shipping_address: mapShippingAddressToPrintifyAddress(shippingAddress),
            is_test: false,
            metadata: {
              payment_intent_id: paymentIntent,
              order_id: createdOrderId,
              provider: "stripe",
            },
          };

          try {
            const printifyResult = await createPrintifyOrder.mutateAsync(printifyPayload);
            const printifyOrderId = printifyResult?.order?.id;

            if (printifyOrderId && createdOrderId) {
              await OrderService.updateOrder(createdOrderId, {
                printify_order_id: printifyOrderId,
              });
            }
          } catch (printifyError) {
            if (createdOrderId) {
              await markOrderFailed(createdOrderId, "unsuccessful_confirmation");
            }
            await triggerRefund("Printify fulfillment failed");
            throw new Error(
              "Order fulfillment failed. A full refund has been initiated."
            );
          }

          // Stage 3: Mark payment recovered
          if (createdOrderId) {
            await PaymentRecoveryService.markPaymentRecovered(paymentIntent, "stripe", createdOrderId);
          }

          // Stage 4: Clear cart
          try {
            await clearCart.mutateAsync();
          } catch {
            // Non-blocking
          }
        };

        try {
          await withTimeout(runFulfillmentPipeline(), STRIPE_PIPELINE_TIMEOUT_MS);
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
          sessionStorage.removeItem(`stripe_finalizing_${currentPaymentIntent}`);
        }

        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to process Stripe payment"
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
      <div className={paymentSuccessTheme.page}>
        <PageDividers />
        <div className={paymentSuccessTheme.wrapper}>
          <section className={paymentSuccessTheme.card} aria-label="Processing payment">
            <div className={paymentSuccessTheme.topAccent} aria-hidden="true" />
            <div className={paymentSuccessTheme.iconWrapper} aria-hidden="true">
              <Loader2 className="w-12 h-12 animate-spin" />
            </div>
            <h1 className={paymentSuccessTheme.title}>
              {status === "processing" ? "Completing Your Payment" : "Processing Payment"}
            </h1>
            <p className={paymentSuccessTheme.subtitle}>
              {status === "processing"
                ? "Please wait while we finalize your Stripe payment..."
                : "Please wait while we verify your payment with Stripe..."}
            </p>
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
          orderNumber: orderNumber || (paymentIntentId ? `#ST-${paymentIntentId.slice(-6).toUpperCase()}` : "—"),
          totalPaid: "Paid via Stripe",
          estimatedDelivery: "7–10 business days",
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
          orderNumber: paymentIntentId ? `#ST-${paymentIntentId.slice(-6).toUpperCase()}` : "—",
          amountDue: "—",
          attemptedOn: new Date().toLocaleString(),
          status: "Declined",
          reasonTitle: "Payment declined",
          reasonMessage:
            errorMessage ||
            "Your Stripe payment could not be processed. Please try again or use a different payment method.",
          availableMethods: ["stripe", "paypal"],
        }}
        onTryAgain={handleRetryPayment}
        onSelectMethod={handleRetryPayment}
      />
    );
  }

  // Error state
  return (
    <div className={paymentErrorTheme.page}>
      <PageDividers />
      <div className={paymentErrorTheme.wrapper}>
        <section className={paymentErrorTheme.card} aria-label="Error">
          <div className={paymentErrorTheme.topAccent} aria-hidden="true" />
          <div className={paymentErrorTheme.iconWrapper} aria-hidden="true">
            <AlertCircle className={paymentErrorTheme.icon} />
          </div>
          <h1 className={paymentErrorTheme.title}>Something Went Wrong</h1>
          <p className={paymentErrorTheme.subtitle}>
            {errorMessage ||
              "We couldn't process your Stripe payment. Please try again or contact support."}
          </p>
          <div className={paymentErrorTheme.ctaStack}>
            <Button onClick={handleRetryPayment} className={paymentErrorTheme.primaryBtn}>
              Return to Checkout
            </Button>
            <Button asChild variant="outline" className={paymentErrorTheme.secondaryBtn}>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
