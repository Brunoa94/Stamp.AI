"use client";

import { FaPaypal } from "react-icons/fa";

export function PayPalPlaceholder() {
  return (
    <div className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center">
      <FaPaypal className="w-12 h-12 text-[#003087] mx-auto mb-3" />
      <p className="text-slate-600 text-sm">
        PayPal support for credit purchases coming soon.
      </p>
      <p className="text-slate-400 text-xs mt-1">
        Please use a credit card for now.
      </p>
    </div>
  );
}
