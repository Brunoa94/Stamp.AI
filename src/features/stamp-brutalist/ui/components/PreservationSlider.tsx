"use client";

import { useFormContext } from "react-hook-form";
import { Span } from "@/features/ui/span";
import { Slider } from "@/features/ui/slider";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";

export function PreservationSlider() {
  const { watch, setValue } = useFormContext<StampFormData>();
  const preservation = watch("preservation") || 50;
  const referenceImage = watch("referenceImage");

  if (!referenceImage) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Span variant="default" className="opacity-40">
          Preservation Level
        </Span>
        <Span variant="default" className="text-brandCyan">
          {preservation}%
        </Span>
      </div>

      <Slider
        min={0}
        max={100}
        value={preservation}
        onChange={(e) => setValue("preservation", parseInt(e.target.value))}
        accentColor="cyan"
        size="md"
      />

      <div className="flex justify-between text-[10px] font-bold uppercase font-space">
        <Span variant="micro" className="opacity-40">
          Reimagine
        </Span>
        <Span variant="micro" className="opacity-40">
          Preserve
        </Span>
      </div>
    </div>
  );
}
