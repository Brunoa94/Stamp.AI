import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import type { OrderWithItemsT } from "@/types/order";
import type { getFirstOrderItem } from "../../../lib/helpers/orderPresentation";

interface PropsI {
  order: OrderWithItemsT;
  firstItem: ReturnType<typeof getFirstOrderItem>;
  onOpenDetails: (order: OrderWithItemsT) => void;
}

export function OrdersListItemImage({
  order,
  firstItem,
  onOpenDetails,
}: PropsI) {
  const t = useTranslations("orders.listItem");

  return (
    <Button
      onClick={() => onOpenDetails(order)}
      variant="ghost"
      className="relative h-32 w-full flex-none overflow-hidden bg-(--color-stamp-cream) lg:w-32"
      aria-label={t("openDetails", { order: order.order_number || order.id })}
    >
      {firstItem?.custom_image_url ? (
        <Image
          src={firstItem.custom_image_url}
          alt={firstItem.product_name || t("productAlt")}
          fill
          sizes="128px"
          className="object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-(--color-stamp-taupe)">
          <ShoppingBag className="h-10 w-10" />
        </div>
      )}
    </Button>
  );
}
