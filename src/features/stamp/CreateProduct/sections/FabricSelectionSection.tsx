"use client";

import { RefObject } from "react";
import clsx from "clsx";
import { FabricCardSelector } from "../steps/FabricStep/FabricCardSelector/FabricCardSelector";
import { MemoizedColorSwatchSelector } from "../steps/FabricStep/ColorSwatchSelector";
import { SizeTileSelector } from "../steps/FabricStep/SizeTileSelector/SizeTileSelector";
import { Label } from "@/features/ui/label";
import { CreateProductSelectors } from "../context/selectors";
import { useCreateProductSubscriberActions } from "../context/actions";

interface FabricSelectionSectionProps {
  sectionRef: RefObject<HTMLElement | null>;
}

export function FabricSelectionSection({
  sectionRef,
}: FabricSelectionSectionProps) {
  const selectedTshirt = CreateProductSelectors.selectedTshirt();

  const { handleTshirtSelect: onTshirtSelect } =
    useCreateProductSubscriberActions();

  return (
    <section
      ref={sectionRef}
      className="space-y-12 animate-[slideInUp_1s_ease-out] transform transition-all duration-1000"
      aria-label="Fabric and sizing selection"
    >
      {!selectedTshirt && (
        <FabricCardSelector
          onTshirtSelect={onTshirtSelect}
          selectedTshirt={selectedTshirt ?? undefined}
        />
      )}

      {/* Color & Size Selection - Reveal with slide transition after t-shirt selection */}
      <div
        className={clsx(
          "overflow-hidden transition-all duration-500 ease-out",
          selectedTshirt
            ? "max-h-225 opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none",
        )}
        aria-hidden={!selectedTshirt}
      >
        {selectedTshirt && (
          <div className="space-y-8 pt-2 px-2 sm:px-4 animate-[slideInUp_0.45s_ease-out] pb-8">
            {/* Color Selection */}
            <div className="space-y-4">
              <Label className="text-2xl sm:text-4xl font-heading uppercase tracking-wide text-purple-700 dark:text-purple-300">
                Pick Your Color
              </Label>
              <MemoizedColorSwatchSelector />
            </div>

            {/* Size Selection */}
            <div className="space-y-4">
              <Label className="text-2xl sm:text-4xl font-heading uppercase tracking-wide text-purple-700 dark:text-purple-300">
                Select Your Size
              </Label>
              <SizeTileSelector />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
