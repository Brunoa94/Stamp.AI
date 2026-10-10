import { UserFacingError } from "./UserFacingError";

/** Thrown when the post-payment fulfillment pipeline exceeds its time budget. */
export class PaymentPipelineTimeoutError extends UserFacingError {
  constructor(timeoutMs: number) {
    super(
      `Order processing timed out after ${Math.round(timeoutMs / 1000)} seconds. ` +
        `A full refund has been initiated and will appear within 3–5 business days.`,
    );
    this.name = "PaymentPipelineTimeoutError";
  }
}
