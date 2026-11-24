import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { useTranslations } from "next-intl";
import { OrdersFilterSummary } from "../sections/OrdersFilterSection/OrdersFilterSummary";

interface PropsI {
  /** Number of orders shown; the summary is hidden when it is unknown (error state). */
  total?: number;
}

export function OrdersHeader({ total }: PropsI) {
  const t = useTranslations("orders.header");

  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="hero-copy space-y-4">
        <div aria-hidden className="h-1.5 w-16 rounded-full bg-(--color-stamp-gold)" />
        <Heading
          as="h1"
          variant="title"
          className="text-(--color-stamp-off-white)"
        >
          {t.rich("title", {
            accent: (chunks) => (
              <Span variant="serif" className="text-(--color-stamp-gold-light)">
                {chunks}
              </Span>
            ),
          })}
        </Heading>
      </div>

      {total !== undefined && <OrdersFilterSummary total={total} />}
    </header>
  );
}
