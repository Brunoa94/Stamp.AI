import Link from "next/link";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";

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

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  specs: string;
  label: string;
  imageUrl: string;
  href: string;
}

export function ProductCard({
  id,
  name,
  price,
  specs,
  label,
  imageUrl,
  href,
}: ProductCardProps) {
  return (
    <Link href={href} id={id} className="group cursor-pointer block">
      {/* Image container */}
      <div className="aspect-3/4 bg-white border-2 border-ink overflow-hidden relative mb-4 shadow-[8px_8px_0px_rgba(10,10,10,0.05)]">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover grayscale-hover"
        />

        {/* Product label overlay */}
        <div className="absolute bottom-4 left-4 bg-concrete px-3 py-1.5 text-[8px] font-bold tracking-widest border border-ink shadow-[2px_2px_0px_rgba(10,10,10,0.2)] font-space uppercase">
          {label}
        </div>
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
        <Span className="font-mono font-bold text-sm md:text-base">
          ${price.toFixed(2)}
        </Span>
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
