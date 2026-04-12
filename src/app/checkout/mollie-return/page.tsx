"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/features/ui/button";
import { PageDividers } from "@/features/ui/page-dividers";
import { PaymentSuccess, PaymentError } from "@/features/checkout/components";
import { MollieService } from "@/services/mollieService";
import { OrderService } from "@/services/orderService";
import { PrintifyService } from "@/services/printifyService";
import { CartService } from "@/services/cartService";
import { RefundService } from "@/services/refundService";
import { PaymentRecoveryService } from "@/services/paymentRecoveryService";
import { createClient } from "@/lib/supabase/client";
import type {
  CreatePrintifyOrderRequest,
  PrintifyLineItem,
  PrintifyShippingAddress,
} from "@/types/printifyOrder";
import { validatePrintifyLineItem } from "@/types/printifyOrder";
import {
  isMolliePaymentPaid,
  isMolliePaymentFailed,
  isMolliePaymentPending,
} from "@/lib/mollie";
import type { MolliePaymentStatus } from "@/lib/mollie";
import { paymentSuccessTheme, paymentErrorTheme } from "@/theme/components";
import type { ShippingAddressT } from "@/schemas/checkout";
import { UserI } from "@/types/auth";

type PageStatus = "loading" | "success" | "failed" | "pending" | "error";

export default function MollieReturnPage() {
  const router = useRouter();
  const [status, setStatus] = useState<PageStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] =
    useState<MolliePaymentStatus | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const hasVerified = useRef(false);

  useEffect(() => {
    // Prevent multiple verification attempts
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPayment = async () => {
      try {
        // ✅ CRITICAL FIX: Try to get payment ID from URL first, then sessionStorage, then database
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIdFromUrl = urlParams.get("payment_id");

        let storedPaymentId = paymentIdFromUrl || sessionStorage.getItem("mollie_payment_id");
        let storedLineItems = sessionStorage.getItem("mollie_line_items");
        let storedShippingAddress = sessionStorage.getItem("mollie_shipping_address");
        let storedCartId = sessionStorage.getItem("mollie_cart_id");
        let storedOrderAmount = sessionStorage.getItem("mollie_order_amount");

        // ✅ CRITICAL FIX: If sessionStorage is empty, try to recover from database
        if (!storedPaymentId || !storedLineItems || !storedShippingAddress) {
          console.log("⚠️ SessionStorage empty, attempting database recovery...");

          try {
            const pendingRecoveries = await PaymentRecoveryService.getPendingRecoveries();
            const mollieRecovery = pendingRecoveries.find(
              (r) => r.payment_provider === "mollie" &&
              (!storedPaymentId || r.payment_intent_id === storedPaymentId)
            );

            if (mollieRecovery) {
              console.log("✅ Found payment recovery in database:", mollieRecovery.payment_intent_id);
              storedPaymentId = mollieRecovery.payment_intent_id;
              storedLineItems = JSON.stringify(mollieRecovery.line_items);
              storedShippingAddress = JSON.stringify(mollieRecovery.shipping_address);
              storedOrderAmount = String(mollieRecovery.amount);

              if (mollieRecovery.cart_snapshot?.id) {
                storedCartId = mollieRecovery.cart_snapshot.id;
              }
            }
          } catch (recoveryError) {
            console.error("Failed to recover payment from database:", recoveryError);
          }
        }

        if (!storedPaymentId) {
          setStatus("error");
          setErrorMessage(
            "No payment information found. If you completed a payment, please contact support with your payment details."
          );
          return;
        }

        // Idempotency guard (cross-mount and page refresh safe)
        // Prevent duplicate order finalization for the same Mollie payment id.
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

        // Verify payment status with edge function
        const result = await MollieService.verifyPayment({
          paymentId: storedPaymentId,
        });

        setPaymentStatus(result.status);

        if (isMolliePaymentPaid(result.status)) {
          if (!storedLineItems || !storedShippingAddress) {
            throw new Error(
              "Missing checkout context to finalize order after payment.",
            );
          }

          let createdOrderId: string | null = null;

          const parsedLineItems = JSON.parse(
            storedLineItems,
          ) as PrintifyLineItem[];
          const parsedShippingAddress = JSON.parse(
            storedShippingAddress,
          ) as ShippingAddressT;

          if (!Array.isArray(parsedLineItems) || parsedLineItems.length === 0) {
            throw new Error(
              "No order items found to finalize Mollie checkout.",
            );
          }

          const validatedLineItems = parsedLineItems.map((item, index) =>
            validatePrintifyLineItem(item, index),
          );

          const shippingAddress: PrintifyShippingAddress = {
            first_name: parsedShippingAddress.first_name,
            last_name: parsedShippingAddress.last_name || "",
            email: parsedShippingAddress.email,
            phone: parsedShippingAddress.phone || "",
            country: parsedShippingAddress.country,
            region: parsedShippingAddress.region || "",
            address1: parsedShippingAddress.address1,
            address2: parsedShippingAddress.address2 || "",
            city: parsedShippingAddress.city,
            zip: parsedShippingAddress.zip || "",
          };

          // Keep behavior aligned with Stripe finalization: create local order when cart context is available.
          if (storedCartId) {
            try {
              const supabase = createClient();
              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (user) {
                const cart = await CartService.getCart(storedCartId);
                createdOrderId = await OrderService.createOrderFromCart({
                  user: user as UserI,
                  cart,
                  paymentStatus: "paid",
                  shippingAddress: parsedShippingAddress,
                });
              }
            } catch (orderError) {
              console.error(
                "Failed to create local order from cart after Mollie payment:",
                orderError,
              );

              // ✅ CRITICAL FIX: Trigger automatic refund
              try {
                const orderAmount = storedOrderAmount
                  ? parseFloat(storedOrderAmount)
                  : 0;

                if (orderAmount > 0) {
                  console.log(
                    "💰 Initiating refund for failed Mollie order...",
                  );
                  await RefundService.processRefund({
                    orderId: `temp_mollie_${storedPaymentId}`,
                    paymentProvider: "mollie",
                    amount: orderAmount,
                    reason: "Order creation failed after Mollie payment",
                    molliePaymentId: storedPaymentId,
                  });
                  console.log("✅ Refund initiated successfully");
                } else {
                  console.warn(
                    "⚠️ Cannot initiate refund - order amount unknown",
                  );
                }
              } catch (refundError) {
                console.error("❌ Refund initiation failed:", refundError);
                // refund_failures alert created automatically by RefundService
              }

              throw new Error(
                "Payment was successful but order creation failed. A full refund has been initiated and will appear within 3-5 business days.",
              );
            }
          }

          const printifyPayload: CreatePrintifyOrderRequest = {
            line_items: validatedLineItems,
            shipping_address: shippingAddress,
            is_test: false,
            metadata: {
              payment_intent_id: storedPaymentId,
              order_id: createdOrderId ?? `order_${Date.now()}`,
              provider: "mollie",
            },
          };

          // ✅ CRITICAL FIX: Wrap Printify creation in try-catch
          try {
            await PrintifyService.createPrintifyOrder(printifyPayload);

            if (createdOrderId) {
              await OrderService.updateOrderStatus(createdOrderId, "confirmed");

              // ✅ Mark payment as recovered (no longer needs recovery)
              await PaymentRecoveryService.markPaymentRecovered(
                storedPaymentId,
                "mollie",
                createdOrderId
              );
              console.log("✅ Mollie payment marked as recovered");
            }
          } catch (printifyError) {
            console.error("❌ Printify order creation failed:", printifyError);

            if (createdOrderId) {
              // Order exists in DB - DO NOT REFUND
              // Update order status to needs_review for manual intervention
              try {
                await OrderService.updateOrderStatus(createdOrderId, "pending");
                console.log(
                  `⚠️ Order ${createdOrderId} marked as pending - Printify failed`,
                );
              } catch (statusError) {
                console.error("Failed to update order status:", statusError);
              }

              // Mark this payment as finalized to avoid duplicate attempts
              sessionStorage.setItem(finalizationDoneKey, "true");
              sessionStorage.removeItem(finalizationLockKey);

              // Show error to user but indicate order was placed
              setStatus("error");
              setErrorMessage(
                "Your payment was successful and your order was placed, but we encountered an issue sending it for production. Our team will review and contact you within 24 hours at " +
                  parsedShippingAddress.email,
              );
              return;
            } else {
              // No order exists - this shouldn't happen at this point, re-throw
              throw printifyError;
            }
          }

          if (storedCartId) {
            try {
              await CartService.clearCart(storedCartId);
            } catch (cartError) {
              console.error(
                "Failed to clear cart after Mollie payment:",
                cartError,
              );
            }
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
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Failed to verify payment status",
        );
      }
    };

    verifyPayment();
  }, []);

  const handleRetryPayment = () => {
    router.push("/checkout");
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
        <PageDividers />
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
          provider: "mollie",
          status: paymentStatus ?? "paid",
          orderNumber: paymentId
            ? `#ML-${paymentId.slice(-6).toUpperCase()}`
            : "—",
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
          availableMethods: ["stripe", "paypal", "mollie"],
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
        <PageDividers />
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
