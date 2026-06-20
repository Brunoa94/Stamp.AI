"use client";

import { useEffect, useRef } from "react";
import { Controller } from "react-hook-form";
import { scrollToIdWithOffset } from "@/utils/scrollToElementWithOffset";
import { MemoizedWizardUploadArea } from "../../components/WizardUploadArea";
import { CreateProductSelectors } from "@/features/stamp/CreateProduct/lib/context/selectors";
import { useCreateProductSubscriberActions } from "@/features/stamp/CreateProduct/lib/context/actions";

export function UploadStep() {
  const form = CreateProductSelectors.form();
  const currentStep = CreateProductSelectors.currentStep();
  const hasUploadedImage = CreateProductSelectors.hasUploadedImage();
  const { handleRemoveImage } = useCreateProductSubscriberActions();
  const wasUploadedRef = useRef(false);

  useEffect(() => {
    const justUploaded = hasUploadedImage && !wasUploadedRef.current;
    const isUploadStage = currentStep === "upload" || currentStep === "form";

    if (!justUploaded || !isUploadStage) {
      wasUploadedRef.current = hasUploadedImage;
      return;
    }

    const cleanup = scrollToIdWithOffset("wizard-continue-button", 100, {
      enableCorrectionPass: false,
    });
    wasUploadedRef.current = hasUploadedImage;

    return () => {
      cleanup();
      wasUploadedRef.current = hasUploadedImage;
    };
  }, [hasUploadedImage, currentStep]);

  if (!form) {
    return null;
  }

  const { control } = form;

  return (
    <div className="h-full flex flex-col animate-[slideIn_0.5s_ease-out]">
      <Controller
        name="image"
        control={control}
        render={({ field: { onChange, value } }) => (
          <MemoizedWizardUploadArea
            onImageUpload={onChange}
            uploadedImage={value}
            onRemoveImage={handleRemoveImage}
          />
        )}
      />
    </div>
  );
}
