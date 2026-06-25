"use client";

import { useTshirtProducts, type TshirtType } from "@/queries/productQueries";
import clsx from "clsx";
import { Button } from "@/features/ui/button";
import { CheckCircleIcon } from "@/theme/icons";
import { FabricCardSelectorSkeleton } from "./FabricCardSelectorSkeleton";
import { BlueprintImagesDialog } from "./BlueprintImagesDialog";
import { useState } from "react";
import {
  FABRIC_TYPE_NAMES,
  FABRIC_DESCRIPTIONS,
} from "../../../../lib/constants/fabricTypes";

interface FabricCardSelectorProps {
  onTshirtSelect: (tshirt: TshirtType) => void;
  selectedTshirt?: TshirtType;
  countryCode?: string; // User's country for pricing
}

export function FabricCardSelector({
  onTshirtSelect,
  selectedTshirt,
  countryCode = "NL", // Default to Netherlands
}: FabricCardSelectorProps) {
  const { data: tshirtProducts = [], isLoading } = useTshirtProducts();
  const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
  const [selectedFabricForImages, setSelectedFabricForImages] =
    useState<TshirtType | null>(null);

  if (isLoading) {
    return <FabricCardSelectorSkeleton />;
  }

  // Map tshirt products to fabric types
  const fabricOptions = tshirtProducts.map((tshirt, index) => {
    return {
      ...tshirt,
      fabricType: FABRIC_TYPE_NAMES[index] || tshirt.name,
      fabricDescription: FABRIC_DESCRIPTIONS[index] || tshirt.description,
      // Price already included in tshirtProduct from catalog
    };
  });

  return (
    <>
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
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
                <div className="relative flex-1 min-h-0">
                  <img
                    src={fabric.image}
                    alt={fabric.fabricType}
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
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
                  {fabric.price > 0
                    ? `$${fabric.price.toFixed(2)}`
                    : "Loading..."}
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

      {/* Blueprint Images Dialog */}
      {selectedFabricForImages && (
        <BlueprintImagesDialog
          isOpen={imagesDialogOpen}
          onClose={() => setImagesDialogOpen(false)}
          images={selectedFabricForImages.images || []}
          title={selectedFabricForImages.name}
          description={selectedFabricForImages.description}
        />
      )}
    </>
  );
}
