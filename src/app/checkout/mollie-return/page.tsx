"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/features/ui/button";
import PaymentSuccess from "@/features/checkout/ui/PaymentSuccess/PaymentSuccess";
import PaymentError from "@/features/checkout/ui/components/PaymentError";
import { OrderService } from "@/services/orderService";
import { CartService } from "@/services/cartService";
import { RefundService } from "@/services/refundService";
import { PaymentRecoveryService } from "@/services/paymentRecoveryService";
import type {
  CreatePrintifyOrderRequest,
  PrintifyLineItem,
} from "@/types/printifyOrder";
import { validatePrintifyLineItem } from "@/types/printifyOrder";
import { mapShippingAddressToPrintifyAddress } from "@/mappers/mapShippingAddressToPrintifyAddress";
import {
  isMolliePaymentPaid,
  isMolliePaymentFailed,
  isMolliePaymentPending,
} from "@/lib/mollie";
import type { MolliePaymentStatus } from "@/lib/mollie";
import { paymentSuccessTheme, paymentErrorTheme } from "@/theme/components";
import type { ShippingAddressT } from "@/schemas/checkout";
import { UserI } from "@/types/auth";
import {
  useCreateOrderFromCart,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/queries/orderQueries";
import { useCreatePrintifyOrder } from "@/queries/printifyOrderQueries";
import { useClearCart } from "@/queries/cartQueries";
import { useVerifyMolliePayment } from "@/queries/mollieQueries";
import { useUser } from "@/hooks/useAuth";

type PageStatus = "loading" | "success" | "failed" | "pending" | "error";

/** Maximum time (ms) the post-payment pipeline is allowed to run before aborting. */
const MOLLIE_PIPELINE_TIMEOUT_MS = 120_000; // 2 minutes — matches handlePaymentSuccess

class MolliePipelineTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(
      `Order processing timed out after ${Math.round(timeoutMs / 1000)} seconds. ` +
        `A full refund has been initiated and will appear within 3–5 business days.`,
    );
    this.name = "MolliePipelineTimeoutError";
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new MolliePipelineTimeoutError(ms)),
      ms,
    );
  });

  return Promise.race([promise, timeout]).finally(() =>
    clearTimeout(timeoutId),
  );
}

export default function MollieReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] =
    useState<MolliePaymentStatus | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const hasVerified = useRef(false);

  // React Query mutations — same hooks used by handlePaymentSuccess in actions.ts
  const createOrderFromCart = useCreateOrderFromCart();
  const createPrintifyOrder = useCreatePrintifyOrder();
  const updateOrderStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const clearCart = useClearCart();
  const verifyMolliePayment = useVerifyMolliePayment();
  const { data: user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    // Wait for user data to load before verifying payment
    if (isUserLoading) {
      console.log("⏳ Waiting for user data to load...");
      return;
    }

    // Prevent multiple verification attempts
    if (hasVerified.current) return;
    hasVerified.current = true;

    console.log(
      "👤 User loaded:",
      user ? "authenticated" : "not authenticated",
    );

    const verifyPayment = async () => {
      try {
        // ✅ CRITICAL FIX: Try to get payment ID from URL first, then sessionStorage, then database
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIdFromUrl = urlParams.get("payment_id");

        let storedPaymentId =
          paymentIdFromUrl || sessionStorage.getItem("mollie_payment_id");
        let storedLineItems = sessionStorage.getItem("mollie_line_items");
        let storedShippingAddress = sessionStorage.getItem(
          "mollie_shipping_address",
        );
        let storedCartId = sessionStorage.getItem("mollie_cart_id");
        let storedOrderAmount = sessionStorage.getItem("mollie_order_amount");

        // ✅ CRITICAL FIX: If sessionStorage is empty, try to recover from database
        if (!storedPaymentId || !storedLineItems || !storedShippingAddress) {
          console.log(
            "⚠️ SessionStorage empty, attempting database recovery...",
          );

          try {
            const pendingRecoveries =
              await PaymentRecoveryService.getPendingRecoveries();
            const mollieRecovery = pendingRecoveries.find(
              (r) =>
                r.payment_provider === "mollie" &&
                (!storedPaymentId || r.payment_intent_id === storedPaymentId),
            );

            if (mollieRecovery) {
              console.log(
                "✅ Found payment recovery in database:",
                mollieRecovery.payment_intent_id,
              );
              storedPaymentId = mollieRecovery.payment_intent_id;
              storedLineItems = JSON.stringify(mollieRecovery.line_items);
              storedShippingAddress = JSON.stringify(
                mollieRecovery.shipping_address,
              );
              storedOrderAmount = String(mollieRecovery.amount);

              if (mollieRecovery.cart_snapshot?.id) {
                storedCartId = mollieRecovery.cart_snapshot.id;
              }
            }
          } catch (recoveryError) {
            console.error(
              "Failed to recover payment from database:",
              recoveryError,
            );
          }
        }

        if (!storedPaymentId) {
          setStatus("error");
          setErrorMessage(
            "No payment information found. If you completed a payment, please contact support with your payment details.",
          );
          return;
        }

        // Check if user is authenticated
        if (!user) {
          console.error("❌ User not authenticated during payment return");
          setStatus("error");
          setErrorMessage(
            "You must be logged in to complete your order. Please log in and contact support with payment ID: " +
              storedPaymentId,
          );
          return;
        }

        console.log("✅ User authenticated:", user.email);

        // Check if cart ID is present
        if (!storedCartId) {
          console.error("❌ Cart ID not found in session storage");
          setStatus("error");
          setErrorMessage(
            "Cart information not found. Please contact support with payment ID: " +
              storedPaymentId,
          );
          return;
        }

        console.log("✅ Cart ID found:", storedCartId);

        // Idempotency guard (cross-mount and page refresh safe)
        const finalizationLockKey = `mollie_finalizing_${storedPaymentId}`;
        const finalizationDoneKey = `mollie_finalized_${storedPaymentId}`;

        if (sessionStorage.getItem(finalizationDoneKey) === "true") {
          console.log(
            `Mollie payment ${storedPaymentId} already finalized in this session. Skipping duplicate finalization.`,
          );
          setPaymentId(storedPaymentId);
          setStatus("success");
          return;
        }

        if (sessionStorage.getItem(finalizationLockKey) === "true") {
          console.log(
            `Mollie payment ${storedPaymentId} is already finalizing. Skipping duplicate run.`,
          );
          return;
        }

        sessionStorage.setItem(finalizationLockKey, "true");

        setPaymentId(storedPaymentId);

        // ── CRITICAL: Record payment for recovery BEFORE verification ──
        // This ensures payment is captured even if verification fails
        if (!storedLineItems || !storedShippingAddress) {
          throw new Error(
            "Missing checkout context to finalize order after payment.",
          );
        }

        const parsedLineItems = JSON.parse(
          storedLineItems,
        ) as PrintifyLineItem[];
        const parsedShippingAddress = JSON.parse(
          storedShippingAddress,
        ) as ShippingAddressT;

        if (!Array.isArray(parsedLineItems) || parsedLineItems.length === 0) {
          throw new Error("No order items found to finalize Mollie checkout.");
        }

        const validatedLineItems = parsedLineItems.map((item, index) =>
          validatePrintifyLineItem(item, index),
        );

        const orderAmount = storedOrderAmount
          ? parseFloat(storedOrderAmount)
          : 0;

        const idempotencyKey = `mollie_${storedPaymentId}`;

        // Record payment for recovery BEFORE verification
        // If verification fails, this allows payment to be recovered later
        if (storedCartId && user) {
          try {
            const cart = await CartService.getCart(storedCartId);
            await PaymentRecoveryService.recordPaymentForRecovery({
              paymentProvider: "mollie",
              paymentIntentId: storedPaymentId,
              paymentStatus: "pending", // Will be updated by webhook
              amount: orderAmount,
              currency: "USD",
              cartSnapshot: cart,
              shippingAddress: parsedShippingAddress,
              lineItems: validatedLineItems,
              metadata: { idempotency_key: idempotencyKey },
            });
            console.log(
              "✅ Payment recorded for crash recovery (pre-verification)",
            );
          } catch (recoveryError) {
            console.error(
              "❌ Payment recovery recording failed:",
              recoveryError,
            );
            // Non-blocking - continue with verification
          }
        }

        // Verify payment status with edge function
        // React Query will automatically retry 3 times with exponential backoff
        const result = await verifyMolliePayment.mutateAsync({
          paymentId: storedPaymentId,
        });

        setPaymentStatus(result.status);

        if (isMolliePaymentPaid(result.status)) {
          // ── Shared helpers (match handlePaymentSuccess in actions.ts) ──

          const triggerRefund = async (reason: string) => {
            try {
              if (orderAmount > 0) {
                console.log("💰 Initiating refund for failed Mollie order...");
                await RefundService.processRefund({
                  orderId: `temp_mollie_${storedPaymentId}`,
                  paymentProvider: "mollie",
                  amount: orderAmount,
                  reason,
                  molliePaymentId: storedPaymentId,
                });
                console.log("✅ Refund initiated successfully");
              } else {
                console.warn(
                  "⚠️ Cannot initiate refund — order amount unknown",
                );
              }
            } catch (refundError) {
              console.error("❌ Refund initiation failed:", refundError);
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
              await updatePaymentStatus.mutateAsync({
                orderId,
                paymentStatus: "pending",
              });
              console.log(
                `✅ Order ${orderId} marked as ${failureStatus} / pending`,
              );
            } catch (updateError) {
              console.error(
                `❌ Failed to mark order ${orderId} as ${failureStatus}:`,
                updateError,
              );
            }
          };

          // ── Idempotency check (same as handlePaymentSuccess) ──

          const existingOrder =
            await OrderService.getOrderByIdempotencyKey(idempotencyKey);

          if (existingOrder) {
            console.log(
              `✅ Order already exists for Mollie payment ${storedPaymentId}, skipping duplicate creation`,
            );
            sessionStorage.setItem(finalizationDoneKey, "true");
            sessionStorage.removeItem(finalizationLockKey);
            setStatus("success");
            return;
          }

          // ── Payment recovery already recorded above (before verification) ──
          // Update status to "succeeded" now that we confirmed payment
          if (storedCartId && user) {
            try {
              const cart = await CartService.getCart(storedCartId);
              await PaymentRecoveryService.recordPaymentForRecovery({
                paymentProvider: "mollie",
                paymentIntentId: storedPaymentId,
                paymentStatus: "succeeded",
                amount: orderAmount,
                currency: "USD",
                cartSnapshot: cart,
                shippingAddress: parsedShippingAddress,
                lineItems: validatedLineItems,
                metadata: { idempotency_key: idempotencyKey },
              });
              console.log("✅ Payment recovery status updated to succeeded");
            } catch (recoveryError) {
              console.error(
                "❌ Payment recovery update failed:",
                recoveryError,
              );
              // Non-blocking
            }
          }

          let createdOrderId: string | null = null;

          // ── Pipeline wrapped in timeout (same as handlePaymentSuccess) ──

          const runFulfillmentPipeline = async () => {
            // ── Stage 1: Create DB order ──
            console.log("🔍 Checking prerequisites for order creation...");
            console.log(
              "  - Cart ID:",
              storedCartId ? "✓ Present" : "✗ Missing",
            );
            console.log(
              "  - User:",
              user ? `✓ Authenticated (${user.email})` : "✗ Not authenticated",
            );

            if (!storedCartId) {
              await triggerRefund("Missing cart ID in session storage");
              throw new Error(
                "Cannot create order: cart information not found. A full refund has been initiated and will appear within 3–5 business days.",
              );
            }

            if (!user) {
              await triggerRefund("User not authenticated");
              throw new Error(
                "Cannot create order: you must be logged in to complete checkout. A full refund has been initiated and will appear within 3–5 business days.",
              );
            }

            try {
              const cart = await CartService.getCart(storedCartId);
              console.log("📝 Creating order from cart...");
              createdOrderId =
                (await createOrderFromCart.mutateAsync({
                  user: user as UserI,
                  cart,
                  paymentStatus: "paid",
                  shippingAddress: parsedShippingAddress,
                  idempotencyKey,
                })) ?? null;
              console.log("✅ Order and order items created in database");

              // ✅ Link payment transaction to order
              if (createdOrderId) {
                await OrderService.linkPaymentTransactionToOrder({
                  paymentProvider: "mollie",
                  paymentIntentId: storedPaymentId,
                  orderId: createdOrderId,
                });
              }
            } catch (orderError) {
              console.error(
                "❌ All order creation attempts failed. Initiating refund...",
              );
              await triggerRefund("Order creation failed after retry attempts");
              const reason =
                orderError instanceof Error
                  ? orderError.message
                  : "Order creation failed after retry attempts.";
              throw new Error(
                `${reason} A full refund has been initiated and will appear within 3–5 business days.`,
              );
            }

            // Validate that we have a valid order ID before proceeding
            if (!createdOrderId) {
              await triggerRefund("Order ID not returned from order creation");
              throw new Error(
                "Order creation failed to return order ID. A full refund has been initiated and will appear within 3–5 business days.",
              );
            }

            console.log(`✅ Order created with ID: ${createdOrderId}`);

            // Fetch the created order to get the order_number
            try {
              const fullOrder = await OrderService.getOrder(createdOrderId);
              if (fullOrder?.order_number) {
                setOrderNumber(fullOrder.order_number);
                console.log(`✅ Order number: ${fullOrder.order_number}`);
              }
            } catch (fetchError) {
              console.error("❌ Failed to fetch order details:", fetchError);
              // Non-blocking - continue with order processing
            }

            // ── Stage 2: Create Printify order (uses React Query mutation with retry: 3) ──
            console.log(
              "🚀 Creating Printify order after successful payment...",
            );

            const printifyPayload: CreatePrintifyOrderRequest = {
              line_items: validatedLineItems,
              shipping_address: mapShippingAddressToPrintifyAddress(
                parsedShippingAddress,
              ),
              is_test: false,
              metadata: {
                payment_intent_id: storedPaymentId,
                order_id: createdOrderId, // Now guaranteed to be a valid UUID
                provider: "mollie",
              },
            };

            try {
              const printifyResult =
                await createPrintifyOrder.mutateAsync(printifyPayload);
              console.log("✅ Printify order created successfully");
              console.log(
                "✅ Order status updated to 'confirmed' by create-printify-order function",
              );

              // Persist the Printify order ID back to the DB order row
              const printifyOrderId = printifyResult?.order?.id;
              if (printifyOrderId && createdOrderId) {
                try {
                  await OrderService.updateOrder(createdOrderId, {
                    printify_order_id: printifyOrderId,
                  });
                  console.log(
                    `✅ Saved printify_order_id ${printifyOrderId} to order ${createdOrderId}`,
                  );
                } catch (updateErr) {
                  console.error(
                    "❌ Failed to save printify_order_id:",
                    updateErr,
                  );
                }
              }
            } catch (printifyError) {
              console.error(
                "❌ Printify order creation failed. Initiating refund...",
              );
              if (createdOrderId) {
                await markOrderFailed(
                  createdOrderId,
                  "unsuccessful_confirmation",
                );
              }
              await triggerRefund(
                "Printify fulfillment failed after successful payment",
              );
              const reason =
                printifyError instanceof Error
                  ? printifyError.message
                  : "Order fulfillment failed.";
              throw new Error(
                `${reason} A full refund has been initiated and will appear within 3–5 business days.`,
              );
            }

            // ── Stage 3: Mark payment recovered ──
            // Note: payment_status is already "paid" from order creation, no need to update
            if (createdOrderId) {
              await PaymentRecoveryService.markPaymentRecovered(
                storedPaymentId,
                "mollie",
                createdOrderId,
              );
              console.log("✅ Payment marked as recovered");
            }

            // ── Stage 4: Cart cleanup (non-blocking) ──
            if (storedCartId) {
              try {
                await clearCart.mutateAsync();
                console.log("✅ Cart cleared successfully");
              } catch (cartError) {
                console.error(
                  "Failed to clear cart after Mollie payment:",
                  cartError,
                );
              }
            }
          };

          // Timeout protection — matches handlePaymentSuccess
          try {
            await withTimeout(
              runFulfillmentPipeline(),
              MOLLIE_PIPELINE_TIMEOUT_MS,
            );
          } catch (pipelineError) {
            if (pipelineError instanceof MolliePipelineTimeoutError) {
              if (createdOrderId) {
                await markOrderFailed(createdOrderId, "fulfillment_failed");
              }
              await triggerRefund("Mollie checkout pipeline timed out");
            }
            throw pipelineError;
          }

          // Mark this payment as finalized to avoid duplicate order creation
          sessionStorage.setItem(finalizationDoneKey, "true");
          sessionStorage.removeItem(finalizationLockKey);

          setStatus("success");

          // Clear sessionStorage
          sessionStorage.removeItem("mollie_payment_id");
          sessionStorage.removeItem("mollie_line_items");
          sessionStorage.removeItem("mollie_shipping_address");
          sessionStorage.removeItem("mollie_cart_id");
        } else if (isMolliePaymentFailed(result.status)) {
          sessionStorage.removeItem(finalizationLockKey);
          setStatus("failed");
          sessionStorage.removeItem("mollie_payment_id");
          sessionStorage.removeItem("mollie_cart_id");
        } else if (isMolliePaymentPending(result.status)) {
          sessionStorage.removeItem(finalizationLockKey);
          setStatus("pending");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);

        const currentPaymentId = sessionStorage.getItem("mollie_payment_id");
        if (currentPaymentId) {
          sessionStorage.removeItem(`mollie_finalizing_${currentPaymentId}`);
        }

        setStatus("error");

        // Provide helpful error message since payment was already recorded for recovery
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to verify payment status";
        setErrorMessage(
          `${errorMessage}. Your payment has been recorded (ID: ${currentPaymentId ?? "unknown"}). ` +
            `Our team will process your order automatically. You will receive an email confirmation within 24 hours. ` +
            `If you need immediate assistance, please contact support with your payment ID.`,
        );
      }
    };

    verifyPayment();
  }, [isUserLoading, user]); // Re-run when user loading state changes

  const storedCartId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("mollie_cart_id")
      : null;

  const handleRetryPayment = () => {
    if (storedCartId) {
      router.push(`/checkout?cartId=${storedCartId}`);
    } else {
      router.push("/cart");
    }
  };

  const handleViewOrders = () => {
    router.push("/orders");
  };

  const handleCreateAnother = () => {
    router.push("/dashboard");
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className={paymentSuccessTheme.page}>
        <div className={paymentSuccessTheme.wrapper}>
          <section
            className={paymentSuccessTheme.card}
            aria-label="Verifying payment"
          >
            <div className={paymentSuccessTheme.topAccent} aria-hidden="true" />
            <div className={paymentSuccessTheme.iconWrapper} aria-hidden="true">
              <Loader2 className="w-12 h-12 animate-spin" />
            </div>
            <h1 className={paymentSuccessTheme.title}>Verifying Payment</h1>
            <p className={paymentSuccessTheme.subtitle}>
              Please wait while we confirm your payment with Mollie...
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
          id: paymentId ?? "",
          provider: "mollie" as "stripe", // Legacy Mollie payment - type assertion for backward compatibility
          status: paymentStatus ?? "paid",
          orderNumber:
            orderNumber ||
            (paymentId ? `#ML-${paymentId.slice(-6).toUpperCase()}` : "—"),
          totalPaid: "Paid via Mollie",
          estimatedDelivery: "7–10 business days",
          confirmationEmail: "",
        }}
        onCreateAnother={handleCreateAnother}
      />
    );
  }

  // Failed/Canceled state
  if (status === "failed") {
    const reasonMessage =
      paymentStatus === "canceled"
        ? "You canceled the payment. No charges have been made."
        : paymentStatus === "expired"
          ? "Your payment session has expired. Please try again."
          : "Unfortunately, your payment could not be processed. Please try again or use a different payment method.";

    return (
      <PaymentError
        details={{
          paymentId: paymentId ?? "",
          orderNumber: paymentId
            ? `#ML-${paymentId.slice(-6).toUpperCase()}`
            : "—",
          amountDue: "—",
          attemptedOn: new Date().toLocaleString(),
          status: paymentStatus === "canceled" ? "Canceled" : "Failed",
          reasonTitle: "Payment status",
          reasonMessage,
          availableMethods: ["stripe", "paypal"],
        }}
        onTryAgain={handleRetryPayment}
        onSelectMethod={handleRetryPayment}
      />
    );
  }

  // Pending state
  if (status === "pending") {
    return (
      <div className={paymentSuccessTheme.page}>
        <div className={paymentSuccessTheme.wrapper}>
          <section
            className={paymentSuccessTheme.card}
            aria-label="Payment pending"
          >
            <div
              className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-400 via-amber-500 to-amber-400"
              aria-hidden="true"
            />
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h1 className={paymentSuccessTheme.title}>Payment Pending</h1>
            <p className={paymentSuccessTheme.subtitle}>
              Your payment is being processed. This may take a few moments. You
              will receive an email confirmation once your payment is complete.
            </p>
            <div className={paymentSuccessTheme.ctaStack}>
              <Button
                onClick={handleViewOrders}
                className={paymentSuccessTheme.primaryBtn}
              >
                View Orders
              </Button>
              <Button
                variant="outline"
                onClick={handleCreateAnother}
                className={paymentSuccessTheme.secondaryBtn}
              >
                Go to Dashboard
              </Button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className={paymentErrorTheme.page}>
      <div className={paymentErrorTheme.wrapper}>
        <section className={paymentErrorTheme.card} aria-label="Error">
          <div className={paymentErrorTheme.topAccent} aria-hidden="true" />
          <div className={paymentErrorTheme.iconWrapper} aria-hidden="true">
            <AlertCircle className={paymentErrorTheme.icon} />
          </div>
          <h1 className={paymentErrorTheme.title}>Something Went Wrong</h1>
          <p className={paymentErrorTheme.subtitle}>
            {errorMessage ||
              "We couldn't verify your payment status. Please contact support if you believe your payment was successful."}
          </p>
          <div className={paymentErrorTheme.ctaStack}>
            <Button
              onClick={handleRetryPayment}
              className={paymentErrorTheme.primaryBtn}
            >
              Return to Checkout
            </Button>
            <Button
              asChild
              variant="outline"
              className={paymentErrorTheme.secondaryBtn}
            >
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
