import { CheckoutProgress } from "./CheckoutProgress";

type PaymentStatus = "idle" | "success" | "error";

interface Props {
  shippingAddress: any;
  isProcessingPayment: boolean;
  paymentStatus: PaymentStatus;
}

/**
 * Checkout page header with enhanced styling and animations
 */
export const CheckoutHeader = ({
  shippingAddress,
  isProcessingPayment,
  paymentStatus,
}: Props) => {
  return (
    <header className="mb-16 animate-fadeInUp">
      <div className="text-center mb-12">
        {/* Main Title with Gradient */}
        <div className="relative inline-block">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3 bg-size-[200%_auto] animate-[checkout-gradient-shift_3s_ease_infinite]">
            Secure Checkout
          </h1>

          {/* Decorative underline */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-linear-to-r from-purple-500 to-pink-500 rounded-full opacity-50" />
        </div>
      </div>

      {/* Progress Indicator */}
      <CheckoutProgress
        shippingAddress={shippingAddress}
        isProcessingPayment={isProcessingPayment}
        paymentStatus={paymentStatus}
      />
    </header>
  );
};
