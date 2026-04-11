import { Box } from "lucide-react";
import { Shimmer } from "@/features/ui/shimmer";

export function OrderItemsListShimmer() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Box className="h-4 w-4 text-neutral-400" />
        <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-[#111111]">
          Order Items
        </h3>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="flex gap-4 rounded-2xl border border-neutral-100 p-4"
          >
            <Shimmer className="h-20 w-20 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-3/4 rounded bg-gray-200" />
              <Shimmer className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
