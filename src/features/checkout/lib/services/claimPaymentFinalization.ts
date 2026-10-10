import type {
  PaymentReturnProviderT,
  PaymentReturnStateI,
  PaymentReturnUpdateT,
} from "../types/paymentReturn";
import { PaymentFinalizationLockService } from "./paymentFinalizationLockService";

/**
 * Take the finalization lock for a payment. Returns false when this run
 * must stop: either the payment was already finalized (state moves to
 * success) or another run currently holds the lock.
 */
export function claimPaymentFinalization<TState extends PaymentReturnStateI>(
  provider: PaymentReturnProviderT,
  paymentId: string,
  update: PaymentReturnUpdateT<TState>,
): boolean {
  if (PaymentFinalizationLockService.isFinalized(provider, paymentId)) {
    update({ status: "success" } as Partial<TState>);
    return false;
  }
  if (PaymentFinalizationLockService.isLocked(provider, paymentId)) {
    return false;
  }

  PaymentFinalizationLockService.acquire(provider, paymentId);
  return true;
}
