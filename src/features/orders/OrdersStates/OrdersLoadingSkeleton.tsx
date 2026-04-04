import { Shimmer } from "@/features/ui/shimmer";

export function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Shimmer */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Shimmer className="h-10 w-48" />
          <Shimmer className="h-6 w-64" />
        </div>
        <Shimmer className="h-10 w-40" />
      </div>

      {/* Filters Shimmer */}
      <div className="flex flex-wrap gap-4">
        <Shimmer className="h-10 w-32" />
        <Shimmer className="h-10 w-32" />
        <Shimmer className="h-10 w-32" />
        <Shimmer className="h-10 w-24" />
      </div>

      {/* List Shimmer */}
      <ul className="space-y-4 list-none">
        {Array.from({ length: 5 }).map((_, index) => (
          <li key={index} className="border border-gray-200 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              {/* Left: Order Info */}
              <div className="flex-1 space-y-2">
                <Shimmer className="h-7 w-32" />
                <Shimmer className="h-4 w-24" />
                <Shimmer className="h-4 w-28" />
                <Shimmer className="h-4 w-20" />
              </div>

              {/* Middle: Status Badges */}
              <div className="flex gap-2">
                <Shimmer className="h-6 w-20" />
                <Shimmer className="h-6 w-20" />
              </div>

              {/* Right: Amount and Action */}
              <div className="flex flex-col items-end gap-2">
                <Shimmer className="h-4 w-12" />
                <Shimmer className="h-8 w-24" />
                <Shimmer className="h-9 w-28" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
