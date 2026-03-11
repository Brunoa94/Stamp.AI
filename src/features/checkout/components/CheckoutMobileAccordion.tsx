"use client";

import { useState } from "react";
import {
  ChevronDown,
  Check,
  MapPin,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { CheckoutSelectors } from "../context";
import { ShippingSection } from "../sections/ShippingSection";
import { PaymentSection } from "../sections/PaymentSection";
import { OrderSummarySection } from "../sections/OrderSummarySection";

type AccordionStep = "summary" | "shipping" | "payment";

interface AccordionPanelProps {
  id: AccordionStep;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  isOpen: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function AccordionPanel({
  icon,
  title,
  subtitle,
  isOpen,
  isCompleted,
  isLocked,
  onToggle,
  children,
}: AccordionPanelProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl overflow-hidden transition-all duration-300",
        isLocked && "opacity-60",
      )}
    >
      {/* Panel Header */}
      <Button
        type="button"
        variant="ghost"
        aria-label={title}
        onClick={!isLocked ? onToggle : undefined}
        disabled={isLocked}
        className={cn(
          "w-full h-auto px-5 py-4 flex items-center justify-between rounded-none hover:bg-purple-50/40 transition-colors",
          isOpen && "border-b border-slate-100",
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
              isCompleted
                ? "bg-green-100 text-green-600"
                : isOpen
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-400",
            )}
          >
            {isCompleted ? <Check className="w-4 h-4" /> : icon}
          </div>
          <div className="text-left">
            <p
              className={cn(
                "text-sm font-heading font-bold uppercase tracking-wide",
                isOpen ? "text-slate-900" : "text-slate-500",
              )}
            >
              {title}
            </p>
            {subtitle && !isOpen && (
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {!isLocked && (
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0",
              isOpen && "rotate-180",
            )}
          />
        )}
      </Button>

      {/* Panel Content */}
      {isOpen && <div className="px-4 py-5">{children}</div>}
    </div>
  );
}

/**
 * Mobile-only accordion checkout flow.
 * Shows Shipping → Payment → Order Summary as collapsible panels.
 * Automatically unlocks payment once shipping address is filled.
 */
export function CheckoutMobileAccordion() {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const hasShipping = !!shippingAddress;

  const [openStep, setOpenStep] = useState<AccordionStep>("summary");

  const toggle = (step: AccordionStep) => {
    setOpenStep((prev) => (prev === step ? "summary" : step));
  };

  return (
    <div className="space-y-3">
      {/* Order Summary */}
      <AccordionPanel
        id="summary"
        icon={<ShoppingBag className="w-4 h-4" />}
        title="Order Summary"
        isOpen={openStep === "summary"}
        isCompleted={false}
        isLocked={false}
        onToggle={() => toggle("summary")}
      >
        <OrderSummarySection />
      </AccordionPanel>

      {/* Shipping */}
      <AccordionPanel
        id="shipping"
        icon={<MapPin className="w-4 h-4" />}
        title="Shipping"
        subtitle={
          hasShipping
            ? `${shippingAddress.address1}, ${shippingAddress.city}`
            : "Enter delivery details"
        }
        isOpen={openStep === "shipping"}
        isCompleted={hasShipping}
        isLocked={false}
        onToggle={() => toggle("shipping")}
      >
        <ShippingSection />
        {!hasShipping && (
          <div className="mt-4">
            <Button
              type="button"
              onClick={() => toggle("payment")}
              className="w-full py-4 font-heading uppercase tracking-widest bg-linear-to-br from-[#7C3AED] to-[#06B6D4] shadow-lg shadow-purple-500/30"
            >
              Continue to Payment
            </Button>
          </div>
        )}
      </AccordionPanel>

      {/* Payment */}
      <AccordionPanel
        id="payment"
        icon={<CreditCard className="w-4 h-4" />}
        title="Payment"
        subtitle={
          !hasShipping ? "Complete shipping first" : "Enter payment details"
        }
        isOpen={openStep === "payment"}
        isCompleted={false}
        isLocked={!hasShipping}
        onToggle={() => toggle("payment")}
      >
        <PaymentSection />
      </AccordionPanel>
    </div>
  );
}
