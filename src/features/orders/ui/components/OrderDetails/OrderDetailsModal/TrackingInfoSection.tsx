import { OrderWithItemsT } from "@/types/order";
import { ExternalLink, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";

interface PropsI {
  order: OrderWithItemsT;
  shippedDate: string | null;
  deliveredDate: string | null;
}

export function TrackingInfoSection({
  order,
  shippedDate,
  deliveredDate,
}: PropsI) {
  if (
    !order.tracking_number &&
    !order.tracking_url &&
    !shippedDate &&
    !deliveredDate
  ) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Package className="h-5 w-5 text-ink/70" />
        <Heading as="h3" variant="card" className="text-ink">
          Fulfillment Timeline
        </Heading>
      </div>

      <div className="space-y-4 border border-ink/10 bg-concrete/35 p-4">
        {order.tracking_number && (
          <div>
            <Span as="p" variant="default" className="text-ink/45">
              Tracking Number
            </Span>
            <Paragraph as="p" className="break-all font-medium text-ink">
              {order.tracking_number}
            </Paragraph>
          </div>
        )}

        {order.tracking_url && (
          <div>
            <Button
              asChild
              variant="link"
              className="text-cyan hover:text-purple"
            >
              <Link
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                Track Package
              </Link>
            </Button>
          </div>
        )}

        <div className="grid gap-4 border-t border-ink/10 pt-4 md:grid-cols-2">
          {shippedDate && (
            <div>
              <Span as="p" variant="default" className="text-ink/45">
                Shipped On
              </Span>
              <Paragraph as="p" className="font-medium text-ink">
                {shippedDate}
              </Paragraph>
            </div>
          )}
          {deliveredDate && (
            <div>
              <Span as="p" variant="default" className="text-ink/45">
                Delivered On
              </Span>
              <Paragraph as="p" className="font-medium text-ink">
                {deliveredDate}
              </Paragraph>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
