import { componentThemes } from "@/theme/components";
import { Shimmer } from "@/features/common/Shimmer";

/**
 * Loading skeleton for checkout page
 * Displays animated shimmer effect while data is being fetched
 */
export const CheckoutLoading = () => {
  return (
    <div className={`${componentThemes.container.page} py-8`}>
      <div className="max-w-6xl mx-auto px-4 space-y-6">
        <Shimmer className="h-10 w-1/4 rounded-lg" />
        <Shimmer className="h-5 w-1/3 rounded-lg" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <Shimmer className="h-80 rounded-2xl" />
            <Shimmer className="h-80 rounded-2xl" />
          </div>
          <div className="lg:w-5/12">
            <Shimmer className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
