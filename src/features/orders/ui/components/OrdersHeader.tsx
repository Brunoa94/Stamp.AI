import { Heading } from "@/features/ui/heading";
import { OrdersFilterSummary } from "../sections/OrdersFilterSection/OrdersFilterSummary";

interface PropsI {
  total: number;
}

export function OrdersHeader({ total }: PropsI) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-4">
        <div className="h-1.5 w-20 bg-(--color-stamp-gold)" />
        <Heading
          as="h1"
          variant="title"
          className="text-(--color-stamp-chocolate)"
        >
          Your{" "}
          <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
            orders
          </span>
        </Heading>
      </div>

      <OrdersFilterSummary total={total} />
    </header>
  );
}
