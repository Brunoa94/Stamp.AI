import { OrderItemT } from "@/types/orderItem";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { OrderImage } from "../../../helpers/OrderImage";

interface PropsI {
  item: OrderItemT;
}

export function OrderItemCard({ item }: PropsI) {
  return (
    <div className="flex gap-4 p-4 border border-gray-200 rounded-lg bg-white/50 hover:bg-white/80 transition-colors">
      <div className="shrink-0">
        <OrderImage
          src={item.custom_image_url || "/placeholder.png"}
          alt={item.product_name || "Product"}
          width={80}
          height={80}
          className="rounded-lg object-cover border border-gray-200"
        />
      </div>

      <div className="flex-1 min-w-0">
        <Heading as="h4" variant="item" className="text-gray-800 truncate">
          {item.product_name || "Product"}
        </Heading>
        {item.variant_name && (
          <Paragraph
            as="p"
            variant="body"
            className="text-sm text-gray-600 mt-1"
          >
            Variant: {item.variant_name}
          </Paragraph>
        )}
        <Paragraph as="p" variant="body" className="text-sm text-gray-600 mt-1">
          Quantity: {item.quantity}
        </Paragraph>
      </div>

      <div className="text-right shrink-0">
        <Paragraph
          as="p"
          variant="body"
          className="font-semibold text-gray-800"
        >
          ${item.total_price?.toFixed(2) || "0.00"}
        </Paragraph>
        <Paragraph as="p" variant="body" className="text-sm text-gray-600 mt-1">
          ${item.unit_price?.toFixed(2) || "0.00"} each
        </Paragraph>
      </div>
    </div>
  );
}
