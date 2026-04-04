import { Shimmer } from "@/features/ui/shimmer";

export function FabricCardSelectorSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="glass-card rounded-xl p-6 space-y-4">
          {/* Image placeholder */}
          <Shimmer
            className="w-full rounded-lg"
            style={{ aspectRatio: "4/3" }}
          />

          {/* Title placeholder */}
          <Shimmer className="h-8 w-3/4" />

          {/* Price badge placeholder */}
          <Shimmer className="h-6 w-1/4" />

          {/* Description placeholder */}
          <Shimmer className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
