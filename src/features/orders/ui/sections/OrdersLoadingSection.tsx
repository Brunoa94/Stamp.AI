export function OrdersLoadingSection() {
  return (
    <section
      className="space-y-4"
      aria-label="Loading orders"
      aria-busy="true"
      role="status"
    >
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="h-48 w-full border border-(--color-stamp-divider) bg-linear-to-r from-(--color-stamp-cream) via-(--color-stamp-divider) to-(--color-stamp-cream) bg-size-[200%_100%] animate-[archive-shimmer_1.5s_linear_infinite]"
        />
      ))}
    </section>
  );
}
