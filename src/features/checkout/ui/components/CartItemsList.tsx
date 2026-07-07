import Image from "next/image";
import type { CartWithItems } from "@/types/cart";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { List } from "@/features/ui/list";

interface CartItemsListProps {
  items: CartWithItems["cart_items"];
}

/**
 * CartItemsList - Displays list of cart items with images
 * Extracted from OrderSummarySection for better separation of concerns
 * Uses design system components: List, Heading, Span, and Next.js Image
 */
export function CartItemsList({ items }: CartItemsListProps) {
  return (
    <List
      role="region"
      aria-label="Cart items"
      tabIndex={0}
      className="space-y-4 max-h-96 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg"
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="flex gap-4 p-4 bg-white/40 rounded-lg border border-white/50"
        >
          {/* Product Image */}
          {item.custom_image_url && (
            <div className="w-20 h-20 rounded-md overflow-hidden bg-white/60 shrink-0 flex items-center justify-center">
              <Image
                src={item.custom_image_url}
                alt={`${item.product_name || item.product?.name || 'Product'} - ${item.variant?.name || 'Standard variant'}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <Heading variant="card" className="truncate">
              {item.product_name || item.product?.name}
            </Heading>
            <Span variant="default" className="mt-1 text-slate-500">
              {item.variant?.name || "Standard"}
            </Span>
            <div className="flex items-center justify-between mt-3">
              <Span variant="micro" className="text-slate-500">
                Qty: {item.quantity}
              </Span>
              <Span variant="default" className="font-bold text-slate-900">
                ${((item.unit_price ?? 0) * item.quantity).toFixed(2)}
              </Span>
            </div>
          </div>
        </li>
      ))}
    </List>
  );
}
