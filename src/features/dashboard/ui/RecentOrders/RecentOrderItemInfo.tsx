import { Span } from "@/features/ui/span";
import { formatOrderDate } from "../../lib/helpers/formatOrderDate";
import { formatOrderId } from "../../lib/helpers/formatOrderId";

interface PropsI {
  orderId: string;
  createdAt: string | null | undefined;
  productName: string;
}

export function RecentOrderItemInfo({
  orderId,
  createdAt,
  productName,
}: PropsI) {
  return (
    <div className="flex flex-col">
      <Span variant="default" className="font-anton text-sm tracking-tight text-ink">
        {formatOrderId(orderId)}
      </Span>
      <Span variant="micro" className="text-ink/40">
        {formatOrderDate(createdAt)} • {productName.toUpperCase()}
      </Span>
    </div>
  );
}
