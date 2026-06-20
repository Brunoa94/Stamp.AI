
"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import { Span } from "@/features/ui/span";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";

type SizeOptionType = {
  title: string;
  is_available: boolean;
};

interface SizeTileGridProps {
  sizes: SizeOptionType[];
}

function SizeTileButton({
  size,
  isSelected,
  onSelect,
}: {
  size: SizeOptionType;
  isSelected: boolean;
  onSelect: (size: string) => void;
}) {
  return (
    <Button
      type="button"
      onClick={() => {
        if (size.is_available) {
          onSelect(size.title);
        }
      }}
      disabled={!size.is_available}
      className={cn(
        "h-auto rounded-none border-2 py-4 font-anton text-lg tracking-wider uppercase transition-all",
        isSelected
          ? "bg-brandCyan text-ink border-brandCyan shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          : "bg-white text-ink border-ink/10 hover:bg-ink hover:text-white",
        !size.is_available &&
          "opacity-30 cursor-not-allowed hover:bg-white hover:text-ink",
      )}
    >
      {size.title}
    </Button>
  );
}

export function SizeTileGrid({ sizes }: SizeTileGridProps) {
  const { watch, setValue } = useFormContext<StampFormData>();
  const selectedSize = watch("selectedSize");

  if (!sizes || sizes.length === 0) {
    return (
      <div className="text-center py-8">
        <Span variant="default" className="opacity-40">
          No sizes available
        </Span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
      {sizes.map((size) => (
        <SizeTileButton
          key={size.title}
          size={size}
          isSelected={selectedSize === size.title}
          onSelect={(s) => setValue("selectedSize", s)}
        />
      ))}
    </div>
  );
}
