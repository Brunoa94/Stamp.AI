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
import { captureError } from "@/lib/observability/errorCapture";
import {
  useCreateOrderFromCart,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/queries/orderQueries";
import { useCreatePrintifyOrder } from "@/queries/printifyOrderQueries";
import { useClearCart } from "@/queries/cartQueries";
import { useUser } from "@/hooks/useAuth";
import { CheckoutStorageService } from "@/features/checkout/lib/services/checkoutStorageService";

type PageStatus =
  | "loading"
  | "capturing"
  | "success"
  | "failed"
  | "cancelled"
  | "error";

const PAYPAL_PIPELINE_TIMEOUT_MS = 120_000; // 2 minutes

class PayPalPipelineTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(
      `Order processing timed out after ${Math.round(timeoutMs / 1000)} seconds. ` +
        `A full refund has been initiated and will appear within 3–5 business days.`,
    );
    this.name = "PayPalPipelineTimeoutError";
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new PayPalPipelineTimeoutError(ms)),
      ms,
    );
  });

  return Promise.race([promise, timeout]).finally(() =>
    clearTimeout(timeoutId),
  );
}

export default function PaypalReturnClient() {
  // useSearchParams() requires a Suspense boundary for static prerendering
  return (
    <Suspense fallback={null}>
      <PayPalReturnContent />
    </Suspense>
  );
}

function PayPalReturnContent() {
  const t = useTranslations("checkout.returns.paypal");
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
          if (
            captureData.code === "INSTRUMENT_DECLINED" ||
            captureData.isRetryable
          ) {
            setStatus("failed");
            setErrorMessage(captureData.error || t("declinedFallback"));
            return;
          }

          throw new Error(captureData.error || t("captureFailed"));
        }

        setCaptureId(captureData.captureId);

        // Payment captured successfully - now create the order
        const {
          lineItems,
          shippingAddress,
          billing: billingAddress,
          amount,
          cartId,
        } = checkoutData;
        const validatedLineItems = lineItems.map((item, index) =>
          validatePrintifyLineItem(item, index),
        );

        const idempotencyKey = `paypal_${token}`;

        // Validate cart ID and amount
        if (!cartId) {
          CheckoutStorageService.clearPayPalCheckoutData();
          setStatus("error");
          setErrorMessage(t("errorCartNotFound", { paymentId: token }));
          return;
        }

        if (!amount) {
          CheckoutStorageService.clearPayPalCheckoutData();
          setStatus("error");
          setErrorMessage(t("errorAmountNotFound", { paymentId: token }));
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
          captureError(recoveryError, {
            service: "PayPalReturn",
            action: "recordPaymentForRecovery",
            metadata: { token },
          });
        }

        // Check for existing order
        const existingOrder =
          await OrderService.getOrderByIdempotencyKey(idempotencyKey);
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
              // Use real order ID if available, otherwise use temporary ID
              const refundOrderId = createdOrderId || `temp_paypal_${token}`;

              await RefundService.processRefund({
                orderId: refundOrderId,
                paymentProvider: "paypal",
                amount,
                reason,
                paypalCaptureId: captureData.captureId,
              });

              }
          } catch (refundError) {
            captureError(refundError, {
              service: "PayPalReturn",
              action: "triggerRefund",
              metadata: { token, amount, reason },
            });
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
          } catch (updateError) {
            captureError(updateError, {
              service: "PayPalReturn",
              action: "markOrderFailed",
              metadata: { orderId, failureStatus },
            });
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
                billingAddress,
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
              payment_intent_id: token,
              order_id: createdOrderId,
              provider: "paypal",
              capture_id: captureData.captureId,
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
            captureError(printifyError, {
              service: "PayPalReturn",
              action: "createPrintifyOrder",
              metadata: { token, createdOrderId },
            });

            if (createdOrderId) {
              // Mark order as failed BEFORE triggering refund
              await markOrderFailed(
                createdOrderId,
                "unsuccessful_confirmation",
              );
              // Trigger refund with real order ID
              await triggerRefund("Printify fulfillment failed");
            } else {
              await triggerRefund("Order creation failed before Printify");
            }

            throw new Error(t("orderFulfillmentFailedRefund"));
          }

          // Stage 3: Mark payment recovered
          if (createdOrderId) {
            await PaymentRecoveryService.markPaymentRecovered(
              token,
              "paypal",
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
            PAYPAL_PIPELINE_TIMEOUT_MS,
          );
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
        captureError(err, {
          service: "PayPalReturn",
          action: "processPayPalReturn",
          metadata: { token: searchParams.get("token") },
        });

        const currentToken = searchParams.get("token");
        if (currentToken) {
          sessionStorage.removeItem(`paypal_finalizing_${currentToken}`);
        }

        setStatus("error");
        setErrorMessage(
          err instanceof Error ? err.message : t("errorFallback"),
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
              {status === "capturing"
                ? t("capturingTitle")
                : t("processingTitle")}
            </Heading>
            <Paragraph variant="sm" className="text-(--color-stamp-taupe) max-w-sm mx-auto">
              {status === "capturing"
                ? t("capturingMessage")
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
          id: captureId || paymentId || "",
          provider: "paypal",
          status: "succeeded",
          orderNumber:
            orderNumber ||
            (paymentId ? `#PP-${paymentId.slice(-6).toUpperCase()}` : "—"),
          totalPaid: t("totalPaid"),
          estimatedDelivery: t("estimatedDelivery"),
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
          status: t("cancelledStatus"),
          reasonTitle: t("paymentCancelledTitle"),
          reasonMessage: t("paymentCancelledMessage"),
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
          orderNumber: paymentId
            ? `#PP-${paymentId.slice(-6).toUpperCase()}`
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
