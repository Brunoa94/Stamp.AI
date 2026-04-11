import { OrderItemT } from "@/types/orderItem";
import { OrderItemCard } from "../OrderItemCard";
import { Box } from "lucide-react";
import { OrderItemsListShimmer } from "./OrderItemsListShimmer";

interface Props {
  items: OrderItemT[];
  isLoading?: boolean;
}

export function OrderItemsList({ items, isLoading }: Props) {
  if (isLoading) {
    return <OrderItemsListShimmer />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="space-y-3 rounded-2xl border border-neutral-100 bg-neutral-50 p-6">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-neutral-400" />
          <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-[#111111]">
            Order Items
          </h3>
        </div>
        <p className="text-sm text-neutral-500">
          No items found for this order.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Box className="h-4 w-4 text-neutral-400" />
        <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-[#111111]">
          Order Items
        </h3>
      </div>

      <div className="max-h-75 space-y-4 overflow-y-auto pr-2 [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar]:w-1">
        {items.map((item) => (
          <OrderItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
