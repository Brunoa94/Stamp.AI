import Link from "next/link";

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
    <Link
      href={href}
      id={id}
      className="group cursor-pointer block"
    >
      {/* Image container */}
      <div className="aspect-[3/4] bg-white border-2 border-ink overflow-hidden relative mb-4 shadow-[8px_8px_0px_rgba(10,10,10,0.05)]">
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
        <h5 className="font-anton text-lg md:text-xl uppercase tracking-tight group-hover:text-brandPurple transition-colors">
          {name}
        </h5>
        <span className="font-mono font-bold text-sm md:text-base">
          ${price.toFixed(2)}
        </span>
      </div>

      {/* Product specs */}
      <p className="text-[10px] opacity-50 font-bold tracking-widest uppercase mt-1 font-space">
        {specs}
      </p>
    </Link>
  );
}
