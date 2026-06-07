interface PromoCodesSkeletonListProps {
  count: number;
}

export function PromoCodesSkeletonList({ count }: PromoCodesSkeletonListProps) {
  return Array.from({ length: count }).map((_, idx) => (
    <article
      key={`promo-skeleton-${idx}`}
      className="h-30 w-72 shrink-0 animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80"
    />
  ));
}
