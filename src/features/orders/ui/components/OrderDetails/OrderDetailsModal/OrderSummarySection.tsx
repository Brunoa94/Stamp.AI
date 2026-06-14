import { OrderWithItemsT } from "@/types/order";
import { Package } from "lucide-react";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface PropsI {
  order: OrderWithItemsT;
  formattedDate: string;
}

export function OrderSummarySection({ order, formattedDate }: PropsI) {
  return (
    <section className="space-y-6 border-b border-ink/10 pb-8">
      <div className="flex items-center gap-4">
        <div className="h-1 w-12 bg-cyan" />
        <Paragraph
          as="p"
          variant="sm"
          className="text-[10px] font-bold tracking-[0.35em] text-ink/50"
        >
          Technical Summary
        </Paragraph>
      </div>

      <div className="flex items-center gap-3">
        <Package className="h-5 w-5 text-ink/70" />
        <h3 className="font-anton text-4xl uppercase tracking-tight text-ink">
          Order Summary
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {order.status && (
          <OrderStatusBadge status={order.status} variant="order" />
        )}
        {order.payment_status && (
          <OrderStatusBadge status={order.payment_status} variant="payment" />
        )}
      </div>

      <div className="grid gap-4 border border-ink/8 bg-concrete/50 p-4 md:grid-cols-2">
        <div>
          <Paragraph
            as="p"
            variant="sm"
            className="text-[10px] font-bold tracking-[0.2em] text-ink/45"
          >
            Order Date
          </Paragraph>
          <Paragraph
            as="p"
            variant="body"
            className="font-bold tracking-wide text-ink"
          >
            {formattedDate}
          </Paragraph>
        </div>
        <div>
          <Paragraph
            as="p"
            variant="sm"
            className="text-[10px] font-bold tracking-[0.2em] text-ink/45"
          >
            Customer Email
          </Paragraph>
          <Paragraph
            as="p"
            variant="body"
            className="wrap-break-word font-bold tracking-wide text-ink"
          >
            {order.customer_email}
          </Paragraph>
        </div>
      </div>

      <div className="space-y-2 border border-ink/10 bg-white p-4">
        <div className="flex justify-between">
          <Span
            as="span"
            unstyled
            className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55"
          >
            Subtotal
          </Span>
          <Span as="span" unstyled className="font-medium text-ink">
            ${order.subtotal?.toFixed(2) || "0.00"}
          </Span>
        </div>
        <div className="flex justify-between">
          <Span
            as="span"
            unstyled
            className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55"
          >
            Logistics Protocol
          </Span>
          <Span as="span" unstyled className="font-medium text-ink">
            ${order.shipping_cost?.toFixed(2) || "0.00"}
          </Span>
        </div>
        {order.tax_amount && order.tax_amount > 0 && (
          <div className="flex justify-between">
            <Span
              as="span"
              unstyled
              className="text-xs font-bold uppercase tracking-[0.18em] text-ink/55"
            >
              Synthesis Tax
            </Span>
            <Span as="span" unstyled className="font-medium text-ink">
              ${order.tax_amount.toFixed(2)}
            </Span>
          </div>
        )}
        {order.discount_amount && order.discount_amount > 0 && (
          <div className="flex justify-between text-green-600">
            <Span as="span" unstyled>
              Discount
            </Span>
            <Span as="span" unstyled className="font-medium">
              -${order.discount_amount.toFixed(2)}
            </Span>
          </div>
        )}
        <div className="flex justify-between border-t border-ink/10 pt-4">
          <Span
            as="span"
            unstyled
            className="font-anton text-3xl uppercase tracking-tight text-ink"
          >
            Total
          </Span>
          <Span
            as="span"
            unstyled
            className="font-anton text-4xl uppercase tracking-tight text-cyan"
          >
            ${order.total_amount?.toFixed(2) || "0.00"}
          </Span>
        </div>
      </div>
    </section>
  );
}
