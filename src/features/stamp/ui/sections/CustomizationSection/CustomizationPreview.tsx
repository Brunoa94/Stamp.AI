import { Shirt } from "lucide-react";
import { Span } from "@/features/ui/span";

/**
 * CustomizationPreview
 *
 * Left panel mockup preview placeholder
 */

export function CustomizationPreview() {
  return (
    <div className="p-12 lg:p-24 flex items-center justify-center bg-white border-r border-(--color-stamp-divider)">
      <div className="w-full max-w-sm aspect-4/5 bg-(--color-stamp-cream)/40 flex items-center justify-center relative">
        <Shirt className="text-9xl text-(--color-stamp-taupe)/10 w-36 h-36" />
        <div className="absolute bottom-8 text-center">
          <Span
            variant="micro"
            className="text-(--color-stamp-taupe) tracking-[0.5em]"
          >
            Mockup Preview
          </Span>
        </div>
      </div>
    </div>
  );
}
