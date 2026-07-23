import { useTranslations } from "next-intl";
import { canCancelOrder } from "../../../lib/utils/orderCancellation";
import { formatOrderDate } from "../../../lib/utils/formatOrderDate";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
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
      <Span variant="meta" className="mb-1 text-(--color-stamp-taupe)">
        #{order.order_number || order.id.slice(0, 13).toUpperCase()}
      </Span>
      <Span variant="micro" className="mb-3 text-(--color-stamp-taupe)">
        {t("archiveLine", {
          date: formatOrderDate(order.created_at),
          address: getAddressSummary(order) || t("archiveAddress"),
        })}
      </Span>

      <Heading
        as="h3"
        variant="itemCompact"
        className="mb-1 line-clamp-2 leading-tight"
      >
        {firstItem?.product_name || t("productFallback")}
      </Heading>

      <div className="mb-4 flex gap-2">
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {firstItem?.variant_name || t("standard")}
        </Span>
        <Span
          unstyled
          className="mt-1.5 h-0.5 w-0.5 rounded-full bg-(--color-stamp-divider)"
        />
        <Span variant="micro" className="text-(--color-stamp-taupe)">
          {t("qty", { count: firstItem?.quantity || 1 })}
        </Span>
      </div>

      <Heading
        as="h4"
        variant="priceCompact"
        className="mb-4 text-(--color-stamp-gold)"
      >
        {formatPrice(order.total_amount)}
      </Heading>

      <div className="grid w-full grid-cols-2 gap-2">
        <Button onClick={() => onOpenDetails(order)} variant="primary-compact">
          {t("track")}
        </Button>
        <Button
          onClick={() => (canCancel ? onCancelOrder(order) : onReorder())}
          variant="secondary-compact"
        >
          {canCancel ? t("options") : t("reorder")}
        </Button>
      </div>
    </div>
  );
}
