import { Heading } from "@/features/ui/heading";

export function OrderItemsListLoadingState() {
  return (
    <div className="space-y-3">
      <Heading as="h3" variant="question">
        Order Items
      </Heading>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse flex gap-4 p-4 border border-ink/10 rounded-lg"
          >
            <div className="w-20 h-20 bg-ink/10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-ink/10 rounded w-3/4" />
              <div className="h-3 bg-ink/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
