"use client";

import { useTranslations } from "next-intl";
import { Paragraph } from "@/features/ui/paragraph";
import { Button } from "@/features/ui/button";
import { useRegisterMobileAction } from "../../../lib/hooks/useMobileStepAction";
import { UploadInfo } from "./UploadInfo";
import { SplitToneText } from "../../components/SplitToneText";
import { StampStepTitle } from "../../components/StampStepTitle";
import { StampTitleAccent } from "../../components/StampTitleAccent";

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
    // Allow proceeding to step 2 even without uploaded/cached images
    // User can still enter a prompt on step 2 and generate images
    return {
      action: onNext,
      label: t("skipUpload"),
      disabled: false,
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
      {/* Title and description switch to light colours where they cross onto the backdrop photo */}
      <StampStepTitle>
        {t.rich("title", {
          accent: (chunks) => <StampTitleAccent>{chunks}</StampTitleAccent>,
        })}
      </StampStepTitle>

      <Paragraph variant="card" className="mb-6 md:mb-10 max-w-sm">
        <SplitToneText tone="muted" className="block">
          {t("description")}
        </SplitToneText>
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
          variant="primary"
          onClick={buttonConfig.action}
          disabled={buttonConfig.disabled}
          className="w-full"
        >
          {buttonConfig.label}
        </Button>
      </div>
    </div>
  );
}
