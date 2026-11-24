/**
 * DashboardRecentOrderItem
 *
 * Single recent-order row: thumbnail, id/date, product name, price,
 * status badge. Clicking the row opens the order details modal.
 */

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/features/ui/button";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { OrderWithItemsT } from "@/shared/types/order";
import {
  getOrderDisplayStatus,
  getStatusBadgeClass,
} from "@/features/orders/lib/helpers/statusPresentation";
import { orderStatusBadgeVariants } from "@/features/orders/lib/variants/orderStatusBadgeVariants";
import { cn } from "@/lib/utils";
import { formatOrderId } from "../../../lib/helpers/formatOrderId";
import { formatOrderDate } from "../../../lib/utils/formatOrderDate";
import { formatPrice } from "../../../lib/utils/formatPrice";

interface DashboardRecentOrderItemPropsI {
  order: OrderWithItemsT;
  onOpenDetails: (order: OrderWithItemsT) => void;
}

export function DashboardRecentOrderItem({
  order,
  onOpenDetails,
}: DashboardRecentOrderItemPropsI) {
  const t = useTranslations("dashboard.recentOrders");
  const tStatus = useTranslations("orders.statusBadge");
  const locale = useLocale();
  const firstItem = order.order_items[0];
  const displayedStatus = getOrderDisplayStatus(order);

  return (
    <li>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onOpenDetails(order)}
        aria-label={t("openDetails", {
          orderId: formatOrderId(order.id, order.created_at),
        })}
        className="group my-1 h-auto w-full justify-start gap-4 px-2 py-3 text-left transition-colors duration-200 hover:bg-(--color-stamp-cream) hover:text-(--color-stamp-chocolate) sm:gap-5 sm:px-3"
      >
        <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg bg-(--color-stamp-sage)">
          {firstItem?.custom_image_url ? (
            <Image
              src={firstItem.custom_image_url}
              alt={firstItem.product_name || t("productAlt")}
              fill
              sizes="56px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-(--color-stamp-taupe)">
              <ShoppingBag className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Span variant="micro" className="text-(--color-stamp-taupe)">
            {formatOrderId(order.id, order.created_at)} ·{" "}
            {formatOrderDate(order.created_at, locale)}
          </Span>
          <Paragraph variant="body" className="mt-1 truncate">
            {firstItem?.product_name || t("customDesign")}
          </Paragraph>
        </div>

        <Paragraph variant="body" className="hidden font-bold sm:block">
          {formatPrice(order.total_amount)}
        </Paragraph>

        <Span
          variant="badge"
          className={cn(
            orderStatusBadgeVariants(),
            getStatusBadgeClass(displayedStatus),
          )}
        >
          {tStatus(displayedStatus)}
        </Span>

        <ChevronRight className="h-4 w-4 flex-none text-(--color-stamp-taupe) transition-transform duration-300 group-hover:translate-x-1" />
      </Button>
    </li>
  );
}
