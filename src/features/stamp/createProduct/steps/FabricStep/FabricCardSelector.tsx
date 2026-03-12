"use client";

import { useTshirtProducts, type TshirtType } from "@/queries/productQueries";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { Button } from "@/features/ui/button";

interface FabricCardSelectorProps {
  onTshirtSelect: (tshirt: TshirtType) => void;
  selectedTshirt?: TshirtType;
}

export function FabricCardSelector({
  onTshirtSelect,
  selectedTshirt,
}: FabricCardSelectorProps) {
  const { data: tshirtProducts = [], isLoading } = useTshirtProducts();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="glass-card rounded-xl p-6 space-y-4 animate-pulse"
          >
            <div className="aspect-4/3 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Map tshirt products to fabric types
  // For now, show first two products as Premium/Organic options
  const fabricOptions = tshirtProducts.slice(0, 2).map((tshirt, index) => ({
    ...tshirt,
    fabricType: index === 0 ? "Premium Cotton" : "Organic Cotton",
    fabricDescription:
      index === 0
        ? "Ultra-soft combed cotton. Breathable, durable, and designed for superior comfort."
        : "Eco-friendly, GOTS certified cotton. Gentle on your skin and even gentler on the planet.",
    price: index === 0 ? 29.99 : 34.99,
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {fabricOptions.map((fabric) => {
        const isSelected = selectedTshirt?.id === fabric.id;
        return (
          <Button
            key={fabric.id}
            type="button"
            variant="ghost"
            onClick={() => onTshirtSelect(fabric)}
            className={clsx(
              "glass-card rounded-xl p-6 space-y-4 text-left transition-all duration-300 h-40",
              "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
              {
                "border-[#7C3AED] bg-[rgba(124,58,237,0.1)] shadow-xl ring-2 ring-[#7C3AED]":
                  isSelected,
                "border-white/40 hover:border-purple-300": !isSelected,
              },
            )}
            aria-pressed={isSelected}
          >
            {/* Fabric Image */}
            {fabric.image && (
              <div
                className="relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                style={{ aspectRatio: "4/3" }}
              >
                <Image
                  src={fabric.image}
                  alt={fabric.fabricType}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}

            {/* Fabric Title & Selected Indicator */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-3xl font-heading uppercase tracking-wide text-gray-900 dark:text-white">
                {fabric.fabricType}
              </h3>
              {isSelected && (
                <CheckCircle2 className="w-6 h-6 text-[#7C3AED] shrink-0 animate-[scaleIn_0.3s_ease-out]" />
              )}
            </div>

            {/* Price Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-[#7C3AED] to-[#6D28D9] text-white">
              <span className="text-2xl font-accent font-semibold">
                ${fabric.price.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm font-accent italic text-gray-600 dark:text-gray-400 leading-relaxed">
              {fabric.fabricDescription}
            </p>
          </Button>
        );
      })}
    </div>
  );
}
