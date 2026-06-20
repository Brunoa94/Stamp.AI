
"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { getColorClass } from "@/helpers/colors/colorMapping";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";

interface ColorVariant {
  title: string;
  colors: string[];
  is_available: boolean;
}

interface ColorSwatchGridProps {
  colors: ColorVariant[];
}

function ColorSwatchButton({
  variant,
  isSelected,
  onSelect,
}: {
  variant: ColorVariant;
  isSelected: boolean;
  onSelect: (color: string) => void;
}) {
  const colorClass = getColorClass(variant.title);
  if (!colorClass) return null;

  return (
    <Button
      key={variant.title}
      type="button"
      onClick={() => {
        if (variant.is_available) {
          onSelect(variant.title);
        }
      }}
      disabled={!variant.is_available}
      size="icon"
      aria-label={variant.title}
      variant="ghost"
      className={cn(
        "w-16 h-16 rounded-full border-4 border-white shadow-xl transition-all duration-300",
        "hover:scale-110 hover:shadow-2xl",
        colorClass,
        isSelected && "ring-4 ring-brandCyan scale-110",
        !variant.is_available &&
          "opacity-40 cursor-not-allowed disabled:hover:scale-100",
      )}
      title={variant.title}
    />
  );
}

export function ColorSwatchGrid({ colors }: ColorSwatchGridProps) {
  const { watch, setValue } = useFormContext<StampFormData>();
  const selectedColor = watch("selectedColor");

  if (!colors || colors.length === 0) {
    return (
      <div className="text-center py-8">
        <Span variant="default" className="opacity-40">
          No colors available
        </Span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Span variant="default" className="opacity-40 uppercase">
        Garment Tone
      </Span>

      <div className="flex flex-wrap gap-4">
        {colors.map((variant) => (
          <ColorSwatchButton
            key={variant.title}
            variant={variant}
            isSelected={selectedColor === variant.title}
            onSelect={(color) => setValue("selectedColor", color)}
          />
        ))}
      </div>
    </div>
  );
}
