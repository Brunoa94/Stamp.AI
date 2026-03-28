"use client";

import { useTshirtProducts, type TshirtType } from "@/queries/productQueries";
import Image from "next/image";
import clsx from "clsx";
import { Button } from "@/features/ui/button";
import { CheckCircleIcon } from "@/theme/icons";
import { FabricCardSelectorSkeleton } from "./FabricCardSelectorSkeleton";

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
    return <FabricCardSelectorSkeleton />;
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
              "glass-card rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3 text-left transition-all duration-300 flex flex-col h-105",
              "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
              {
                "border-2 border-[#5B21B6] bg-[rgba(124,58,237,0.1)] shadow-xl":
                  isSelected,
                "border-white/40 hover:border-purple-300": !isSelected,
              },
            )}
            aria-pressed={isSelected}
          >
            {/* Fabric Image */}
            {fabric.image && (
              <img
                src={fabric.image}
                alt={fabric.fabricType}
                className="rounded-lg object-cover flex-1 min-h-0"
              />
            )}

            {/* Fabric Title & Selected Indicator */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-xl sm:text-2xl font-heading uppercase tracking-wide text-gray-900 dark:text-white">
                {fabric.fabricType}
              </h3>
              {isSelected && (
                <CheckCircleIcon className="w-6 h-6 text-[#7C3AED] shrink-0 animate-[scaleIn_0.3s_ease-out]" />
              )}
            </div>

            {/* Price Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-[#7C3AED] to-[#6D28D9] text-white">
              <span className="text-base sm:text-lg font-accent font-semibold">
                ${fabric.price.toFixed(2)}
              </span>
            </div>

            {/* Description */}
            {/* <p className="text-sm font-accent italic text-gray-600 dark:text-gray-400 leading-relaxed">
              {fabric.fabricDescription}
            </p> */}
          </Button>
        );
      })}
    </div>
  );
}
