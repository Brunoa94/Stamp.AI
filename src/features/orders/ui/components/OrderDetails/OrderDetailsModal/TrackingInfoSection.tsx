import { OrderWithItemsT } from "@/types/order";
import { ExternalLink, Package } from "lucide-react";
import Link from "next/link";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

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
            <Paragraph
              as="p"
              variant="sm"
              className="text-[10px] font-bold tracking-[0.25em] text-ink/45"
            >
              Tracking Number
            </Paragraph>
            <Paragraph
              as="p"
              variant="body"
              className="break-all font-medium tracking-wide text-ink"
            >
              {order.tracking_number}
            </Paragraph>
          </div>
        )}

        {order.tracking_url && (
          <div>
            <Link
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-bold uppercase tracking-[0.16em] text-cyan transition-colors hover:text-purple"
            >
              <ExternalLink className="w-4 h-4" />
              Track Package
            </Link>
          </div>
        )}

        <div className="grid gap-4 border-t border-ink/10 pt-4 md:grid-cols-2">
          {shippedDate && (
            <div>
              <Paragraph
                as="p"
                variant="sm"
                className="text-[10px] font-bold tracking-[0.25em] text-ink/45"
              >
                Shipped On
              </Paragraph>
              <Paragraph
                as="p"
                variant="body"
                className="font-medium tracking-wide text-ink"
              >
                {shippedDate}
              </Paragraph>
            </div>
          )}
          {deliveredDate && (
            <div>
              <Paragraph
                as="p"
                variant="sm"
                className="text-[10px] font-bold tracking-[0.25em] text-ink/45"
              >
                Delivered On
              </Paragraph>
              <Paragraph
                as="p"
                variant="body"
                className="font-medium tracking-wide text-ink"
              >
                {deliveredDate}
              </Paragraph>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
