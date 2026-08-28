"use client";

import { useTranslations } from "next-intl";
import { Heading } from "@/features/ui/heading";
import { Paragraph } from "@/features/ui/paragraph";
import { Button } from "@/features/ui/button";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";
import { UploadInfo } from "./UploadInfo";

/**
 * UploadContent
 *
 * Right panel content with heading, description, file info, and next button.
 * On mobile, the button is hidden and the action is registered with the
 * sticky footer via useRegisterMobileAction.
 *
 * Navigation logic:
 * - If image uploaded: "Next Step" → goes to synthesis (step 2)
 * - If no image but has cached images: "Proceed with previous photos" → skips to results (step 4)
 * - If neither: button is disabled
 */

interface PropsI {
  hasUploadedImage: boolean;
  hasCachedImages: boolean;
  fileName?: string;
  fileSize?: string;
  onRemoveFile: () => void;
  onNext: () => void;
  onSkipWithCached: () => void;
}

export function UploadContent({
  hasUploadedImage,
  hasCachedImages,
  fileName,
  fileSize,
  onRemoveFile,
  onNext,
  onSkipWithCached,
}: PropsI) {
  const t = useTranslations("stamp.upload");

  // Determine button action and label based on state
  const getButtonConfig = () => {
    if (hasUploadedImage) {
      return {
        action: onNext,
        label: t("next"),
        disabled: false,
      };
    }
    if (hasCachedImages) {
      return {
        action: onSkipWithCached,
        label: t("proceedWithoutUpload"),
        disabled: false,
      };
    }
    return {
      action: onNext,
      label: t("next"),
      disabled: true,
    };
  };

  const buttonConfig = getButtonConfig();

  // Register action for mobile sticky footer (Step 1)
  useRegisterMobileAction(1, {
    action: buttonConfig.action,
    label: buttonConfig.label,
    disabled: buttonConfig.disabled,
  });

  return (
    <div className="p-6 pb-28 md:pb-6 md:p-10 lg:p-16 xl:p-24 flex flex-col justify-center">
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

      <Paragraph
        variant="card"
        className="text-(--color-stamp-taupe) mb-6 md:mb-10 max-w-sm"
      >
        {t("description")}
      </Paragraph>

      {/* File Info Row */}
      {hasUploadedImage && fileName && fileSize && (
        <UploadInfo
          fileName={fileName}
          fileSize={fileSize}
          onRemove={onRemoveFile}
        />
      )}

      {/* Next Button - hidden on mobile, shown in sticky footer */}
      <div className="hidden md:block">
        <Button
          onClick={buttonConfig.action}
          disabled={buttonConfig.disabled}
          className="w-full bg-(--color-stamp-chocolate) text-white hover:bg-(--color-stamp-gold) hover:text-(--color-stamp-chocolate) transition-all duration-300 px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {buttonConfig.label}
        </Button>
      </div>
    </div>
  );
}
