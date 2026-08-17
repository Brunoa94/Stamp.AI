import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("orders.detailsModal");
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
      aria-label={t("ariaLabel")}
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
          aria-label={t("close")}
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="mb-8">
          <Span
            variant="badge"
            className={`inline-flex rounded-full px-3 py-1 ${getStatusBadgeClass(displayedStatus)}`}
          >
            {displayedStatus}
          </Span>
          <Heading
            as="h3"
            variant="cardCompact"
            className="mt-4 text-(--color-stamp-chocolate)"
          >
            {t("recordDetails")}
          </Heading>
          <Span variant="meta" className="mt-1 block text-(--color-stamp-taupe)">
            {t("orderMeta", {
              orderNumber:
                order.order_number || order.id.slice(0, 13).toUpperCase(),
              date: formatOrderDate(order.created_at),
            })}
          </Span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section>
              <Span
                variant="label"
                className="mb-4 block border-b border-(--color-stamp-divider) pb-2 text-(--color-stamp-gold)"
              >
                {t("protocolItems")}
              </Span>
              <div className="flex items-center gap-4 border border-(--color-stamp-divider) bg-(--color-stamp-cream)/20 p-4">
                <div className="relative h-16 w-16 flex-none bg-(--color-stamp-cream)">
                  {firstItem?.custom_image_url ? (
                    <Image
                      src={firstItem.custom_image_url}
                      alt={firstItem.product_name || t("itemAlt")}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-(--color-stamp-taupe)">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Heading
                    as="h4"
                    variant="itemCompact"
                    className="text-(--color-stamp-chocolate)"
                  >
                    {firstItem?.product_name || t("customProduct")}
                  </Heading>
                  <Span variant="micro" className="text-(--color-stamp-taupe)">
                    {t("variantQty", {
                      variant: firstItem?.variant_name || t("standard"),
                      qty: firstItem?.quantity || 1,
                    })}
                  </Span>
                </div>
                <Heading
                  as="h5"
                  variant="priceMini"
                  className="text-right text-(--color-stamp-chocolate)"
                >
                  {formatPrice(firstItem?.unit_price || 0)}
                </Heading>
              </div>
            </section>

            <section>
              <Span
                variant="label"
                className="mb-4 block border-b border-(--color-stamp-divider) pb-2 text-(--color-stamp-gold)"
              >
                {t("delivery")}
              </Span>
              <Paragraph variant="sm" className="font-bold text-(--color-stamp-chocolate)">
                {order.customer_name || t("archiveClient")}
              </Paragraph>
              <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
                {getAddressSummary(order) || t("archiveAddress")}
              </Paragraph>
              {order.customer_email && (
                <Paragraph variant="sm" className="mt-1 text-(--color-stamp-taupe)">
                  {order.customer_email}
                </Paragraph>
              )}
              {order.customer_phone && (
                <Paragraph variant="sm" className="text-(--color-stamp-taupe)">
                  {order.customer_phone}
                </Paragraph>
              )}
            </section>

            <section>
              <Span
                variant="label"
                className="mb-4 block border-b border-(--color-stamp-divider) pb-2 text-(--color-stamp-gold)"
              >
                {t("orderInfo")}
              </Span>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Span variant="micro" className="text-(--color-stamp-taupe)">
                    {t("orderDate")}
                  </Span>
                  <Paragraph variant="sm" className="font-semibold text-(--color-stamp-chocolate)">
                    {formatOrderDate(order.created_at)}
                  </Paragraph>
                </div>
                {order.payment_method && (
                  <div>
                    <Span variant="micro" className="text-(--color-stamp-taupe)">
                      {t("paymentMethod")}
                    </Span>
                    <Paragraph variant="sm" className="font-semibold text-(--color-stamp-chocolate)">
                      {order.payment_method}
                    </Paragraph>
                  </div>
                )}
                {order.shipped_at && (
                  <div>
                    <Span variant="micro" className="text-(--color-stamp-taupe)">
                      {t("shippedDate")}
                    </Span>
                    <Paragraph variant="sm" className="font-semibold text-(--color-stamp-chocolate)">
                      {formatOrderDate(order.shipped_at)}
                    </Paragraph>
                  </div>
                )}
                {order.delivered_at && (
                  <div>
                    <Span variant="micro" className="text-(--color-stamp-taupe)">
                      {t("deliveredDate")}
                    </Span>
                    <Paragraph variant="sm" className="font-semibold text-(--color-stamp-chocolate)">
                      {formatOrderDate(order.delivered_at)}
                    </Paragraph>
                  </div>
                )}
              </div>
              {order.tracking_number && (
                <div className="mt-4">
                  <Span variant="micro" className="text-(--color-stamp-taupe)">
                    {t("trackingNumber")}
                  </Span>
                  {order.tracking_url ? (
                    <a
                      href={order.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block font-body text-base font-semibold text-(--color-stamp-gold) underline hover:text-(--color-stamp-chocolate)"
                    >
                      {order.tracking_number}
                    </a>
                  ) : (
                    <Paragraph variant="sm" className="font-semibold text-(--color-stamp-chocolate)">
                      {order.tracking_number}
                    </Paragraph>
                  )}
                </div>
              )}
            </section>
          </div>

          <aside className="self-start border border-(--color-stamp-divider) bg-(--color-stamp-cream)/40 p-6">
            <Span
              variant="label"
              className="mb-4 block border-b border-(--color-stamp-divider) pb-2 text-(--color-stamp-gold)"
            >
              {t("valuation")}
            </Span>
            <div className="space-y-2">
              {order.subtotal != null && (
                <div className="flex items-center justify-between">
                  <Span variant="micro" className="text-(--color-stamp-taupe)">
                    {t("subtotal")}
                  </Span>
                  <Span variant="value" className="text-(--color-stamp-chocolate)">
                    {formatPrice(order.subtotal)}
                  </Span>
                </div>
              )}
              {order.shipping_cost != null && order.shipping_cost > 0 && (
                <div className="flex items-center justify-between">
                  <Span variant="micro" className="text-(--color-stamp-taupe)">
                    {t("shippingCost")}
                  </Span>
                  <Span variant="value" className="text-(--color-stamp-chocolate)">
                    {formatPrice(order.shipping_cost)}
                  </Span>
                </div>
              )}
              {order.discount_amount != null && order.discount_amount > 0 && (
                <div className="flex items-center justify-between">
                  <Span variant="micro" className="text-(--color-stamp-taupe)">
                    {t("discount")}
                    {order.promo_code && (
                      <span className="ml-1 text-(--color-stamp-gold)">
                        ({order.promo_code})
                      </span>
                    )}
                  </Span>
                  <Span variant="value" className="text-green-600">
                    -{formatPrice(order.discount_amount)}
                  </Span>
                </div>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-(--color-stamp-divider) pt-4">
              <Span variant="meta" className="text-(--color-stamp-chocolate)">
                {t("total")}
              </Span>
              <Heading
                as="h5"
                variant="priceCompact"
                className="text-(--color-stamp-gold)"
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
