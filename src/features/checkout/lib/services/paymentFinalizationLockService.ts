import type { PaymentReturnProviderT } from "../types/paymentReturn";

/**
 * PaymentFinalizationLockService
 * sessionStorage-backed idempotency guard for payment return pages.
 *
 * Prevents a page refresh or a second mount from finalizing the same
 * payment twice: a "finalizing" lock marks an in-flight run and a
 * "finalized" flag marks a completed one.
 */
export class PaymentFinalizationLockService {
  private static doneKey(provider: PaymentReturnProviderT, paymentId: string) {
    return `${provider}_finalized_${paymentId}`;
  }

  private static lockKey(provider: PaymentReturnProviderT, paymentId: string) {
    return `${provider}_finalizing_${paymentId}`;
  }

  static isFinalized(
    provider: PaymentReturnProviderT,
    paymentId: string,
  ): boolean {
    return sessionStorage.getItem(this.doneKey(provider, paymentId)) === "true";
  }

  static isLocked(
    provider: PaymentReturnProviderT,
    paymentId: string,
  ): boolean {
    return sessionStorage.getItem(this.lockKey(provider, paymentId)) === "true";
  }

  static acquire(provider: PaymentReturnProviderT, paymentId: string): void {
    sessionStorage.setItem(this.lockKey(provider, paymentId), "true");
  }

  static release(provider: PaymentReturnProviderT, paymentId: string): void {
    sessionStorage.removeItem(this.lockKey(provider, paymentId));
  }

  static markFinalized(
    provider: PaymentReturnProviderT,
    paymentId: string,
  ): void {
    sessionStorage.setItem(this.doneKey(provider, paymentId), "true");
    this.release(provider, paymentId);
  }
}
