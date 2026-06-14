import { OrderItemT } from "@/types/orderItem";
import { componentThemes } from "@/theme";
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
        <h3 className={componentThemes.text.subheading}>Order Items</h3>
        <Paragraph as="p" variant="body" className="text-gray-600">
          No items found for this order.
        </Paragraph>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className={componentThemes.text.subheading}>Order Items</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <OrderItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
