import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { OrderWithItemsT } from "@/types/order";
import { getAddressSummary } from "../../../lib/helpers/orderPresentation";

interface PropsI {
  order: OrderWithItemsT;
}

export function OrdersDetailsModalDelivery({ order }: PropsI) {
  const t = useTranslations("orders.detailsModal");

  return (
    <section>
      <Span
        variant="default"
        className="mb-5 block border-b border-(--color-stamp-divider) pb-2 tracking-[0.3em] text-(--color-stamp-gold)"
      >
        {t("delivery")}
      </Span>
      <Paragraph variant="sm" className="text-lg text-(--color-stamp-chocolate)">
        {order.customer_name || t("archiveClient")}
      </Paragraph>
      <Paragraph variant="sm" className="text-lg text-(--color-stamp-taupe)">
        {getAddressSummary(order) || t("archiveAddress")}
      </Paragraph>
    </section>
  );
}
