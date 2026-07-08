import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "../../../lib/utils/formatPrice";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Span } from "@/features/ui/span";
import type { getFirstOrderItem } from "../../../lib/helpers/orderPresentation";

interface PropsI {
  firstItem: ReturnType<typeof getFirstOrderItem>;
}

export function OrdersDetailsModalItems({ firstItem }: PropsI) {
  return (
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
            className="text-[9px] tracking-widest text-(--color-stamp-taupe)"
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
  );
}
