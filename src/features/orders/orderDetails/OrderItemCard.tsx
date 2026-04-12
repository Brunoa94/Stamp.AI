import Image from "next/image";
import { OrderItemT } from "@/types/orderItem";

interface Props {
  item: OrderItemT;
}

export function OrderItemCard({ item }: Props) {
  const originalTotal = (item.unit_price || 0) * (item.quantity || 0);
  const hasDiscount = (item.total_price || 0) < originalTotal;

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 transition-all duration-300 hover:border-[#FEB47B]/30 md:gap-6">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-900 md:h-28 md:w-28">
        <Image
          src={item.custom_image_url || "/placeholder.png"}
          alt={item.product_name || "Product"}
          fill
          className="object-contain opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/35 to-transparent" />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="mb-1 text-sm font-bold leading-tight text-neutral-900 md:text-base">
          {item.product_name || "Product"}
        </h4>
        {item.variant_name && (
          <p className="mb-2 text-[11px] uppercase tracking-widest text-neutral-400 md:text-xs">
            {item.variant_name}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs font-medium text-neutral-500">
            Qty: {item.quantity || 0}
          </span>

          <div className="text-right">
            {hasDiscount && (
              <p className="text-[10px] text-neutral-400 line-through">
                ${originalTotal.toFixed(2)}
              </p>
            )}
            <p className="text-sm font-bold text-[#FEB47B]">
              ${(item.total_price || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
