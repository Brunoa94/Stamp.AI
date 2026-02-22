import Image from "next/image";
import { OrderItemT } from "@/types/orderItem";

interface Props {
  item: OrderItemT;
}

export function OrderItemCard({ item }: Props) {
  return (
    <div className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Image
          src={item.custom_image_url || "/placeholder.png"}
          alt={item.product_name || "Product"}
          width={80}
          height={80}
          className="rounded-lg object-cover border border-gray-200"
        />
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 truncate">
          {item.product_name || "Product"}
        </h4>
        {item.variant_name && (
          <p className="text-sm text-gray-600 mt-1">
            Variant: {item.variant_name}
          </p>
        )}
        <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
      </div>

      {/* Pricing */}
      <div className="text-right flex-shrink-0">
        <p className="font-semibold text-gray-800">
          ${item.total_price?.toFixed(2) || "0.00"}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          ${item.unit_price?.toFixed(2) || "0.00"} each
        </p>
      </div>
    </div>
  );
}
