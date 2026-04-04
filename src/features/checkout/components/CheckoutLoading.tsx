import clsx from "clsx";
import { componentThemes } from "@/theme/components";

/**
 * Loading skeleton for checkout page
 * Displays animated shimmer effect while data is being fetched
 */
export const CheckoutLoading = () => {
  return (
    <div className={clsx(componentThemes.container.page, "py-8")}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
