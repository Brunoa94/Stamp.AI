import { OrderWithItemsT } from "@/types/order";
import { Package } from "lucide-react";
import { Heading } from "@/features/ui/heading";
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
        <Span as="p" variant="default" className="text-ink/50">
          Technical Summary
        </Span>
      </div>

      <div className="flex items-center gap-3">
        <Package className="h-5 w-5 text-ink/70" />
        <Heading as="h3" variant="card" className="text-ink">
          Order Summary
        </Heading>
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
          <Span as="p" variant="default" className="text-ink/45">
            Order Date
          </Span>
          <Paragraph as="p" className="font-bold text-ink">
            {formattedDate}
          </Paragraph>
        </div>
        <div>
          <Span as="p" variant="default" className="text-ink/45">
            Customer Email
          </Span>
          <Paragraph as="p" className="wrap-break-word font-bold text-ink">
            {order.customer_email}
          </Paragraph>
        </div>
      </div>

      <div className="space-y-2 border border-ink/10 bg-white p-4">
        <div className="flex justify-between">
          <Span variant="sm" className="text-ink/55">
            Subtotal
          </Span>
          <Paragraph as="span" className="font-medium text-ink">
            ${order.subtotal?.toFixed(2) || "0.00"}
          </Paragraph>
        </div>
        <div className="flex justify-between">
          <Span variant="sm" className="text-ink/55">
            Logistics Protocol
          </Span>
          <Paragraph as="span" className="font-medium text-ink">
            ${order.shipping_cost?.toFixed(2) || "0.00"}
          </Paragraph>
        </div>
        {order.tax_amount && order.tax_amount > 0 && (
          <div className="flex justify-between">
            <Span variant="sm" className="text-ink/55">
              Synthesis Tax
            </Span>
            <Paragraph as="span" className="font-medium text-ink">
              ${order.tax_amount.toFixed(2)}
            </Paragraph>
          </div>
        )}
        {order.discount_amount && order.discount_amount > 0 && (
          <div className="flex justify-between text-green">
            <Span variant="sm">Discount</Span>
            <Paragraph as="span" className="font-medium">
              -${order.discount_amount.toFixed(2)}
            </Paragraph>
          </div>
        )}
        <div className="flex justify-between border-t border-ink/10 pt-4">
          <Heading as="span" variant="card" className="text-ink">
            Total
          </Heading>
          <Heading as="span" variant="card" className="text-cyan">
            ${order.total_amount?.toFixed(2) || "0.00"}
          </Heading>
        </div>
      </div>
    </section>
  );
}
