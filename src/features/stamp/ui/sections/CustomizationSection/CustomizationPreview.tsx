import { Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";

/**
 * CustomizationPreview
 *
 * Left panel mockup preview placeholder
 */

export function CustomizationPreview() {
  const t = useTranslations("stamp.customization");

  return (
    <div className="p-12 lg:p-24 flex items-center justify-center bg-white border-r border-(--color-stamp-divider)">
      <div className="w-full max-w-sm aspect-4/5 bg-(--color-stamp-cream)/40 flex items-center justify-center relative">
        <Shirt className="text-9xl text-(--color-stamp-taupe)/10 w-36 h-36" />
        <div className="absolute bottom-8 text-center">
          <Span
            variant="micro"
            className="text-(--color-stamp-taupe) tracking-[0.5em]"
          >
            {t("mockupPreview")}
          </Span>
        </div>
      </div>
    </div>
  );
}
