export default function ProductCustomizationShimmer() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
