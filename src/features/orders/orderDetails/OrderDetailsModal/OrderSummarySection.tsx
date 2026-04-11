import { OrderWithItemsT } from "@/types/order";
import { Calendar, Mail, Receipt } from "lucide-react";

interface Props {
  order: OrderWithItemsT;
  formattedDate: string;
}

export function OrderSummarySection({ order, formattedDate }: Props) {
  return (
    <section className="mb-12 space-y-12">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">
              Order Date
            </span>
          </div>
          <p className="text-sm font-medium text-neutral-800 md:text-base">
            {formattedDate}
          </p>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-neutral-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">
              Customer Email
            </span>
          </div>
          <p className="break-all text-sm font-medium text-neutral-800 md:text-base">
            {order.customer_email}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-100 bg-neutral-50 p-6 md:p-8">
        <div className="mb-6 flex items-center gap-2">
          <Receipt className="h-4 w-4 text-neutral-400" />
          <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-[#111111]">
            Order Summary
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between border-b border-black/5 pb-3">
            <span className="text-sm text-neutral-500">Subtotal</span>
            <span className="text-sm font-bold text-neutral-900">
              ${order.subtotal?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="flex justify-between border-b border-black/5 pb-3">
            <span className="text-sm text-neutral-500">Shipping</span>
            <span className="text-sm font-bold text-neutral-900">
              ${order.shipping_cost?.toFixed(2) || "0.00"}
            </span>
          </div>

          <div className="flex justify-between border-b border-black/5 pb-3">
            <span className="text-sm text-neutral-500">Tax</span>
            <span className="text-sm font-bold text-neutral-900">
              ${order.tax_amount?.toFixed(2) || "0.00"}
            </span>
          </div>

          {order.discount_amount && order.discount_amount > 0 && (
            <div className="flex justify-between border-b border-black/5 pb-3 text-emerald-600">
              <span className="text-sm">Discount</span>
              <span className="text-sm font-bold">
                -${order.discount_amount.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <span className="text-base font-bold uppercase tracking-widest text-[#111111]">
              Total
            </span>
            <span className="font-heading text-xl font-bold text-neutral-900">
              ${order.total_amount?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
