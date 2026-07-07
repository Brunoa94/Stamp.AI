import { OrderItemT } from "@/types/orderItem";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { OrderItemsListLoadingState } from "./OrderItemsListLoadingState";
import { OrderItemCard } from "./OrderItemCard";

interface PropsI {
  items: OrderItemT[];
  isLoading?: boolean;
}

export function OrderItemsList({ items, isLoading }: PropsI) {
  if (isLoading) {
    return <OrderItemsListLoadingState />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="space-y-3">
        <Heading as="h3" variant="question">
          Order Items
        </Heading>
        <Paragraph as="p" className="text-ink/60">
          No items found for this order.
        </Paragraph>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Heading as="h3" variant="question">
        Order Items
      </Heading>
      <div className="space-y-3">
        {items.map((item) => (
          <OrderItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
