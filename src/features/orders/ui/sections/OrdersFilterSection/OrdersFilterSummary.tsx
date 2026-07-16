import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

interface PropsI {
  total: number;
}

export function OrdersFilterSummary({ total }: PropsI) {
  const t = useTranslations("orders.filterSummary");

  return (
    <div className="shrink-0 sm:text-right">
      <Paragraph
        variant="sm"
        className="font-bold uppercase text-base md:text-lg tracking-[0.2em] text-(--color-stamp-taupe)"
      >
        {t("totalSyntheses")}
      </Paragraph>
      <div className="flex items-baseline gap-2 sm:justify-end">
        <Heading
          as="h2"
          variant="title"
          className="font-black text-4xl md:text-6xl tracking-tighter text-(--color-stamp-chocolate)"
        >
          {total}
        </Heading>
        <Span
          unstyled
          className="text-lg md:text-2xl font-bold uppercase tracking-tight text-(--color-stamp-chocolate)"
        >
          {t("protocolRecords")}
        </Span>
      </div>
    </div>
  );
}
