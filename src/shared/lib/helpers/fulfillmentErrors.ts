import { AppError } from "@/shared/services/errorClient";

const ALREADY_CLAIMED_CODE = "ORDER_FULFILLMENT_IN_PROGRESS";

/**
 * True when create-printify-order answered 409 ORDER_FULFILLMENT_IN_PROGRESS:
 * another request already claimed fulfillment for this order. The order is
 * being (or has been) manufactured, so the caller must not treat this as a
 * failed fulfillment and must not refund.
 */
export function isFulfillmentAlreadyClaimed(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === ALREADY_CLAIMED_CODE ||
      error.message.includes(ALREADY_CLAIMED_CODE);
  }
  return error instanceof Error && error.message.includes(ALREADY_CLAIMED_CODE);
}
