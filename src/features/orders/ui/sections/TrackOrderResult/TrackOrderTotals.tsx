import { useTranslations } from "next-intl";
import { formatPrice } from "@/features/orders/lib/utils/formatPrice";
import type { TrackedOrderT } from "@/shared/types/trackOrder";

/**
 * TrackOrderTotals
 *
 * Subtotal, discount (when any), shipping and the total paid.
 */

interface PropsI {
  order: Pick<TrackedOrderT, "subtotal" | "discount_amount" | "shipping_cost" | "total_amount">;
}

export function TrackOrderTotals({ order }: PropsI) {
  const t = useTranslations("orders.track.result");

  return (
    <dl className="mt-4 space-y-2 text-sm">
      <div className="flex justify-between text-(--color-stamp-taupe)">
        <dt>{t("subtotal")}</dt>
        <dd>{formatPrice(order.subtotal)}</dd>
      </div>
      {(order.discount_amount ?? 0) > 0 && (
        <div className="flex justify-between text-(--color-stamp-taupe)">
          <dt>{t("discount")}</dt>
          <dd>-{formatPrice(order.discount_amount)}</dd>
        </div>
      )}
      <div className="flex justify-between text-(--color-stamp-taupe)">
        <dt>{t("shipping")}</dt>
        <dd>{formatPrice(order.shipping_cost)}</dd>
      </div>
      <div className="flex justify-between border-t border-(--color-stamp-divider) pt-2 font-semibold text-(--color-stamp-chocolate)">
        <dt>{t("total")}</dt>
        <dd>{formatPrice(order.total_amount)}</dd>
      </div>
    </dl>
  );
}
