import Link from "next/link";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { ColorSwatches } from "./ColorSwatches";
import type { CatalogProduct } from "@/types/catalog";

const PRODUCT_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23f1eee8'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%23444444' font-family='Arial, sans-serif' font-size='24'%3ENo image%3C/text%3E%3C/svg%3E";

/**
 * Product Card Component
 *
 * Features:
 * - 3:4 aspect ratio image
 * - Grayscale hover effect with scale
 * - Product label overlay
 * - Price and specs below
 * - Hard border and shadow
 */

interface PropsI {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  isOnSale?: boolean;
  specs: string;
  imageUrl: string;
  href: string;
  availabilityStatus?: CatalogProduct["availability_status"];
  availableColors?: string[];
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  isOnSale = false,
  specs,
  imageUrl,
  href,
  availabilityStatus = "in_stock",
  availableColors = [],
}: PropsI) {
  return (
    <Link href={href} id={id} className="group cursor-pointer block">
      {/* Image container */}
      <div className="aspect-3/4 bg-white border-2 border-ink overflow-hidden relative mb-4 shadow-[8px_8px_0px_rgba(10,10,10,0.05)]">
        <img
          src={imageUrl || PRODUCT_FALLBACK_IMAGE}
          alt={name}
          className="w-full h-full object-cover grayscale-hover"
        />

        {/* Color swatches overlay */}
        {availableColors.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-concrete/90 backdrop-blur-sm px-2.5 py-2 border border-ink shadow-[2px_2px_0px_rgba(10,10,10,0.2)]">
            <ColorSwatches colors={availableColors} maxDisplay={5} />
          </div>
        )}

        {/* Stock status badge */}
        {availabilityStatus === "out_of_stock" && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1.5 text-[8px] font-bold tracking-widest border border-ink shadow-[2px_2px_0px_rgba(10,10,10,0.2)] font-space uppercase">
            OUT OF STOCK
          </div>
        )}
        {availabilityStatus === "discontinued" && (
          <div className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1.5 text-[8px] font-bold tracking-widest border border-ink shadow-[2px_2px_0px_rgba(10,10,10,0.2)] font-space uppercase">
            DISCONTINUED
          </div>
        )}
        {availabilityStatus === "temporarily_unavailable" && (
          <div className="absolute top-4 right-4 bg-yellow-600 text-white px-3 py-1.5 text-[8px] font-bold tracking-widest border border-ink shadow-[2px_2px_0px_rgba(10,10,10,0.2)] font-space uppercase">
            TEMP UNAVAILABLE
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex justify-between items-start mb-2">
        <Heading
          as="h5"
          variant="item"
          className="group-hover:text-brandPurple transition-colors"
        >
          {name}
        </Heading>
        <div className="flex flex-col items-end gap-0.5">
          {isOnSale && originalPrice && (
            <Span className="font-mono text-xs md:text-sm line-through opacity-50">
              €{originalPrice.toFixed(2)}
            </Span>
          )}
          <Span
            className={`font-mono font-bold text-sm md:text-base ${isOnSale ? "text-red-600" : ""}`}
          >
            €{price.toFixed(2)}
          </Span>
        </div>
      </div>

      {/* Product specs */}
      <Span
        as="p"
        variant="default"
        className="opacity-50 mt-1 tracking-widest"
      >
        {specs}
      </Span>
    </Link>
  );
}
