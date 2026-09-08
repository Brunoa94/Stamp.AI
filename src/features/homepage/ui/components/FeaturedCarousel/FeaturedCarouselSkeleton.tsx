/**
 * FeaturedCarouselSkeleton
 *
 * Loading skeleton for the featured carousel cards.
 */

interface FeaturedCarouselSkeletonProps {
  count?: number;
}

export function FeaturedCarouselSkeleton({
  count = 6,
}: FeaturedCarouselSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-72 shrink-0 border-2 border-(--color-stamp-divider) bg-linear-to-br from-(--color-stamp-cream) to-(--color-stamp-off-white) p-3 sm:w-80"
        >
          <div className="aspect-3/4 animate-pulse bg-(--color-stamp-divider)" />
          <div className="mt-3 space-y-2 border-t border-(--color-stamp-divider)/50 pt-3">
            <div className="h-4 w-3/4 animate-pulse bg-(--color-stamp-divider)" />
            <div className="h-3 w-1/2 animate-pulse bg-(--color-stamp-divider)" />
          </div>
        </div>
      ))}
    </>
  );
}
