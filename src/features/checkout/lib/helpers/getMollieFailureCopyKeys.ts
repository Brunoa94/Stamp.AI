import type { MolliePaymentStatus } from "@/lib/mollie";

interface MollieFailureCopyKeysI {
  statusKey: string;
  reasonKey: string;
}

/** Translation keys describing why a Mollie payment did not go through. */
export function getMollieFailureCopyKeys(
  providerStatus: MolliePaymentStatus | null,
): MollieFailureCopyKeysI {
  switch (providerStatus) {
    case "canceled":
      return { statusKey: "canceledStatus", reasonKey: "reasonCanceled" };
    case "expired":
      return { statusKey: "failedStatus", reasonKey: "reasonExpired" };
    default:
      return { statusKey: "failedStatus", reasonKey: "reasonDefault" };
  }
}
