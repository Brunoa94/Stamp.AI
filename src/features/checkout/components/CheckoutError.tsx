import clsx from "clsx";
import { componentThemes } from "@/theme/components";

interface Props {
  error: Error;
}

/**
 * Error display component for checkout page
 * Shows user-friendly error message with action to return to dashboard
 */
export const CheckoutError = ({ error }: Props) => {
  const handleReturnToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className={clsx(componentThemes.container.page, "py-8")}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Failed to Load Order
          </h2>
          <p className="text-red-600 mb-4">{error.message}</p>
          <button
            onClick={handleReturnToDashboard}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
