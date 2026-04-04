import { OrderWithItemsT } from "@/types/order";
import { Package } from "lucide-react";
import { componentThemes } from "@/theme";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface Props {
  order: OrderWithItemsT;
  formattedDate: string;
}

export function OrderSummarySection({ order, formattedDate }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-slate-600" />
        <h3 className={componentThemes.text.subheading}>Order Summary</h3>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2">
        {order.status && (
          <OrderStatusBadge status={order.status} variant="order" />
        )}
        {order.payment_status && (
          <OrderStatusBadge status={order.payment_status} variant="payment" />
        )}
      </div>

      {/* Order Info */}
      <div className="grid md:grid-cols-2 gap-4 bg-gray-50/50 rounded-lg p-4">
        <div>
          <p className="text-sm text-gray-600">Order Date</p>
          <p className="font-medium text-gray-800">{formattedDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Customer Email</p>
          <p className="font-medium text-gray-800 break-words">
            {order.customer_email}
          </p>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            ${order.subtotal?.toFixed(2) || "0.00"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            ${order.shipping_cost?.toFixed(2) || "0.00"}
          </span>
        </div>
        {order.tax_amount && order.tax_amount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span className="font-medium">${order.tax_amount.toFixed(2)}</span>
          </div>
        )}
        {order.discount_amount && order.discount_amount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">
              -${order.discount_amount.toFixed(2)}
            </span>
          </div>
        )}
        <div className="border-t border-gray-100 pt-2 flex justify-between">
          <span className="font-semibold text-gray-800">Total</span>
          <span className="font-bold text-xl bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 bg-clip-text text-transparent">
            ${order.total_amount?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>
    </section>
  );
}
