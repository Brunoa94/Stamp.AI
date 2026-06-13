"use client";

import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/features/ui/button";
import type { StampFormData } from "../../lib/schemas/stampFormSchema";
import { ART_STYLES } from "../../lib/constants/stampSteps";

export function StyleSelector() {
  const { watch, setValue } = useFormContext<StampFormData>();
  const artStyle = watch('artStyle');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {ART_STYLES.map((style) => (
        <Button
          key={style.id}
          type="button"
          onClick={() => setValue('artStyle', style.id)}
          className={cn(
            "h-auto rounded-none border border-ink/10 py-3 text-[10px] font-bold tracking-widest uppercase hover:bg-ink hover:text-white transition-all font-space",
            artStyle === style.id
              ? "bg-brandCyan text-ink shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              : "bg-white text-ink"
          )}
        >
          {style.label}
        </Button>
      ))}
    </div>
  );
}
