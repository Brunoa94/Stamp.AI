import { formatOrderDate } from "../../../lib/utils/formatOrderDate";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
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
  return (
    <div className="flex-1">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Heading
            as="h3"
            unstyled
            className="font-heading text-xl font-bold uppercase tracking-tight"
          >
            {firstItem?.product_name || "Premium Synthesis Product"}
          </Heading>
          <Span
            variant="default"
            className="font-bold uppercase text-[10px] tracking-[0.2em] text-(--color-stamp-taupe)"
          >
            #{order.order_number || order.id.slice(0, 13).toUpperCase()}
          </Span>
        </div>
        <Span
          unstyled
          className={`status-badge uppercase ${getStatusBadgeClass(displayedStatus)}`}
        >
          {displayedStatus}
        </Span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        <div>
          <Paragraph
            variant="sm"
            className="mb-1 font-bold uppercase text-[9px] tracking-widest text-(--color-stamp-taupe)"
          >
            Creation Date
          </Paragraph>
          <Paragraph
            variant="sm"
            className="font-bold text-xs text-(--color-stamp-chocolate)"
          >
            {formatOrderDate(order.created_at)}
          </Paragraph>
        </div>
        <div>
          <Paragraph
            variant="sm"
            className="mb-1 font-bold uppercase text-[9px] tracking-widest text-(--color-stamp-taupe)"
          >
            Configuration
          </Paragraph>
          <Paragraph
            variant="sm"
            className="font-bold text-xs text-(--color-stamp-chocolate)"
          >
            {firstItem?.variant_name || "Standard"}
          </Paragraph>
        </div>
        <div>
          <Paragraph
            variant="sm"
            className="mb-1 font-bold uppercase text-[9px] tracking-widest text-(--color-stamp-taupe)"
          >
            Quantity
          </Paragraph>
          <Paragraph
            variant="sm"
            className="font-bold text-xs text-(--color-stamp-chocolate)"
          >
            {String(firstItem?.quantity || 1).padStart(2, "0")} Unit
          </Paragraph>
        </div>
        <div>
          <Paragraph
            variant="sm"
            className="mb-1 font-bold uppercase text-[9px] tracking-widest text-(--color-stamp-taupe)"
          >
            Protocol Value
          </Paragraph>
          <Heading
            as="h4"
            unstyled
            className="font-heading text-2xl font-black tracking-tight text-(--color-stamp-chocolate)"
          >
            {formatPrice(order.total_amount)}
          </Heading>
        </div>
      </div>
    </div>
  );
}
