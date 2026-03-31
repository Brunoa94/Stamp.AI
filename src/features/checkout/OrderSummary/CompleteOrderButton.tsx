import { Button } from "@/features/ui/button";
import clsx from "clsx";
import { CheckoutSelectors } from "../context/CheckoutContextSubscriber/selectors";
import Link from "next/link";
import { PAYMENT_CONFIRM_METHOD_UI } from "@/constants/payment";

interface CompleteOrderButtonProps {
  onCompleteOrder: () => void;
}

export const CompleteOrderButton = ({
  onCompleteOrder,
}: CompleteOrderButtonProps) => {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const isProcessingPayment = CheckoutSelectors.isProcessingPayment();
  const selectedPaymentMethod = CheckoutSelectors.selectedPaymentMethod();
  const hasShippingAddress = !!shippingAddress;
  const selectedUi = PAYMENT_CONFIRM_METHOD_UI[selectedPaymentMethod];

  return (
    <div className="pt-4">
      <div className="flex flex-col gap-3">
        <Button
          onClick={onCompleteOrder}
          disabled={!hasShippingAddress || isProcessingPayment}
          className={clsx(
            "w-full rounded-none text-white font-heading font-extrabold uppercase tracking-widest py-4 shadow-lg",
            selectedUi.className,
            {
              "opacity-50 cursor-not-allowed":
                !hasShippingAddress || isProcessingPayment,
            },
          )}
        >
          <selectedUi.Icon className="w-4 h-4" />
          {isProcessingPayment ? "Processing..." : selectedUi.labelDesktop}
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full rounded-none border-slate-200 text-slate-500 font-heading text-xs uppercase tracking-widest py-4"
        >
          <Link href="/cart">Back to Cart</Link>
        </Button>
      </div>

      <Link
        href="/cart"
        className="mt-4 block text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-purple-600 transition-colors"
      >
        Edit Selection
      </Link>

      {!hasShippingAddress && (
        <p className="text-xs text-slate-500 mt-3 text-center">
          Please complete billing address first
        </p>
      )}
    </div>
  );
};
