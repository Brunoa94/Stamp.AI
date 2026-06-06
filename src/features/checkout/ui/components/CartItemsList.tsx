import type { CartWithItems } from "@/types/cart";

interface CartItemsListProps {
  items: CartWithItems["cart_items"];
}

/**
 * CartItemsList - Displays list of cart items with images
 * Extracted from OrderSummarySection for better separation of concerns
 */
export function CartItemsList({ items }: CartItemsListProps) {
  return (
    <div
      role="region"
      aria-label="Cart items"
      tabIndex={0}
      className="space-y-4 max-h-96 overflow-y-auto focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="flex gap-4 p-4 bg-white/40 rounded-lg border border-white/50"
        >
          {/* Product Image */}
          {item.custom_image_url && (
            <div className="w-20 h-20 rounded-md overflow-hidden bg-white/60 shrink-0 flex items-center justify-center">
              <img
                src={item.custom_image_url}
                alt={`${item.product_name || item.product?.name || 'Product'} - ${item.variant?.name || 'Standard variant'}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-heading font-bold uppercase text-slate-900 truncate">
              {item.product_name || item.product?.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {item.variant?.name || "Standard"}
            </p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
              <span className="text-sm font-bold text-slate-900">
                ${(item.unit_price * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
