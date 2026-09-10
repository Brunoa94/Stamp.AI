import { useTranslations } from "next-intl";
import { formatOrderDate } from "../../../lib/utils/formatOrderDate";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import type { OrderWithItemsT } from "@/types/order";
import type { getFirstOrderItem } from "../../../lib/helpers/orderPresentation";
import { getStatusBadgeClass } from "../../../lib/helpers/statusPresentation";

interface PropsI {
  order: OrderWithItemsT;
  firstItem: ReturnType<typeof getFirstOrderItem>;
  displayedStatus: string;
}

export function OrdersListItemContent({
  order,
  firstItem,
  displayedStatus,
}: PropsI) {
  const t = useTranslations("orders.listItem");
  const tStatus = useTranslations("orders.statusBadge");

  return (
    <div className="flex-1">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Heading as="h3" variant="itemCompact">
            {firstItem?.product_name || t("productFallback")}
          </Heading>
          <Span variant="meta" className="text-(--color-stamp-taupe)">
            #{order.order_number || order.id.slice(0, 13).toUpperCase()}
          </Span>
        </div>
        <Span
          variant="badge"
          className={`status-badge ${getStatusBadgeClass(displayedStatus)}`}
        >
          {tStatus(displayedStatus)}
        </Span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        <div>
          <Span
            variant="label"
            className="mb-1 block text-(--color-stamp-taupe)"
          >
            {t("creationDate")}
          </Span>
          <Span variant="value" className="text-(--color-stamp-chocolate)">
            {formatOrderDate(order.created_at)}
          </Span>
        </div>
        <div>
          <Span
            variant="label"
            className="mb-1 block text-(--color-stamp-taupe)"
          >
            {t("configuration")}
          </Span>
          <Span variant="value" className="text-(--color-stamp-chocolate)">
            {firstItem?.variant_name || t("standard")}
          </Span>
        </div>
        <div>
          <Span
            variant="label"
            className="mb-1 block text-(--color-stamp-taupe)"
          >
            {t("quantity")}
          </Span>
          <Span variant="value" className="text-(--color-stamp-chocolate)">
            {t("unit", {
              count: String(firstItem?.quantity || 1).padStart(2, "0"),
            })}
          </Span>
        </div>
        <div>
          <Span
            variant="label"
            className="mb-1 block text-(--color-stamp-taupe)"
          >
            {t("protocolValue")}
          </Span>
          <Heading
            as="h4"
            variant="priceCompact"
            className="text-(--color-stamp-chocolate)"
          >
            {formatPrice(order.total_amount)}
          </Heading>
        </div>
      </div>
    </div>
  );
}
