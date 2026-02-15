import { Button } from "@/features/ui/button";
import { componentThemes } from "@/theme/components";
import clsx from "clsx";

interface CompleteOrderButtonProps {
  total: number;
  hasShippingAddress: boolean;
  isProcessingPayment: boolean;
  onCompleteOrder: () => void;
}

export const CompleteOrderButton = ({
  total,
  hasShippingAddress,
  isProcessingPayment,
  onCompleteOrder,
}: CompleteOrderButtonProps) => {
  return (
    <div className="pt-6">
      <Button
        onClick={onCompleteOrder}
        disabled={!hasShippingAddress || isProcessingPayment}
        className={clsx(
          componentThemes.button.primary,
          "w-full py-4 text-lg font-semibold",
          {
            "opacity-50 cursor-not-allowed": !hasShippingAddress || isProcessingPayment,
          }
        )}
      >
        {isProcessingPayment ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Processing...
          </>
        ) : (
          <>Complete Order - ${total.toFixed(2)}</>
        )}
      </Button>
      {!hasShippingAddress && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Please complete shipping address first
        </p>
      )}
    </div>
  );
};
