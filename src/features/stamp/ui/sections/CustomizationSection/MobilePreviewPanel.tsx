"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/features/ui/button";
import { useStampSelectedImage } from "../../../lib/hooks/useStampSelectors";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";
import { DesignAdjustmentPanel } from "../../components/DesignAdjustmentPanel/DesignAdjustmentPanel";
import { EmptyDesignState } from "./EmptyDesignState";
import { StampStepTitle } from "../../components/StampStepTitle";
import { StampTitleAccent } from "../../components/StampTitleAccent";

/**
 * MobilePreviewPanel
 *
 * Mobile flow layout for Step 6 preview sub-step. Shows title, design preview
 * with adjuster only (no position selector), and create button in sticky footer.
 */

interface PropsI {
  canCreate: boolean;
  isFinalizing: boolean;
  onCreateProduct: () => void;
}

export function MobilePreviewPanel({
  canCreate,
  isFinalizing,
  onCreateProduct,
}: PropsI) {
  const t = useTranslations("stamp.customization");
  const { selectedImageUrl } = useStampSelectedImage();

  // Register action for mobile sticky footer (Step 6 - preview sub-step)
  useRegisterMobileAction(6, {
    action: onCreateProduct,
    label: isFinalizing ? t("creating") : t("createProduct"),
    disabled: !canCreate,
    loading: isFinalizing,
  });

  return (
    <div className="p-6 pt-24 pb-40 flex flex-col bg-(--color-stamp-white) min-h-full">
      {/* Title */}
      <StampStepTitle className="mb-6 md:mb-6">
        {t.rich("previewTitle", {
          accent: (chunks) => <StampTitleAccent>{chunks}</StampTitleAccent>,
        })}
      </StampStepTitle>

      {/* Design preview and adjuster (no position selector) */}
      <div className="flex-1 flex flex-col">
        {selectedImageUrl ? (
          <div className="w-full">
            <DesignAdjustmentPanel
              imageUrl={selectedImageUrl}
              disabled={isFinalizing}
              mobilePreviewOnly
            />
          </div>
        ) : (
          <EmptyDesignState className="w-full max-w-sm mx-auto" />
        )}
      </div>

      {/* Create Product button - hidden on mobile, shown in sticky footer */}
      <div className="hidden md:block mt-6">
        <Button
          variant="primary"
          onClick={onCreateProduct}
          disabled={!canCreate}
          className="w-full"
        >
          {isFinalizing ? t("creating") : t("createProduct")}
        </Button>
      </div>
    </div>
  );
}
