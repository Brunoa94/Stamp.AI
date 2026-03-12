import { Shimmer } from "@/features/common/Shimmer";

export function SizeTileSelectorSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3 sm:gap-4">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Shimmer
          key={i}
          className="h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-lg"
        />
      ))}
    </div>
  );
}
