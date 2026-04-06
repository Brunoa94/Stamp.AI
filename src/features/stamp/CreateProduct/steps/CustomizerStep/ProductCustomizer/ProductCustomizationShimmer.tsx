import { Shimmer } from "@/features/ui/shimmer";

export default function ProductCustomizationShimmer() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Shimmer className="h-4 w-20" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Shimmer key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Shimmer className="h-4 w-16" />
        <div className="grid grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Shimmer key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
