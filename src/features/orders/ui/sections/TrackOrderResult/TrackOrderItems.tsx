import Image from "next/image";
import { useTranslations } from "next-intl";
import { List } from "@/features/ui/list";
import { Span } from "@/features/ui/span";
import { getOrderImageSrc } from "@/features/orders/lib/helpers/orderImage";
import { formatPrice } from "@/features/orders/lib/utils/formatPrice";
import type { TrackedOrderItemT } from "@/shared/types/trackOrder";

/**
 * TrackOrderItems
 *
 * The products in a tracked order, with the customer's design thumbnail.
 */

interface PropsI {
  items: TrackedOrderItemT[];
}

export function TrackOrderItems({ items }: PropsI) {
  const t = useTranslations("orders.track.result");

  return (
    <List className="divide-y divide-(--color-stamp-divider)">
      {items.map((item, index) => {
        const imageSrc = getOrderImageSrc(item.custom_image_url);

        return (
        <li key={`${item.product_name}-${index}`} className="flex items-center gap-4 py-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-(--color-stamp-cream)">
            {imageSrc && (
              <Image
                src={imageSrc}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Span variant="default" className="block truncate font-semibold text-(--color-stamp-chocolate)">
              {item.product_name}
            </Span>
            <Span variant="meta" className="block text-(--color-stamp-taupe)">
              {item.variant_name ? `${item.variant_name} · ` : ""}
              {t("quantity", { quantity: item.quantity })}
            </Span>
          </div>
          <Span variant="default" className="shrink-0 text-(--color-stamp-chocolate)">
            {formatPrice(item.total_price)}
          </Span>
        </li>
        );
      })}
    </List>
  );
}
