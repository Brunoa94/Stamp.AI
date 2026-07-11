import { useRef } from "react";
import Image from "next/image";
import { ShoppingBag, X } from "lucide-react";
import { formatOrderDate } from "../../../lib/utils/formatOrderDate";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { Button } from "@/features/ui/button";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import { useModalFocusTrap } from "@/hooks/useModalFocusTrap";
import type { OrderWithItemsT } from "@/types/order";
import {
  getAddressSummary,
  getFirstOrderItem,
} from "../../../lib/helpers/orderPresentation";
import {
  getStatusBadgeClass,
  toDisplayStatus,
} from "../../../lib/helpers/statusPresentation";
import { OrdersDetailsModalInvoice } from "./OrdersDetailsModalInvoice";

interface PropsI {
  order: OrderWithItemsT;
  onClose: () => void;
}

export function OrdersDetailsModal({ order, onClose }: PropsI) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const firstItem = getFirstOrderItem(order);
  const displayedStatus = toDisplayStatus(order.status);

  useModalFocusTrap({
    isOpen: true,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-(--color-stamp-chocolate)/30 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Order details"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-(--color-stamp-divider) bg-(--color-stamp-white) p-8 shadow-(--shadow-stamp-modal) md:p-12"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          ref={closeButtonRef}
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute right-8 top-8 text-(--color-stamp-taupe) hover:bg-transparent hover:text-(--color-stamp-chocolate)"
          aria-label="Close details modal"
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="mb-10">
          <Span
            unstyled
            className={`inline-flex rounded-full px-3 py-1 text-lg font-bold uppercase tracking-[0.15em] ${getStatusBadgeClass(displayedStatus)}`}
          >
            {displayedStatus}
          </Span>
          <Heading
            as="h3"
            variant="card"
            className="mt-4 text-3xl tracking-tight text-(--color-stamp-chocolate)"
          >
            Protocol Record Details
          </Heading>
          <Paragraph
            variant="sm"
            className="mt-1 text-lg tracking-[0.2em] text-(--color-stamp-taupe)"
          >
            Order #{order.order_number || order.id.slice(0, 13).toUpperCase()} •
            Initiated {formatOrderDate(order.created_at)}
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <section>
              <Span
                variant="default"
                className="mb-5 block border-b border-(--color-stamp-divider) pb-2 tracking-[0.3em] text-(--color-stamp-gold)"
              >
                Protocol Items
              </Span>
              <div className="flex items-center gap-4 border border-(--color-stamp-divider) bg-(--color-stamp-cream)/20 p-4">
                <div className="relative h-20 w-20 flex-none bg-(--color-stamp-cream)">
                  {firstItem?.custom_image_url ? (
                    <Image
                      src={firstItem.custom_image_url}
                      alt={firstItem.product_name || "Order item"}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-(--color-stamp-taupe)">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Heading
                    as="h4"
                    variant="item"
                    className="text-sm text-(--color-stamp-chocolate)"
                  >
                    {firstItem?.product_name || "Custom Product"}
                  </Heading>
                  <Paragraph
                    variant="sm"
                    className="text-lg tracking-widest text-(--color-stamp-taupe)"
                  >
                    Variant: {firstItem?.variant_name || "Standard"} • Qty:{" "}
                    {firstItem?.quantity || 1}
                  </Paragraph>
                </div>
                <Heading
                  as="h5"
                  variant="card"
                  className="text-right text-2xl tracking-tight text-(--color-stamp-chocolate)"
                >
                  {formatPrice(firstItem?.unit_price || 0)}
                </Heading>
              </div>
            </section>

            <section>
              <Span
                variant="default"
                className="mb-5 block border-b border-(--color-stamp-divider) pb-2 tracking-[0.3em] text-(--color-stamp-gold)"
              >
                Delivery
              </Span>
              <Paragraph
                variant="sm"
                className="text-lg text-(--color-stamp-chocolate)"
              >
                {order.customer_name || "Archive Client"}
              </Paragraph>
              <Paragraph
                variant="sm"
                className="text-lg text-(--color-stamp-taupe)"
              >
                {getAddressSummary(order)}
              </Paragraph>
            </section>
          </div>

          <aside className="self-start border border-(--color-stamp-divider) bg-(--color-stamp-cream)/40 p-8">
            <Span
              variant="default"
              className="mb-6 block border-b border-(--color-stamp-divider) pb-2 tracking-[0.3em] text-(--color-stamp-gold)"
            >
              Valuation
            </Span>
            <div className="flex items-center justify-between border-t border-(--color-stamp-divider) pt-4">
              <Span
                variant="default"
                className="text-lg tracking-normal text-(--color-stamp-chocolate)"
              >
                Total
              </Span>
              <Heading
                as="h5"
                variant="card"
                className="text-3xl tracking-tight text-(--color-stamp-gold)"
              >
                {formatPrice(order.total_amount)}
              </Heading>
            </div>
            <OrdersDetailsModalInvoice order={order} />
          </aside>
        </div>
      </div>
    </div>
  );
}
