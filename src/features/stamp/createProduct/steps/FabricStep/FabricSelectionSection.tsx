"use client";

import { RefObject } from "react";
import { FabricCardSelector } from "./FabricCardSelector/FabricCardSelector";
import { ColorSwatchSelector } from "./ColorSwatchSelector";
import { SizeTileSelector } from "./SizeTileSelector/SizeTileSelector";
import { Label } from "@/features/ui/label";
import { CreateProductSelectors } from "../../context/selectors";
import { useCreateProductSubscriberActions } from "../../context/actions";

interface FabricSelectionSectionPropsI {
  sectionRef: RefObject<HTMLElement | null>;
}

export function FabricSelectionSection({
  sectionRef,
}: FabricSelectionSectionPropsI) {
  const selectedTshirt = CreateProductSelectors.selectedTshirt();

  const { handleTshirtSelect: onTshirtSelect } =
    useCreateProductSubscriberActions();

  return (
    <section
      ref={sectionRef}
      className="space-y-12 animate-[slideInUp_1s_ease-out] transform transition-all duration-1000"
      aria-label="Fabric and sizing selection"
    >
      <FabricCardSelector
        onTshirtSelect={onTshirtSelect}
        selectedTshirt={selectedTshirt ?? undefined}
      />

      {/* Color & Size Selection - Show after fabric selected */}
      {selectedTshirt && (
        <div className="space-y-8 animate-[slideInUp_0.5s_ease-out]">
          {/* Color Selection */}
          <div className="space-y-4">
            <Label className="text-2xl sm:text-4xl font-heading uppercase tracking-wide text-purple-700 dark:text-purple-300">
              Pick Your Color
            </Label>
            <ColorSwatchSelector />
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
    </section>
  );
}
