import { Sparkles } from "lucide-react";
import { Span } from "@/features/ui/span";

/**
 * SynthesisVisual
 *
 * Left panel visual indicator for synthesis readiness
 */

export function SynthesisVisual() {
  return (
    <div className="p-12 lg:p-24 bg-white flex items-center justify-center border-r border-(--color-stamp-divider)">
      <div className="max-w-md w-full p-12 bg-(--color-stamp-cream)/30 border border-(--color-stamp-divider)">
        <Sparkles className="text-6xl text-(--color-stamp-gold)/20 mb-6 w-16 h-16" />
        <Span variant="default" className="text-(--color-stamp-taupe)">
          Engine Ready
        </Span>
      </div>
    </div>
  );
}
