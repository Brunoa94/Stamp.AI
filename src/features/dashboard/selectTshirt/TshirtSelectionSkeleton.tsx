const Shimmer = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const TshirtSelectionSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Shimmer className="h-8 w-64 mb-2" />
        <Shimmer className="h-4 w-96" />
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-wrap gap-4">
        <Shimmer className="h-10 w-40" />
        <Shimmer className="h-10 w-32" />
        <Shimmer className="h-10 w-36" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Shimmer className="h-48 w-full" />
            <Shimmer className="h-6 w-3/4" />
            <Shimmer className="h-4 w-full" />
            <div className="flex gap-2">
              <Shimmer className="h-6 w-16" />
              <Shimmer className="h-6 w-16" />
            </div>
            <Shimmer className="h-6 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TshirtSelectionSkeleton;
