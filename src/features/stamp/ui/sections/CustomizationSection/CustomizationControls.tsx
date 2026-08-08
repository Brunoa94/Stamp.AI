"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Span } from "@/features/ui/span";
import { Button } from "@/features/ui/button";
import { ColorSwatches } from "./ColorSwatches";
import { SizeSelector } from "./SizeSelector";
import { PrintPositionSelector } from "../../components/PrintPositionSelector/PrintPositionSelector";
import { useDesignAdjustment } from "../../../lib/hooks/useDesignAdjustment";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";
import type { SizeType } from "../../../lib/types/stampTypes";

/**
 * CustomizationControls
 *
 * Right panel with customization controls (color/size selection)
 *
 * On desktop: Shows "Create Product" button
 * On mobile flow: Shows color/size + print position selector + "Continue to Preview" button in sticky footer
 */

interface PropsI {
  colors: string[];
  selectedColor?: string;
  sizes: SizeType[];
  selectedSize: SizeType;
  isLoadingColors: boolean;
  hasProduct: boolean;
  canCreate: boolean;
  isFinalizing: boolean;
  onSelectColor: (color: string) => void;
  onSelectSize: (size: SizeType) => void;
  onCreateProduct: () => void;
  // Mobile flow props
  isMobileFlow?: boolean;
  onContinueToPreview?: () => void;
}

export function CustomizationControls({
  colors,
  selectedColor,
  sizes,
  selectedSize,
  isLoadingColors,
  hasProduct,
  canCreate,
  isFinalizing,
  onSelectColor,
  onSelectSize,
  onCreateProduct,
  isMobileFlow = false,
  onContinueToPreview,
}: PropsI) {
  const t = useTranslations("stamp.customization");
  const {
    availablePrintPositions,
    printPositionConfigs,
    togglePrintPosition,
  } = useDesignAdjustment();

  // Check if color and size are selected (for mobile continue button)
  const hasColorSelected = colors.length === 0 || Boolean(selectedColor);
  const hasSizeSelected = sizes.length <= 1 || Boolean(selectedSize);
  const canContinue = hasColorSelected && hasSizeSelected;

  // Register action for mobile sticky footer (Step 6)
  useRegisterMobileAction(6, {
    action: isMobileFlow && onContinueToPreview ? onContinueToPreview : onCreateProduct,
    label: isMobileFlow ? t("continueToPreview") : (isFinalizing ? t("creating") : t("createProduct")),
    disabled: isMobileFlow ? !canContinue : !canCreate,
    loading: !isMobileFlow && isFinalizing,
  });

  return (
    <div className="p-6 pt-24 pb-28 md:pb-6 md:p-10 md:pt-10 lg:p-16 xl:p-24 flex flex-col justify-center bg-white">
      <Heading
        as="h2"
        variant="panelTitle"
        className="text-(--color-stamp-chocolate) mb-4 md:mb-6"
      >
        {t.rich("title", {
          accent: (chunks) => (
            <span className="font-serif italic lowercase font-light text-(--color-stamp-taupe)">
              {chunks}
            </span>
          ),
        })}
      </Heading>

      <div className="space-y-6 md:space-y-12 mb-8 md:mb-12">
        {/* Only show color swatches if colors are available */}
        {colors.length > 0 && (
          <ColorSwatches
            colors={colors}
            selectedColor={selectedColor}
            isLoading={isLoadingColors}
            hasProduct={hasProduct}
            onSelectColor={onSelectColor}
          />
        )}

        {/* Only show size selector if there's more than one size option */}
        {sizes.length > 1 ? (
          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSelectSize={onSelectSize}
          />
        ) : sizes.length === 1 ? (
          <div>
            <Span
              variant="micro"
              className="text-[10px] font-bold uppercase tracking-widest text-(--color-stamp-taupe) block mb-2"
            >
              {t("sizeLabel")}
            </Span>
            <Span variant="sm" className="text-(--color-stamp-chocolate)">
              {sizes[0]}
            </Span>
          </div>
        ) : null}

        {/* Mobile flow: Show print position selector here */}
        {isMobileFlow && availablePrintPositions.length > 0 && (
          <PrintPositionSelector
            availablePositions={availablePrintPositions}
            printPositionConfigs={printPositionConfigs}
            onTogglePosition={togglePrintPosition}
            disabled={isFinalizing}
          />
        )}
      </div>

      {/* Buttons - hidden on mobile, shown in sticky footer */}
      <div className="hidden md:block">
        {isMobileFlow && onContinueToPreview ? (
          // Mobile flow: Continue to Preview button (only shown on tablet+)
          <Button
            onClick={onContinueToPreview}
            disabled={!canContinue}
            className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("continueToPreview")}
            <ArrowRight className="w-5 h-5" />
          </Button>
        ) : (
          // Desktop: Create Product button
          <Button
            onClick={onCreateProduct}
            disabled={!canCreate}
            className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isFinalizing ? t("creating") : t("createProduct")}
          </Button>
        )}
      </div>
    </div>
  );
}
