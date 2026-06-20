/**
 * Order Summary Component
 *
 * Displays order summary sidebar with:
 * - Sticky positioning
 * - Price breakdown (subtotal, shipping, tax)
 * - Total with large purple Anton typography
 * - Checkout button with arrow animation
 * - Shipping estimate info
 * - Payment provider logos
 */

"use client";

import { ArrowRight, Truck, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { CartWithItems } from "@/types/cart";
import { CartServiceMapper } from "@/mappers/services/cartServiceMapper";

interface OrderSummaryPropsI {
  cart: CartWithItems;
  onCheckout: () => void;
}

export function OrderSummary({
  cart,
  onCheckout,
}: OrderSummaryPropsI) {
  // Calculate cart totals
  const { subtotal, shipping } = CartServiceMapper.calculateCartTotals(
    cart.cart_items,
  );
  const total = subtotal + shipping;

  // Format currency
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className="sticky top-32 bg-white border border-ink/10 p-8 lg:p-12 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <Heading as="h2" variant="card" className="mb-8">
        Order <span className="text-brandPurple">Summary</span>
      </Heading>

      {/* Price breakdown */}
      <div className="space-y-6 mb-10">
        <div className="flex justify-between items-center">
          <Span variant="default" className="opacity-40">
            Subtotal
          </Span>
          <Span variant="default">{formatCurrency(subtotal)}</Span>
        </div>
        <div className="flex justify-between items-center">
          <Span variant="default" className="opacity-40">
            Shipping Protocol
          </Span>
          <Span variant="default" className="text-green-600">
            {shipping === 0 ? "Free" : formatCurrency(shipping)}
          </Span>
        </div>
        <div className="flex justify-between items-center">
          <Span variant="default" className="opacity-40">
            Tax Logistics
          </Span>
          <Span variant="micro" className="opacity-20">
            Calculated at checkout
          </Span>
        </div>
      </div>

      {/* Total */}
      <div className="py-8 border-y border-ink/5">
        <div className="flex justify-between items-baseline">
          <Heading as="span" variant="card" className="text-xl">
            Total
          </Heading>
          <Heading
            as="span"
            variant="section"
            className="text-xl text-brandPurple"
          >
            {formatCurrency(total)}
          </Heading>
        </div>
        <Span
          variant="micro"
          className="opacity-20 mt-2 block text-right tracking-[0.2em]"
        >
          Currency: USD / Terminal NYC
        </Span>
      </div>

      {/* Checkout button and shipping info */}
      <div className="mt-10 space-y-6">
        <Button
          onClick={onCheckout}
          variant="brutalist-checkout"
          className="w-full shadow-xl shadow-brandPurple/5 group"
        >
          Proceed to Checkout
          <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
        </Button>

        {/* Shipping estimate */}
        <div className="flex items-center gap-4 px-4 py-4 bg-concrete/50 border border-ink/5">
          <Truck className="w-6 h-6 opacity-20" />
          <div className="flex-1">
            <Span variant="micro" className="opacity-40">
              Estimated Arrival
            </Span>
            <Span variant="default" className="block text-xs mt-1">
              3-5 Business Days
            </Span>
          </div>
        </div>

        {/* Payment logos */}
        <div className="pt-4 flex flex-col items-center gap-4 opacity-30">
          <Span variant="micro" className="tracking-[0.4em]">
            Secure encrypted transactions
          </Span>
          <div className="flex gap-6 items-center">
            <CreditCard className="w-5 h-5" aria-label="Visa" />
            <CreditCard className="w-5 h-5" aria-label="Mastercard" />
            <CreditCard className="w-5 h-5" aria-label="Stripe" />
            <Wallet className="w-5 h-5" aria-label="Apple Pay" />
          </div>
        </div>
      </div>
    </div>
  );
}
