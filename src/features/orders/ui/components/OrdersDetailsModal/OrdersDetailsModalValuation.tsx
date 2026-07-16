import { useTranslations } from "next-intl";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

interface PropsI {
  totalAmount: number;
}

export function OrdersDetailsModalValuation({ totalAmount }: PropsI) {
  const t = useTranslations("orders.detailsModal");

  return (
    <aside className="self-start border border-(--color-stamp-divider) bg-(--color-stamp-cream)/40 p-8">
      <Span
        variant="default"
        className="mb-6 block border-b border-(--color-stamp-divider) pb-2 tracking-[0.3em] text-(--color-stamp-gold)"
      >
        {t("valuation")}
      </Span>
      <div className="flex items-center justify-between border-t border-(--color-stamp-divider) pt-4">
        <Span
          variant="default"
          className="text-[11px] tracking-normal text-(--color-stamp-chocolate)"
        >
          {t("total")}
        </Span>
        <Heading
          as="h5"
          variant="card"
          className="text-3xl tracking-tight text-(--color-stamp-gold)"
        >
          {formatPrice(totalAmount)}
        </Heading>
      </div>
    </aside>
  );
}
