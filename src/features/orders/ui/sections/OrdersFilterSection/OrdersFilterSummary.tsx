import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

interface PropsI {
  total: number;
}

export function OrdersFilterSummary({ total }: PropsI) {
  const t = useTranslations("orders.filterSummary");

  return (
    <div className="shrink-0 sm:text-right">
      <Span variant="label" className="text-(--color-stamp-taupe)">
        {t("totalSyntheses")}
      </Span>
      <div className="flex items-baseline gap-2 sm:justify-end">
        <Span variant="metric" className="text-(--color-stamp-chocolate)">
          {total}
        </Span>
        <Span variant="sm" className="text-(--color-stamp-chocolate)">
          {t("protocolRecords")}
        </Span>
      </div>
    </div>
  );
}
