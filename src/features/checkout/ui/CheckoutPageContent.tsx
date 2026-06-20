"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCartById } from "@/queries/cartQueries";
import { CheckoutHeaderSection } from "./sections/CheckoutHeaderSection";
import { BillingAddressSection } from "./sections/BillingAddressSection";
import { ShippingAddressToggle } from "./sections/ShippingAddressToggle";
import { ShippingAddressSection } from "./sections/ShippingAddressSection";
import { PaymentMethodSection } from "./sections/PaymentMethodSection";
import { OrderSummarySection } from "./sections/OrderSummarySection";
import { checkoutTheme } from "@/theme";
import { CheckoutLoading } from "./Checkout/CheckoutLoading";
import { CartNotFound } from "./Checkout/CartNotFound";
import { CheckoutFormProvider } from "../lib/context/CheckoutFormContext";
import { PageContainer } from "@/shared/ui/PageContainer";

export function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cartId");

  // Fetch cart data
  const { data: cart, isLoading, error } = useCartById(cartId || "");

  if (isLoading) {
    return <CheckoutLoading />;
  }

  if (error || !cart) {
    return <CartNotFound />;
  }

  return (
    <CheckoutFormProvider cartId={cartId}>
      <CheckoutFormContent cart={cart} />
    </CheckoutFormProvider>
  );
}

function CheckoutFormContent({ cart }: { cart: any }) {
  const [testMode, setTestMode] = useState(false);
  const [selectedTestMethod, setSelectedTestMethod] = useState<string>("visa");

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <div className="flex-1 px-6 lg:px-12 xl:px-24">
        <PageContainer>
          <div className={checkoutTheme.page.mainContent}>
            <CheckoutHeaderSection />

            {/* Test Mode Toggle */}
            <div className="mb-6 flex items-center gap-3 border border-yellow-200 bg-yellow-50/80 px-4 py-3 rounded-lg">
              <input
                type="checkbox"
                id="testMode"
                checked={testMode}
                onChange={(e) => setTestMode(e.target.checked)}
                className="w-4 h-4 text-yellow-600 bg-white border-yellow-300 rounded focus:ring-yellow-500 focus:ring-2 cursor-pointer"
              />
              <label
                htmlFor="testMode"
                className="text-xs font-bold uppercase tracking-widest text-slate-600 cursor-pointer select-none"
              >
                Test Mode (use predefined payment methods)
              </label>
            </div>

            <div className={checkoutTheme.page.grid}>
              {/* Left Column: Forms */}
              <div className={checkoutTheme.page.formsColumn}>
                <BillingAddressSection />
                <ShippingAddressToggle />
                <ShippingAddressSection />
                <PaymentMethodSection
                  testMode={testMode}
                  selectedTestMethod={selectedTestMethod}
                  onTestMethodChange={setSelectedTestMethod}
                />
              </div>

              {/* Right Column: Order Summary */}
              <aside className={checkoutTheme.page.summaryColumn}>
                <OrderSummarySection
                  cart={cart}
                  cartId={cart.id}
                  isLoading={false}
                  testMode={testMode}
                  selectedTestMethod={selectedTestMethod}
                />
              </aside>
            </div>
          </div>
        </PageContainer>
      </div>
    </div>
  );
}
