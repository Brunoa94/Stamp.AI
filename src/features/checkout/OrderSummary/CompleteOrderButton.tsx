import { Button } from "@/features/ui/button";
import clsx from "clsx";
import { CheckoutSelectors } from "../context/CheckoutContextSubscriber/selectors";
import Link from "next/link";

interface CompleteOrderButtonProps {
  onCompleteOrder: () => void;
}

export const CompleteOrderButton = ({
  onCompleteOrder,
}: CompleteOrderButtonProps) => {
  const shippingAddress = CheckoutSelectors.shippingAddress();
  const isProcessingPayment = CheckoutSelectors.isProcessingPayment();
  const hasShippingAddress = !!shippingAddress;

  return (
    <div className="pt-4">
      <div className="flex flex-col gap-3">
        <Button
          onClick={onCompleteOrder}
          disabled={!hasShippingAddress || isProcessingPayment}
          className={clsx(
            "w-full rounded-none bg-linear-to-br from-[#7C3AED] to-[#06B6D4] text-white font-heading font-extrabold uppercase tracking-widest py-4 shadow-lg",
            {
              "opacity-50 cursor-not-allowed":
                !hasShippingAddress || isProcessingPayment,
            },
          )}
        >
          {isProcessingPayment ? "Processing..." : `Complete Order`}
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
