import {
  FAILED_ORDER_STATUS,
  PAYMENT_PIPELINE_TIMEOUT_MS,
  PAYMENT_RETURN_SERVICE_NAME,
} from "../constants/paymentReturn";
import { PaymentPipelineTimeoutError } from "../errors/PaymentPipelineTimeoutError";
import { UserFacingError } from "../errors/UserFacingError";
import type {
  OrderFulfillmentDepsI,
  OrderFulfillmentRequestI,
  OrderFulfillmentResultI,
} from "../types/paymentReturn";
import { recordPaymentRecoverySafely } from "./paymentReturnRecoveryService";
import { refundPaymentSafely } from "./paymentReturnRefundService";
import { captureError } from "@/lib/observability/errorCapture";
import { withTimeout } from "@/lib/promiseUtils";
import { mapShippingAddressToPrintifyAddress } from "@/shared/mappers/mapShippingAddressToPrintifyAddress";
import { InvoiceService } from "@/shared/services/invoiceService";
import { OrderService } from "@/shared/services/orderService";
import { PaymentRecoveryService } from "@/shared/services/paymentRecoveryService";

/**
 * Turns a captured payment into a fulfilled order:
 * idempotency check → recovery record → DB order → Printify order →
 * recovery resolved → invoice (optional) → cart cleanup.
 *
 * Any failure after payment capture refunds the customer and throws a
 * UserFacingError carrying the provider's translated message.
 */
export async function fulfillPaidOrder(
  deps: OrderFulfillmentDepsI,
  request: OrderFulfillmentRequestI,
): Promise<OrderFulfillmentResultI> {
  const { provider, paymentId } = request;
  const service = PAYMENT_RETURN_SERVICE_NAME[provider];
  const idempotencyKey = `${provider}_${paymentId}`;

  const existingOrder =
    await OrderService.getOrderByIdempotencyKey(idempotencyKey);
  if (existingOrder) {
    return { orderNumber: existingOrder.order_number ?? null };
  }

  await recordPaymentRecoverySafely({
    paymentProvider: provider,
    paymentIntentId: paymentId,
    paymentStatus: "succeeded",
    amount: request.amount,
    currency: request.currency,
    cartSnapshot: request.cartSnapshot,
    shippingAddress: request.shippingAddress,
    lineItems: request.lineItems,
    metadata: {
      idempotency_key: idempotencyKey,
      ...request.metadata,
      ...request.recoveryMetadata,
    },
  });

  // Shared with the timeout handler, which runs while the pipeline is mid-flight.
  let createdOrderId: string | null = null;

  const refund = (reason: string) =>
    refundPaymentSafely({
      provider,
      paymentId,
      refundReference: request.refundReference,
      orderId: createdOrderId,
      amount: request.amount,
      reason,
    });

  const markOrderFailed = async (orderId: string) => {
    try {
      // payment_status stays "paid": the refund endpoint requires it.
      await deps.updateOrderStatus({ orderId, status: FAILED_ORDER_STATUS });
    } catch (updateError) {
      captureError(updateError, {
        service,
        action: "markOrderFailed",
        metadata: { orderId },
      });
    }
  };

  const createOrder = async (): Promise<string> => {
    try {
      createdOrderId =
        (await deps.createOrderFromCart({
          user: request.user,
          cart: request.cartSnapshot,
          paymentStatus: "paid",
          shippingAddress: request.shippingAddress,
          billingAddress: request.billingAddress,
          idempotencyKey,
          paymentMethod: provider,
          paymentAmountCents: request.amount,
          shippingCostCents: request.shippingCostCents,
          discountCents: request.discountCents,
        })) ?? null;

      if (createdOrderId) {
        await OrderService.linkPaymentTransactionToOrder({
          paymentProvider: provider,
          paymentIntentId: paymentId,
          orderId: createdOrderId,
        });
      }
    } catch (orderError) {
      captureError(orderError, { service, action: "createOrder" });
      await refund("Order creation failed");
      throw new UserFacingError(
        request.messages.orderCreationFailed(orderError),
      );
    }

    if (!createdOrderId) {
      await refund("Order ID not returned");
      throw new UserFacingError(request.messages.orderIdMissing);
    }

    return createdOrderId;
  };

  const fetchOrderNumber = async (orderId: string) => {
    try {
      const order = await OrderService.getOrder(orderId);
      return order?.order_number ?? null;
    } catch (fetchError) {
      captureError(fetchError, {
        service,
        action: "fetchOrderDetails",
        metadata: { orderId },
      });
      return null;
    }
  };

  const createPrintifyOrder = async (orderId: string) => {
    let printifyOrderId: string | undefined;

    try {
      const printifyResult = await deps.createPrintifyOrder({
        line_items: request.lineItems,
        shipping_address: mapShippingAddressToPrintifyAddress(
          request.shippingAddress,
        ),
        is_test: false,
        metadata: {
          payment_intent_id: paymentId,
          order_id: orderId,
          provider,
          ...request.metadata,
        },
      });
      printifyOrderId = printifyResult?.order?.id;
    } catch (printifyError) {
      captureError(printifyError, {
        service,
        action: "createPrintifyOrder",
        metadata: { paymentId, orderId },
      });
      // Mark the order failed BEFORE refunding: the endpoint checks the status.
      await markOrderFailed(orderId);
      await refund("Printify fulfillment failed");
      throw new UserFacingError(
        request.messages.fulfillmentFailed(printifyError),
      );
    }

    // The Printify order exists from here on, so failures must not refund.
    if (!printifyOrderId) return;
    try {
      await OrderService.updateOrder(orderId, {
        printify_order_id: printifyOrderId,
      });
    } catch (updateError) {
      captureError(updateError, {
        service,
        action: "savePrintifyOrderId",
        metadata: { printifyOrderId, orderId },
      });
    }
  };

  const generateInvoice = async (orderId: string) => {
    try {
      await InvoiceService.generateInvoice(orderId);
    } catch (invoiceError) {
      // Non-blocking: the invoice can be regenerated from the order details.
      captureError(invoiceError, {
        service,
        action: "generateInvoice",
        metadata: { orderId },
      });
    }
  };

  const removeOrderedCartItems = async () => {
    // Only the ordered items leave the cart; unselected items stay.
    const orderedCartItemIds = request.cartSnapshot.cart_items.map(
      (item) => item.id,
    );
    try {
      await deps.removeCartItems(orderedCartItemIds);
    } catch (cartError) {
      captureError(cartError, {
        service,
        action: "removeCartItems",
        metadata: { orderedCartItemIds },
      });
    }
  };

  const runPipeline = async (): Promise<OrderFulfillmentResultI> => {
    const orderId = await createOrder();
    const orderNumber = await fetchOrderNumber(orderId);
    await createPrintifyOrder(orderId);
    await PaymentRecoveryService.markPaymentRecovered(
      paymentId,
      provider,
      orderId,
    );
    if (request.generateInvoice) await generateInvoice(orderId);
    await removeOrderedCartItems();
    return { orderNumber };
  };

  try {
    return await withTimeout(
      runPipeline(),
      PAYMENT_PIPELINE_TIMEOUT_MS,
      new PaymentPipelineTimeoutError(PAYMENT_PIPELINE_TIMEOUT_MS),
    );
  } catch (pipelineError) {
    if (pipelineError instanceof PaymentPipelineTimeoutError) {
      if (createdOrderId) await markOrderFailed(createdOrderId);
      await refund(`${provider} checkout pipeline timed out`);
    }
    throw pipelineError;
  }
}
