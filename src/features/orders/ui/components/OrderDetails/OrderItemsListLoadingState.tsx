import { componentThemes } from "@/theme";

export function OrderItemsListLoadingState() {
  return (
    <div className="space-y-3">
      <h3 className={componentThemes.text.subheading}>Order Items</h3>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse flex gap-4 p-4 border border-gray-200 rounded-lg"
          >
            <div className="w-20 h-20 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
