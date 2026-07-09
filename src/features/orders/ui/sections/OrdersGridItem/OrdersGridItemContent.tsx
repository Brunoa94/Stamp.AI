import { canCancelOrder } from "../../../lib/utils/orderCancellation";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { OrderWithItemsT } from "@/types/order";
import type { getFirstOrderItem } from "../../../lib/helpers/orderPresentation";
import { getArchiveLine } from "../../../lib/helpers/orderPresentation";

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
  const canCancel = canCancelOrder(order);

  return (
    <div className="flex flex-col items-center p-4 text-center">
      <Span
        variant="micro"
        className="mb-1 font-bold uppercase text-[8px] tracking-[0.2em] text-(--color-stamp-taupe)"
      >
        #{order.order_number || order.id.slice(0, 13).toUpperCase()}
      </Span>
      <Paragraph
        variant="sm"
        className="mb-3 font-bold uppercase text-[7px] tracking-widest text-(--color-stamp-taupe)"
      >
        {getArchiveLine(order)}
      </Paragraph>

      <Heading
        as="h3"
        variant="item"
        className="mb-1 line-clamp-2 font-bold uppercase text-base leading-tight tracking-tight"
      >
        {firstItem?.product_name || "Premium Synthesis Product"}
      </Heading>

      <div className="mb-4 flex gap-2 text-[8px] font-bold uppercase tracking-widest text-(--color-stamp-taupe)">
        <Span unstyled>{firstItem?.variant_name || "Standard"}</Span>
        <Span
          unstyled
          className="mt-1.5 h-0.5 w-0.5 rounded-full bg-(--color-stamp-divider)"
        />
        <Span unstyled>Qty. {firstItem?.quantity || 1}</Span>
      </div>

      <Heading
        as="h4"
        variant="card"
        className="mb-4 font-black text-3xl tracking-tight text-(--color-stamp-gold)"
      >
        {formatPrice(order.total_amount)}
      </Heading>

      <div className="grid w-full grid-cols-2 gap-2">
        <Button
          onClick={() => onOpenDetails(order)}
          variant="default"
          className="justify-center bg-(--color-stamp-chocolate) px-0 py-2 font-semibold uppercase text-[8px] tracking-[0.15em] text-(--color-stamp-white) transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-(--color-stamp-gold) hover:shadow-(--shadow-stamp-gold-cta)"
        >
          Track
        </Button>
        <Button
          onClick={() => (canCancel ? onCancelOrder(order) : onReorder())}
          variant="outline"
          className="justify-center border-(--color-stamp-divider) px-0 py-2 font-semibold uppercase text-[8px] tracking-[0.15em] text-(--color-stamp-chocolate) transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-(--color-stamp-chocolate) hover:bg-(--color-stamp-chocolate) hover:text-(--color-stamp-white)"
        >
          {canCancel ? "Options" : "Reorder"}
        </Button>
      </div>
    </div>
  );
}
