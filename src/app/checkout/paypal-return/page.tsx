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
import { CheckoutStorageService } from "@/features/checkout/lib/services/checkoutStorageService";
import type { CheckoutData } from "@/features/checkout/lib/services/checkoutStorageService";

type PageStatus = "loading" | "capturing" | "success" | "failed" | "cancelled" | "error";

const PAYPAL_PIPELINE_TIMEOUT_MS = 120_000; // 2 minutes

class PayPalPipelineTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(
      `Order processing timed out after ${Math.round(timeoutMs / 1000)} seconds. ` +
        `A full refund has been initiated and will appear within 3–5 business days.`
    );
    this.name = "PayPalPipelineTimeoutError";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new PayPalPipelineTimeoutError(ms)), ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
}

export default function PayPalReturnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [captureId, setCaptureId] = useState<string | null>(null);
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

    const processPayPalReturn = async () => {
      try {
        // Get PayPal params from URL
        const token = searchParams.get("token"); // This is the PayPal order ID
        const payerId = searchParams.get("PayerID");

        // Check for cancellation
        if (!token || !payerId) {
          // User likely cancelled
          setStatus("cancelled");
          CheckoutStorageService.clearPayPalCheckoutData();
          return;
        }

        setPaymentId(token);

        // Get stored checkout data
        const checkoutData = CheckoutStorageService.getPayPalCheckoutData();
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
        const finalizationDoneKey = `paypal_finalized_${token}`;
        const finalizationLockKey = `paypal_finalizing_${token}`;

        if (sessionStorage.getItem(finalizationDoneKey) === "true") {
          setStatus("success");
          return;
        }

        if (sessionStorage.getItem(finalizationLockKey) === "true") {
          return;
        }

        sessionStorage.setItem(finalizationLockKey, "true");
        setStatus("capturing");

        // Capture the PayPal payment
        const captureResponse = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token, payerId }),
        });

        const captureData = await captureResponse.json();

        if (!captureResponse.ok) {
          sessionStorage.removeItem(finalizationLockKey);
          CheckoutStorageService.clearPayPalCheckoutData();

          // Handle declined payment - show failed status with retry option
          if (captureData.code === "INSTRUMENT_DECLINED" || captureData.isRetryable) {
            setStatus("failed");
            setErrorMessage(captureData.error || "Your payment method was declined. Please try again with a different payment method.");
            return;
          }

          throw new Error(captureData.error || "Failed to capture PayPal payment");
        }

        setCaptureId(captureData.captureId);

        // Payment captured successfully - now create the order
        const { lineItems, shippingAddress, amount, cartId } = checkoutData;
        const validatedLineItems = lineItems.map((item, index) =>
          validatePrintifyLineItem(item, index)
        );

        const idempotencyKey = `paypal_${token}`;

        // Validate cart ID and amount
        if (!cartId) {
          CheckoutStorageService.clearPayPalCheckoutData();
          setStatus("error");
          setErrorMessage(
            "Cart information not found. Your payment was captured but we couldn't create your order. Please contact support with payment ID: " + token
          );
          return;
        }

        if (!amount) {
          CheckoutStorageService.clearPayPalCheckoutData();
          setStatus("error");
          setErrorMessage(
            "Order amount not found. Your payment was captured but we couldn't create your order. Please contact support with payment ID: " + token
          );
          return;
        }

        // Record payment for recovery
        try {
          const cart = await CartService.getCart(cartId);
          await PaymentRecoveryService.recordPaymentForRecovery({
            paymentProvider: "paypal",
            paymentIntentId: token,
            paymentStatus: "succeeded",
            amount,
            currency: "USD",
            cartSnapshot: cart,
            shippingAddress,
            lineItems: validatedLineItems,
            metadata: {
              idempotency_key: idempotencyKey,
              capture_id: captureData.captureId,
              payer_email: captureData.payerEmail,
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
          CheckoutStorageService.clearPayPalCheckoutData();
          setStatus("success");
          return;
        }

        // Helpers
        const triggerRefund = async (reason: string) => {
          try {
            if (amount > 0 && captureData.captureId) {
              await RefundService.processRefund({
                orderId: `temp_paypal_${token}`,
                paymentProvider: "paypal",
                amount,
                reason,
                paypalCaptureId: captureData.captureId,
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
          // cartId is already validated above and available from checkoutData

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
                paymentProvider: "paypal",
                paymentIntentId: token,
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
              payment_intent_id: token,
              order_id: createdOrderId,
              provider: "paypal",
              capture_id: captureData.captureId,
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
            await PaymentRecoveryService.markPaymentRecovered(token, "paypal", createdOrderId);
          }

          // Stage 4: Clear cart
          try {
            await clearCart.mutateAsync();
          } catch {
            // Non-blocking
          }
        };

        try {
          await withTimeout(runFulfillmentPipeline(), PAYPAL_PIPELINE_TIMEOUT_MS);
        } catch (pipelineError) {
          if (pipelineError instanceof PayPalPipelineTimeoutError) {
            if (createdOrderId) {
              await markOrderFailed(createdOrderId, "fulfillment_failed");
            }
            await triggerRefund("PayPal checkout pipeline timed out");
          }
          throw pipelineError;
        }

        // Success!
        sessionStorage.setItem(finalizationDoneKey, "true");
        sessionStorage.removeItem(finalizationLockKey);
        CheckoutStorageService.clearPayPalCheckoutData();
        setStatus("success");
      } catch (err) {
        console.error("PayPal return error:", err);

        const currentToken = searchParams.get("token");
        if (currentToken) {
          sessionStorage.removeItem(`paypal_finalizing_${currentToken}`);
        }

        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to process PayPal payment"
        );
      }
    };

    processPayPalReturn();
  }, [isUserLoading, user, searchParams]);

  const handleRetryPayment = () => {
    router.push("/checkout");
  };

  const handleCreateAnother = () => {
    router.push("/dashboard");
  };

  // Loading state
  if (status === "loading" || status === "capturing") {
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
              {status === "capturing" ? "Completing Your Payment" : "Processing Payment"}
            </h1>
            <p className={paymentSuccessTheme.subtitle}>
              {status === "capturing"
                ? "Please wait while we finalize your PayPal payment..."
                : "Please wait while we verify your payment with PayPal..."}
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
          id: captureId || paymentId || "",
          provider: "paypal",
          status: "succeeded",
          orderNumber: orderNumber || (paymentId ? `#PP-${paymentId.slice(-6).toUpperCase()}` : "—"),
          totalPaid: "Paid via PayPal",
          estimatedDelivery: "7–10 business days",
          confirmationEmail: "",
        }}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  // Cancelled state
  if (status === "cancelled") {
    return (
      <PaymentError
        details={{
          paymentId: paymentId || "",
          orderNumber: "—",
          amountDue: "—",
          attemptedOn: new Date().toLocaleString(),
          status: "Cancelled",
          reasonTitle: "Payment cancelled",
          reasonMessage:
            "You cancelled the PayPal payment. No charges have been made to your account.",
          availableMethods: ["stripe", "paypal"],
        }}
        onTryAgain={handleRetryPayment}
        onSelectMethod={handleRetryPayment}
      />
    );
  }

  // Failed state
  if (status === "failed") {
    return (
      <PaymentError
        details={{
          paymentId: paymentId || "",
          orderNumber: paymentId ? `#PP-${paymentId.slice(-6).toUpperCase()}` : "—",
          amountDue: "—",
          attemptedOn: new Date().toLocaleString(),
          status: "Declined",
          reasonTitle: "Payment declined",
          reasonMessage:
            errorMessage ||
            "Your PayPal payment could not be processed. Please try again or use a different payment method.",
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
              "We couldn't process your PayPal payment. Please try again or contact support."}
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
