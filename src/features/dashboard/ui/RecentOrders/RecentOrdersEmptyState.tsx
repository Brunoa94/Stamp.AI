import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";

export function RecentOrdersEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 opacity-20">
      {/* Icon Container */}
      <div className="w-24 h-24 bg-ink rounded-full flex items-center justify-center mb-10 shadow-xl relative group">
        <div className="absolute inset-0 rounded-full bg-cyan/10 scale-125 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <ShoppingBag className="w-12 h-12 text-cyan relative z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))' }} />
      </div>

      {/* Heading */}
      <Heading as="h5" variant="card" className="text-ink mb-6">
        NO RECORDS FOUND
      </Heading>

      {/* Description */}
      <Paragraph variant="sm" className="opacity-40 max-w-sm mb-12 font-bold tracking-[0.3em]">
        INITIATE YOUR FIRST SYNTHESIS TO POPULATE THIS LOG.
      </Paragraph>

      {/* CTA Button */}
      <Link
        href="/stamp"
        className="bg-ink text-white px-10 py-4 font-space font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 group hover:shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
      >
        START CREATING
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
