import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { OrderWithItemsT } from "@/types/order";
import { getAddressSummary } from "../../../lib/helpers/orderPresentation";

interface PropsI {
  order: OrderWithItemsT;
}

export function OrdersDetailsModalDelivery({ order }: PropsI) {
  return (
    <section>
      <Span
        variant="default"
        className="mb-5 block border-b border-(--color-stamp-divider) pb-2 tracking-[0.3em] text-(--color-stamp-gold)"
      >
        Delivery
      </Span>
      <Paragraph variant="sm" className="text-xs text-(--color-stamp-chocolate)">
        {order.customer_name || "Archive Client"}
      </Paragraph>
      <Paragraph variant="sm" className="text-xs text-(--color-stamp-taupe)">
        {getAddressSummary(order)}
      </Paragraph>
    </section>
  );
}
