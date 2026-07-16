import { useTranslations } from "next-intl";
import { canCancelOrder } from "../../../lib/utils/orderCancellation";
import { formatOrderDate } from "../../../lib/utils/formatOrderDate";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { OrderWithItemsT } from "@/types/order";
import type { getFirstOrderItem } from "../../../lib/helpers/orderPresentation";
import { getAddressSummary } from "../../../lib/helpers/orderPresentation";

interface PropsI {
  order: OrderWithItemsT;
  firstItem: ReturnType<typeof getFirstOrderItem>;
  onOpenDetails: (order: OrderWithItemsT) => void;
  onCancelOrder: (order: OrderWithItemsT) => void;
  onReorder: () => void;
}

export function OrdersGridItemContent({
  order,
  firstItem,
  onOpenDetails,
  onCancelOrder,
  onReorder,
}: PropsI) {
  const t = useTranslations("orders.gridItem");
  const canCancel = canCancelOrder(order);

  return (
    <div className="flex flex-col items-center p-4 text-center font-heading">
      <Span
        variant="micro"
        className="mb-1 font-bold uppercase text-sm tracking-[0.2em] text-(--color-stamp-taupe)"
      >
        #{order.order_number || order.id.slice(0, 13).toUpperCase()}
      </Span>
      <Paragraph
        variant="sm"
        className="mb-3 font-bold uppercase text-lg tracking-widest text-(--color-stamp-taupe)"
      >
        {t("archiveLine", {
          date: formatOrderDate(order.created_at),
          address: getAddressSummary(order) || t("archiveAddress"),
        })}
      </Paragraph>

      <Heading
        as="h3"
        unstyled
        className="mb-1 line-clamp-2 font-heading text-lg font-bold uppercase leading-tight tracking-tight"
      >
        {firstItem?.product_name || t("productFallback")}
      </Heading>

      <div className="mb-4 flex gap-2 text-sm font-bold uppercase tracking-widest text-(--color-stamp-taupe)">
        <Span unstyled>{firstItem?.variant_name || t("standard")}</Span>
        <Span
          unstyled
          className="mt-1.5 h-0.5 w-0.5 rounded-full bg-(--color-stamp-divider)"
        />
        <Span unstyled>{t("qty", { count: firstItem?.quantity || 1 })}</Span>
      </div>

      <Heading
        as="h4"
        unstyled
        className="mb-4 font-heading text-3xl font-black tracking-tight text-(--color-stamp-gold)"
      >
        {formatPrice(order.total_amount)}
      </Heading>

      <div className="grid w-full grid-cols-2 gap-2">
        <Button
          onClick={() => onOpenDetails(order)}
          variant="default"
          className="justify-center bg-(--color-stamp-chocolate) px-0 py-2 font-heading font-semibold uppercase text-sm tracking-[0.15em] text-(--color-stamp-white) transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-(--color-stamp-gold) hover:shadow-(--shadow-stamp-gold-cta)"
        >
          {t("track")}
        </Button>
        <Button
          onClick={() => (canCancel ? onCancelOrder(order) : onReorder())}
          variant="outline"
          className="justify-center border-(--color-stamp-divider) px-0 py-2 font-heading font-semibold uppercase text-sm tracking-[0.15em] text-(--color-stamp-chocolate) transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white)"
        >
          {canCancel ? t("options") : t("reorder")}
        </Button>
      </div>
    </div>
  );
}
