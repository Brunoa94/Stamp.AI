"use client";

import { Shirt } from "lucide-react";
import { useTranslations } from "next-intl";
import { Span } from "@/features/ui/span";
import {
  useStampFinalization,
  useStampSelectedImage,
} from "../../../lib/hooks/useStampSelectors";
import { DesignAdjustmentPanel } from "../../components/DesignAdjustmentPanel/DesignAdjustmentPanel";

/**
 * CustomizationPreview
 *
 * Left panel of Step 6. Interactive design adjustment: print positions,
 * live placement preview, and move/size/rotation controls. Falls back to an
 * empty state when no design has been selected yet.
 */

export function CustomizationPreview() {
  const t = useTranslations("stamp.adjust");
  const { selectedImageUrl } = useStampSelectedImage();
  const { isFinalizing } = useStampFinalization();

  return (
    <div className="p-12 lg:p-24 lg:px-16 flex items-center justify-center bg-white border-r border-(--color-stamp-divider)">
      {selectedImageUrl ? (
        <DesignAdjustmentPanel
          imageUrl={selectedImageUrl}
          disabled={isFinalizing}
        />
      ) : (
        <div className="w-full max-w-sm aspect-4/5 bg-(--color-stamp-cream)/40 flex flex-col items-center justify-center gap-4">
          <Shirt className="h-24 w-24 text-(--color-stamp-taupe)/10" />
          <div className="px-8 text-center">
            <Span
              variant="micro"
              className="mb-2 block tracking-[0.3em] text-(--color-stamp-taupe)"
            >
              {t("noImageTitle")}
            </Span>
            <Span
              variant="micro"
              className="block text-[9px] normal-case tracking-normal text-(--color-stamp-taupe)/60"
            >
              {t("noImageBody")}
            </Span>
          </div>
        </div>
      )}
    </div>
  );
}
