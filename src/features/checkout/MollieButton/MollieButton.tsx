"use client";

import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/features/ui/button";
import { isMollieConfigured } from "@/lib/mollie";
import { CheckoutErrorDisplay } from "../components";
import type { ShippingAddressT } from "@/schemas/checkout";
import type { PrintifyLineItem } from "@/types/printifyOrder";
import { useMollieButton, type MollieRedirectDetailsI } from "./useMollieButton";

interface Props {
  amount: number;
  currency?: string;
  description?: string;
  lineItems: PrintifyLineItem[];
  shippingAddress: ShippingAddressT;
  testMode?: boolean;
  onRedirect?: (details: MollieRedirectDetailsI) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function MollieButton({
  amount,
  currency = "EUR",
  description,
  lineItems,
  shippingAddress,
  testMode = false,
  onRedirect,
  onError,
  disabled = false,
}: Props) {
  const { error, loading, handlePayment, clearError } = useMollieButton({
    amount,
    currency,
    description,
    lineItems,
    shippingAddress,
    testMode,
    onRedirect,
    onError,
  });

  // Check if Mollie is configured
  if (!isMollieConfigured()) {
    return (
      <div className="p-4 text-sm text-amber-600 bg-amber-50 rounded-lg border border-amber-200">
        Mollie is not configured. Please set NEXT_PUBLIC_MOLLIE_ENABLED=true in
        your environment variables.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <CheckoutErrorDisplay error={error} onDismiss={clearError} />}

      <Button
        type="button"
        onClick={handlePayment}
        disabled={disabled || loading}
        className="w-full h-12 bg-[#0A6F5C] hover:bg-[#085647] text-white font-medium rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Redirecting to Mollie...
          </>
        ) : (
          <>
            <Building2 className="w-5 h-5 mr-2" />
            Pay with Mollie
          </>
        )}
      </Button>

      <p className="text-xs text-center text-slate-500">
        You will be redirected to Mollie to complete your payment securely.
        <br />
        Supports iDEAL, Bancontact, SOFORT, Credit Cards, and more.
      </p>
    </div>
  );
}
