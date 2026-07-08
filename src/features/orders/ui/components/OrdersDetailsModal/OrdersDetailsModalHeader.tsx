import { formatOrderDate } from "../../../lib/utils/formatOrderDate";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { OrderWithItemsT } from "@/types/order";
import { getStatusBadgeClass } from "../../../lib/helpers/statusPresentation";

interface PropsI {
  order: OrderWithItemsT;
  displayedStatus: string;
}

export function OrdersDetailsModalHeader({ order, displayedStatus }: PropsI) {
  return (
    <div className="mb-10">
      <Span
        unstyled
        className={`inline-flex rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] ${getStatusBadgeClass(displayedStatus)}`}
      >
        {displayedStatus}
      </Span>
      <Heading
        as="h3"
        variant="card"
        className="mt-4 text-3xl tracking-tight text-(--color-stamp-chocolate)"
      >
        Protocol Record Details
      </Heading>
      <Paragraph
        variant="sm"
        className="mt-1 text-[10px] tracking-[0.2em] text-(--color-stamp-taupe)"
      >
        Order #{order.order_number || order.id.slice(0, 13).toUpperCase()} •
        Initiated {formatOrderDate(order.created_at)}
      </Paragraph>
    </div>
  );
}
