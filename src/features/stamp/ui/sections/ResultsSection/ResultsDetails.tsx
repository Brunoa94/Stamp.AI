import { Check, Layers, Palette, Zap } from "lucide-react";
import { Span } from "@/features/ui/span";

/**
 * ResultsDetails
 *
 * Shows details about the generated design with feature indicators
 */

interface PropsI {
  prompt?: string;
}

export function ResultsDetails({ prompt }: PropsI) {
  const features = [
    { icon: Zap, label: "AI Enhanced" },
    { icon: Palette, label: "Print Ready" },
    { icon: Layers, label: "High Resolution" },
    { icon: Check, label: "Quality Verified" },
  ];

  return (
    <div className="mb-10">
      {prompt && (
        <div className="mb-6 p-4 bg-white border border-(--color-stamp-divider) rounded-lg">
          <Span
            variant="micro"
            className="text-(--color-stamp-taupe) mb-2 block uppercase tracking-widest"
          >
            Applied Prompt
          </Span>
          <Span
            variant="sm"
            className="text-(--color-stamp-chocolate) line-clamp-2"
          >
            {prompt}
          </Span>
        </div>
      )}
    </div>
  );
}
